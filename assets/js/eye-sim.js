/* ==========================================================================
   Human Eye Optics & Biophysics of Vision — Interactive Simulations
   1. Eye Ray-Tracing & Optical Accommodation Lab (Normal, Myopia, Hyperopia, Corrective Lenses)
   2. Molecular Phototransduction & Trichromatic Color Lab (11-cis Retinal Switch & S/M/L Cones)
   ========================================================================== */

(function () {
  /* ========================================================================
     1. EYE RAY-TRACING & OPTICAL ACCOMMODATION SIMULATOR
     ======================================================================== */
  function initEyeOpticsSim() {
    const canvas = document.getElementById("eye-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const distSlider = document.getElementById("obj-dist-slider");
    const distVal = document.getElementById("obj-dist-val");
    const pupilSlider = document.getElementById("pupil-slider");
    const pupilVal = document.getElementById("pupil-val");
    const defectSelect = document.getElementById("defect-select");
    const correctBtn = document.getElementById("correct-btn");
    const readout = document.getElementById("optics-readout");

    let objDistance = 320; // px to the left of cornea (simulates ~25cm to infinity)
    let pupilRadius = 24;  // px aperture radius (simulates 2mm to 8mm)
    let defect = "normal"; // 'normal' | 'myopia' | 'hyperopia'
    let hasCorrection = false;
    let time = 0;

    // Eye Geometry on Canvas (canvas width=820, height=380)
    const eyeCenter = { x: 570, y: 190 };
    const eyeRadius = 145; // eyeball sphere radius
    const corneaApex = { x: eyeCenter.x - eyeRadius - 20, y: eyeCenter.y }; // ~405
    const lensCenter = { x: eyeCenter.x - eyeRadius + 32, y: eyeCenter.y }; // ~457
    const retinaX = eyeCenter.x + eyeRadius - 12; // ~703 (for normal eye)

    function getRetinaX() {
      if (defect === "myopia") return retinaX + 38; // eyeball too long
      if (defect === "hyperopia") return retinaX - 32; // eyeball too short
      return retinaX;
    }

    function getLensFocalLength() {
      // Natural accommodation: closer object -> thicker lens -> shorter focal length
      // Distant object -> relaxed lens -> longer focal length
      const normDist = Math.max(80, Math.min(500, objDistance));
      let baseF = 185 + (normDist / 500) * 45;

      if (defect === "myopia" && !hasCorrection) {
        baseF -= 38; // overly strong refraction
      } else if (defect === "hyperopia" && !hasCorrection) {
        baseF += 32; // insufficiently strong refraction
      }
      return baseF;
    }

    if (distSlider) {
      distSlider.addEventListener("input", () => {
        objDistance = parseFloat(distSlider.value);
        if (distVal) {
          const meters = (objDistance / 80).toFixed(1);
          distVal.textContent = objDistance > 450 ? "Infinity (Far)" : `${meters} m`;
        }
      });
    }

    if (pupilSlider) {
      pupilSlider.addEventListener("input", () => {
        pupilRadius = parseFloat(pupilSlider.value);
        if (pupilVal) {
          const mm = (2 + ((pupilRadius - 12) / 28) * 6).toFixed(1);
          pupilVal.textContent = `${mm} mm`;
        }
      });
    }

    if (defectSelect) {
      defectSelect.addEventListener("change", () => {
        defect = defectSelect.value;
        hasCorrection = false;
        if (correctBtn) {
          correctBtn.textContent = defect === "normal" ? "Glasses Not Needed" : "👓 Apply Corrective Lens";
          correctBtn.disabled = defect === "normal";
          correctBtn.classList.remove("active");
        }
      });
    }

    if (correctBtn) {
      correctBtn.addEventListener("click", () => {
        if (defect === "normal") return;
        hasCorrection = !hasCorrection;
        correctBtn.classList.toggle("active", hasCorrection);
        correctBtn.textContent = hasCorrection
          ? defect === "myopia" ? "👓 Diverging (Concave) Lens On" : "👓 Converging (Convex) Lens On"
          : "👓 Apply Corrective Lens";
      });
    }

    function drawEyeball(actualRetinaX, fLen) {
      // Eyeball Sclera & Vitreous Body
      ctx.save();
      ctx.beginPath();
      // Outer eyeball contour with cornea bulge
      const rx = (actualRetinaX - (corneaApex.x + 20)) * 0.5;
      const cx = corneaApex.x + 20 + rx;
      const cy = eyeCenter.y;
      ctx.ellipse(cx, cy, rx, eyeRadius, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#0c1527";
      ctx.fill();
      ctx.strokeStyle = "rgba(148, 163, 184, 0.4)";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Retina layer (curved inner back wall)
      ctx.beginPath();
      ctx.arc(cx - 10, cy, rx + 2, -Math.PI * 0.38, Math.PI * 0.38);
      ctx.strokeStyle = "#f43f5e"; // photoreceptor layer pink-red
      ctx.lineWidth = 5;
      ctx.stroke();

      // Fovea centralis pip
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.arc(actualRetinaX - 4, eyeCenter.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fef3c7";
      ctx.font = "10px Inter, sans-serif";
      ctx.fillText("Fovea", actualRetinaX - 38, eyeCenter.y - 8);

      // Optic nerve exit
      ctx.fillStyle = "#1e293b";
      ctx.beginPath();
      ctx.fillRect(actualRetinaX - 8, eyeCenter.y + 35, 45, 24);
      ctx.fillStyle = "#94a3b8";
      ctx.fillText("Optic Nerve", actualRetinaX + 6, eyeCenter.y + 51);

      // Cornea (curved transparent dome in front)
      ctx.beginPath();
      ctx.arc(corneaApex.x + 35, corneaApex.y, 48, -Math.PI * 0.38, Math.PI * 0.38);
      ctx.strokeStyle = "rgba(56, 189, 248, 0.85)";
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.fillStyle = "rgba(56, 189, 248, 0.75)";
      ctx.fillText("Cornea (43D)", corneaApex.x - 30, corneaApex.y - 58);

      // Iris & Pupil aperture
      ctx.strokeStyle = "#0284c7"; // iris color
      ctx.lineWidth = 5;
      // Upper iris
      ctx.beginPath();
      ctx.moveTo(lensCenter.x - 14, eyeCenter.y - eyeRadius * 0.65);
      ctx.lineTo(lensCenter.x - 14, eyeCenter.y - pupilRadius);
      ctx.stroke();
      // Lower iris
      ctx.beginPath();
      ctx.moveTo(lensCenter.x - 14, eyeCenter.y + eyeRadius * 0.65);
      ctx.lineTo(lensCenter.x - 14, eyeCenter.y + pupilRadius);
      ctx.stroke();

      // Crystalline Lens (biconvex)
      const lensThick = 12 + (1 - Math.min(1, objDistance / 450)) * 12; // bulges thicker when accommodating for near vision!
      ctx.beginPath();
      ctx.ellipse(lensCenter.x, lensCenter.y, lensThick, pupilRadius + 18, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(125, 211, 252, 0.28)";
      ctx.fill();
      ctx.strokeStyle = "rgba(125, 211, 252, 0.8)";
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.fillStyle = "#bae6fd";
      ctx.fillText("Lens", lensCenter.x - 12, eyeCenter.y + pupilRadius + 32);

      // Corrective eyeglasses lens in front of eye if active
      if (hasCorrection) {
        const glassX = corneaApex.x - 35;
        ctx.strokeStyle = "#a78bfa";
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        if (defect === "myopia") {
          // Diverging (concave) lens
          ctx.arc(glassX + 16, eyeCenter.y, 40, -Math.PI * 0.3, Math.PI * 0.3);
          ctx.stroke();
          ctx.fillStyle = "#c4b5fd";
          ctx.fillText("Concave (Diverging) Lens", glassX - 70, eyeCenter.y - 55);
        } else if (defect === "hyperopia") {
          // Converging (convex) lens
          ctx.arc(glassX - 16, eyeCenter.y, 40, -Math.PI * 0.3, Math.PI * 0.3);
          ctx.stroke();
          ctx.fillStyle = "#c4b5fd";
          ctx.fillText("Convex (Converging) Lens", glassX - 70, eyeCenter.y - 55);
        }
      }

      ctx.restore();
    }

    function drawRays(actualRetinaX, fLen) {
      const objX = corneaApex.x - objDistance;
      const objTop = eyeCenter.y - 65;
      const objBot = eyeCenter.y + 65;

      // Draw Object (an illuminating upright arrow)
      ctx.save();
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(objX, objBot);
      ctx.lineTo(objX, objTop);
      ctx.lineTo(objX - 8, objTop + 14);
      ctx.moveTo(objX, objTop);
      ctx.lineTo(objX + 8, objTop + 14);
      ctx.stroke();
      ctx.fillStyle = "#fbbf24";
      ctx.font = "11px JetBrains Mono, monospace";
      ctx.fillText("Object", objX - 18, objTop - 10);

      // Optical Axis
      ctx.strokeStyle = "rgba(148, 163, 184, 0.18)";
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(30, eyeCenter.y);
      ctx.lineTo(canvas.width - 20, eyeCenter.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Calculate where rays converge (Focus Point)
      // Standard thin lens equation: 1/f = 1/do + 1/di => di = (do * f) / (do - f)
      const doLens = Math.max(60, lensCenter.x - objX);
      const di = (doLens * fLen) / Math.max(1, doLens - fLen);
      const focusX = lensCenter.x + di;
      const focusY = eyeCenter.y;

      // Inverted image height at focusX
      const mag = -di / doLens;
      const imgTop = eyeCenter.y + (objTop - eyeCenter.y) * mag;
      const imgBot = eyeCenter.y + (objBot - eyeCenter.y) * mag;

      // Ray colors (Amber from tip, Cyan from base/center)
      const rayPairs = [
        { origY: objTop, color: "rgba(251, 191, 36, 0.8)", targetImgY: imgTop },
        { origY: eyeCenter.y, color: "rgba(56, 189, 248, 0.8)", targetImgY: eyeCenter.y },
        { origY: objBot, color: "rgba(52, 211, 153, 0.8)", targetImgY: imgBot },
      ];

      rayPairs.forEach(({ origY, color, targetImgY }) => {
        // Trace 3 rays per point: upper pupil edge, center lens, lower pupil edge
        const apertures = [
          eyeCenter.y - pupilRadius * 0.85,
          eyeCenter.y,
          eyeCenter.y + pupilRadius * 0.85,
        ];

        apertures.forEach((pupilY) => {
          ctx.strokeStyle = color;
          ctx.lineWidth = 1.4;
          ctx.beginPath();

          // Segment 1: Object to Cornea / Lens entry
          ctx.moveTo(objX, origY);
          const enterX = lensCenter.x;
          ctx.lineTo(enterX, pupilY);

          // Segment 2: Lens through interior to Retina (or stopping at focus if focus before retina)
          // Line equation from (enterX, pupilY) to (focusX, targetImgY)
          const slope = (targetImgY - pupilY) / (focusX - enterX);
          const endX = actualRetinaX;
          const endY = pupilY + slope * (endX - enterX);
          ctx.lineTo(endX, endY);
          ctx.stroke();
        });
      });

      // Draw inverted real image on the retina
      const blurRadius = Math.abs(focusX - actualRetinaX) * 0.18;
      ctx.strokeStyle = blurRadius > 3 ? "rgba(251, 191, 36, 0.45)" : "#fbbf24";
      ctx.lineWidth = blurRadius > 3 ? 5 + blurRadius : 3;
      ctx.beginPath();
      ctx.moveTo(actualRetinaX - 2, imgBot);
      ctx.lineTo(actualRetinaX - 2, imgTop);
      ctx.lineTo(actualRetinaX + 6, imgTop - 10);
      ctx.moveTo(actualRetinaX - 2, imgTop);
      ctx.lineTo(actualRetinaX - 10, imgTop - 10);
      ctx.stroke();

      ctx.fillStyle = blurRadius > 3 ? "#f87171" : "#34d399";
      ctx.font = "11px Inter, sans-serif";
      const focusStatus = blurRadius <= 2.5
        ? "✓ Sharp Inverted Image on Retina"
        : focusX < actualRetinaX
        ? `Blurry (Focused ${Math.round(actualRetinaX - focusX)} px in front of retina)`
        : `Blurry (Focused ${Math.round(focusX - actualRetinaX)} px behind retina)`;
      ctx.fillText(focusStatus, actualRetinaX - 210, eyeCenter.y + eyeRadius - 12);

      // Readout text update
      if (readout) {
        const corneaPower = "43 Diopters (Fixed ~70% of focusing)";
        const lensPower = `${(15 + (1 - Math.min(1, objDistance / 450)) * 10).toFixed(0)} Diopters (Dynamic accommodation)`;
        const stateText =
          defect === "normal"
            ? "Emmetropia (Normal 20/20 vision)"
            : defect === "myopia"
            ? hasCorrection ? "Myopia corrected with Diverging Lens" : "Myopia (Nearsighted: eyeball too long)"
            : hasCorrection ? "Hyperopia corrected with Converging Lens" : "Hyperopia (Farsighted: eyeball too short)";

        readout.innerHTML =
          `<span>Condition: <strong>${stateText}</strong></span>` +
          `<span>Cornea Power: <strong>${corneaPower}</strong></span>` +
          `<span>Crystalline Lens: <strong>${lensPower}</strong></span>` +
          `<span>Retina Image: <strong>Inverted (Brain Flips Upright)</strong></span>`;
      }

      ctx.restore();
    }

    function frame() {
      time++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background subtle grid
      ctx.strokeStyle = "rgba(148, 163, 184, 0.05)";
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      const actualRetinaX = getRetinaX();
      const fLen = getLensFocalLength();

      drawEyeball(actualRetinaX, fLen);
      drawRays(actualRetinaX, fLen);

      requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }

  /* ========================================================================
     2. BIOPHYSICS & PHOTOTRANSDUCTION SIMULATOR
     ======================================================================== */
  function initPhototransductionSim() {
    const canvas = document.getElementById("transduction-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const photonBtn = document.getElementById("fire-photon-btn");
    const lightDarkBtn = document.getElementById("toggle-light-dark-btn");
    const coneSlider = document.getElementById("cone-wavelength-slider");
    const coneVal = document.getElementById("cone-wavelength-val");
    const readout = document.getElementById("transduction-readout");

    let isDark = true;
    let retinalState = "bent"; // 'bent' (11-cis) | 'straight' (all-trans)
    let transitionProgress = 0; // 0 (11-cis) to 1 (all-trans)
    let ionChannelOpen = true;
    let membraneVoltage = -40; // -40 mV in dark, hyperpolarizes to -70 mV in light
    let voltageHistory = new Array(80).fill(-40);
    let flyingPhotons = [];
    let actionPotentials = [];
    let testWavelength = 530; // Green

    function firePhoton() {
      flyingPhotons.push({
        x: 40,
        y: 110 + (Math.random() - 0.5) * 20,
        vx: 5.5,
        targetX: 230,
        color: wavelengthToCSS(testWavelength),
      });
    }

    if (photonBtn) {
      photonBtn.addEventListener("click", firePhoton);
    }

    if (lightDarkBtn) {
      lightDarkBtn.addEventListener("click", () => {
        isDark = !isDark;
        lightDarkBtn.textContent = isDark ? "☀️ Switch to Bright Light" : "🌑 Switch to Dark Adaptation";
        lightDarkBtn.classList.toggle("amber-on", !isDark);
        if (!isDark) {
          firePhoton();
        }
      });
    }

    if (coneSlider) {
      coneSlider.addEventListener("input", () => {
        testWavelength = parseFloat(coneSlider.value);
        if (coneVal) coneVal.textContent = `${testWavelength} nm`;
      });
    }

    function wavelengthToCSS(nm) {
      if (nm < 420) return "#818cf8";
      if (nm < 490) return "#38bdf8";
      if (nm < 560) return "#34d399";
      if (nm < 600) return "#facc15";
      return "#f87171";
    }

    // Normalized Gaussian sensitivity for human S, M, L cones and Rhodopsin
    function coneSensitivity(nm, peak, fwhm) {
      const diff = nm - peak;
      return Math.exp(-0.5 * Math.pow(diff / (fwhm * 0.42), 2));
    }

    function updatePhysics() {
      // Automatic continuous photon firing in bright light
      if (!isDark && Math.random() < 0.22) {
        firePhoton();
      }

      // Move flying photons
      for (let i = flyingPhotons.length - 1; i >= 0; i--) {
        const p = flyingPhotons[i];
        p.x += p.vx;
        if (p.x >= p.targetX) {
          // Photon hits rhodopsin molecule! Triggers ultrafast isomerization (<200 fs)
          retinalState = "straight";
          transitionProgress = 1;
          flyingPhotons.splice(i, 1);
        }
      }

      // Retinal relaxation cycle: stays straight briefly, then active enzyme regenerates it
      if (retinalState === "straight") {
        transitionProgress -= isDark ? 0.015 : 0.006;
        if (transitionProgress <= 0) {
          retinalState = "bent";
          transitionProgress = 0;
        }
      }

      // Ion channel response: straight retinal activates transducin/PDE -> hydrolyzes cGMP -> closes channels!
      ionChannelOpen = transitionProgress < 0.35;

      // Target voltage: open channels = -40 mV (dark current), closed channels = -70 mV (hyperpolarized)
      const targetV = ionChannelOpen ? -40 : -70;
      membraneVoltage += (targetV - membraneVoltage) * 0.12;

      // Update voltage trace
      voltageHistory.push(membraneVoltage);
      if (voltageHistory.length > 80) voltageHistory.shift();

      // Action potential firing down optic nerve when light changes
      if (!ionChannelOpen && Math.random() < 0.28) {
        actionPotentials.push({ x: 530, progress: 0 });
      }
      for (let i = actionPotentials.length - 1; i >= 0; i--) {
        const ap = actionPotentials[i];
        ap.progress += 0.045;
        if (ap.progress >= 1) actionPotentials.splice(i, 1);
      }
    }

    function drawRetinalMolecule(cx, cy) {
      // 11-cis vs all-trans retinal hydrocarbon backbone
      ctx.save();
      ctx.translate(cx, cy);

      // Opsin protein pocket glow
      const opsinGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 68);
      opsinGrad.addColorStop(0, "rgba(167, 139, 250, 0.35)");
      opsinGrad.addColorStop(1, "rgba(167, 139, 250, 0.02)");
      ctx.fillStyle = opsinGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 68, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#a78bfa";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "#c4b5fd";
      ctx.font = "11px Inter, sans-serif";
      ctx.fillText("Opsin Protein Pocket", -54, -76);

      // Draw Chromophore Backbone
      const t = transitionProgress; // 0 = bent (11-cis), 1 = straight (all-trans)
      ctx.strokeStyle = t > 0.4 ? "#f87171" : "#38bdf8";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();

      // Beta-ionone ring on left
      ctx.moveTo(-50, 15);
      ctx.lineTo(-40, -10);
      ctx.lineTo(-20, -10);
      ctx.lineTo(-15, 15);
      ctx.lineTo(-35, 25);
      ctx.closePath();
      ctx.stroke();

      // Polyene chain: 11-cis has a sharp kink; all-trans straightens out!
      const kinkY = 15 - t * 35; // straightens up
      ctx.beginPath();
      ctx.moveTo(-15, 10);
      ctx.lineTo(5, -6);
      ctx.lineTo(25, kinkY); // C11-C12 cis double bond kink
      ctx.lineTo(45, kinkY + (1 - t) * 18 - 8);
      ctx.lineTo(65, -8);
      ctx.stroke();

      // Label state
      ctx.font = "12px JetBrains Mono, monospace";
      if (t < 0.3) {
        ctx.fillStyle = "#38bdf8";
        ctx.fillText("11-cis-retinal (Bent)", -45, 52);
        ctx.fillStyle = "#94a3b8";
        ctx.font = "10px Inter, sans-serif";
        ctx.fillText("Ready to capture photon", -50, 68);
      } else {
        ctx.fillStyle = "#f87171";
        ctx.fillText("all-trans-retinal (Straight)", -65, 52);
        ctx.fillStyle = "#fb923c";
        ctx.font = "10px Inter, sans-serif";
        ctx.fillText("Isomerized in < 200 fs!", -48, 68);
      }

      ctx.restore();
    }

    function drawIonChannelAndVoltage(cx, cy) {
      // Cell Membrane & Na+/Ca2+ cGMP-gated Ion Channel
      ctx.save();
      ctx.translate(cx, cy);

      // Lipid Bilayer
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(-10, -50, 20, 100);
      ctx.strokeStyle = "rgba(148, 163, 184, 0.3)";
      ctx.strokeRect(-10, -50, 20, 100);

      // Channel gates
      const gateOpenDist = ionChannelOpen ? 18 : 3;
      ctx.fillStyle = ionChannelOpen ? "#34d399" : "#f43f5e";
      ctx.fillRect(-8, -25, 16, 12 - gateOpenDist * 0.3);
      ctx.fillRect(-8, 13 + gateOpenDist * 0.3, 16, 12);

      ctx.font = "11px Inter, sans-serif";
      ctx.fillStyle = ionChannelOpen ? "#34d399" : "#f43f5e";
      ctx.fillText(ionChannelOpen ? "cGMP Channel OPEN" : "Channel CLOSED", -52, -60);

      if (ionChannelOpen) {
        // Na+ ions flowing in
        ctx.fillStyle = "#fbbf24";
        ctx.font = "10px JetBrains Mono, monospace";
        ctx.fillText("Na⁺ / Ca²⁺ →", -42, 4);
      }

      // Membrane Voltage Graph
      const gx = 85, gy = -45, gw = 135, gh = 90;
      ctx.fillStyle = "#0a0f1d";
      ctx.fillRect(gx, gy, gw, gh);
      ctx.strokeStyle = "rgba(148, 163, 184, 0.25)";
      ctx.strokeRect(gx, gy, gw, gh);

      // Voltage grid lines: -40 mV (dark) and -70 mV (light)
      ctx.fillStyle = "#64748b";
      ctx.font = "9px JetBrains Mono, monospace";
      const y40 = gy + gh * 0.3;
      const y70 = gy + gh * 0.85;

      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = "#475569";
      ctx.beginPath();
      ctx.moveTo(gx, y40);
      ctx.lineTo(gx + gw, y40);
      ctx.moveTo(gx, y70);
      ctx.lineTo(gx + gw, y70);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillText("-40mV (Dark)", gx + 4, y40 - 3);
      ctx.fillText("-70mV (Light)", gx + 4, y70 - 3);

      // Voltage Curve
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2;
      ctx.beginPath();
      voltageHistory.forEach((v, idx) => {
        const x = gx + (idx / 80) * gw;
        const norm = (v - (-70)) / 30; // 0 at -70, 1 at -40
        const y = y70 - norm * (y70 - y40);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      ctx.fillStyle = "#e2e8f0";
      ctx.font = "10px Inter, sans-serif";
      ctx.fillText(`Vm = ${membraneVoltage.toFixed(0)} mV`, gx + 38, gy + gh + 16);

      ctx.restore();
    }

    function drawConeSpectralResponses(cx, cy) {
      // Trichromatic Cone Spectral Absorption Curves (S, M, L)
      ctx.save();
      ctx.translate(cx, cy);

      const gw = 260, gh = 85;
      ctx.fillStyle = "#0b1120";
      ctx.fillRect(0, 0, gw, gh);
      ctx.strokeStyle = "rgba(148, 163, 184, 0.25)";
      ctx.strokeRect(0, 0, gw, gh);

      const minNm = 380, maxNm = 680;
      const nmToX = (nm) => ((nm - minNm) / (maxNm - minNm)) * gw;

      // Draw S-cone (Blue, peak 420 nm)
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x <= gw; x += 4) {
        const nm = minNm + (x / gw) * (maxNm - minNm);
        const y = gh - coneSensitivity(nm, 420, 50) * (gh - 10);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Draw M-cone (Green, peak 530 nm)
      ctx.strokeStyle = "#34d399";
      ctx.beginPath();
      for (let x = 0; x <= gw; x += 4) {
        const nm = minNm + (x / gw) * (maxNm - minNm);
        const y = gh - coneSensitivity(nm, 530, 65) * (gh - 10);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Draw L-cone (Red, peak 560 nm)
      ctx.strokeStyle = "#f87171";
      ctx.beginPath();
      for (let x = 0; x <= gw; x += 4) {
        const nm = minNm + (x / gw) * (maxNm - minNm);
        const y = gh - coneSensitivity(nm, 560, 75) * (gh - 10);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Current wavelength marker
      const markerX = nmToX(testWavelength);
      ctx.strokeStyle = "#fbbf24";
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(markerX, 0);
      ctx.lineTo(markerX, gh);
      ctx.stroke();
      ctx.setLineDash([]);

      const sResp = coneSensitivity(testWavelength, 420, 50);
      const mResp = coneSensitivity(testWavelength, 530, 65);
      const lResp = coneSensitivity(testWavelength, 560, 75);

      ctx.fillStyle = "#94a3b8";
      ctx.font = "10px Inter, sans-serif";
      ctx.fillText("Trichromatic Cone Tuning (S·Blue, M·Green, L·Red)", 0, -8);
      ctx.fillStyle = "#cbd5e1";
      ctx.fillText(`At ${testWavelength}nm: S=${sResp.toFixed(2)}  M=${mResp.toFixed(2)}  L=${lResp.toFixed(2)}`, 0, gh + 16);

      ctx.restore();
    }

    function frame() {
      updatePhysics();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Top title and breadcrumb
      ctx.fillStyle = "#94a3b8";
      ctx.font = "12px Inter, sans-serif";
      ctx.fillText("Step 1: Photon Capture & Isomerization", 40, 28);
      ctx.fillText("Step 2: Ion Channel & Hyperpolarization", 310, 28);
      ctx.fillText("Step 3: Color Tri-receptor Tuning", 540, 28);

      // Section 1: Retinal Molecule in Rhodopsin
      drawRetinalMolecule(130, 140);

      // Flying photon wavepackets
      flyingPhotons.forEach((p) => {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let i = 0; i <= 16; i++) {
          const px = p.x - 24 + (i / 16) * 24;
          const py = p.y + Math.sin(i * 1.5) * 4;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      });

      // Arrow from molecule to channel
      ctx.strokeStyle = "rgba(148, 163, 184, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(220, 140);
      ctx.lineTo(290, 140);
      ctx.stroke();
      ctx.fillStyle = "#a78bfa";
      ctx.font = "9px Inter, sans-serif";
      ctx.fillText("Transducin/PDE →", 215, 132);

      // Section 2: Ion channel & Membrane Voltage
      drawIonChannelAndVoltage(345, 140);

      // Section 3: Cone responses
      drawConeSpectralResponses(530, 95);

      // Update readout
      if (readout) {
        const stateWord = ionChannelOpen
          ? "Dark State: cGMP keeps Na⁺ channels OPEN (Resting Vm ≈ -40 mV, continuous glutamate release)"
          : "Light Activated: 11-cis → all-trans closes channels! Cell HYPERPOLARIZES (-70 mV), halting glutamate!";
        readout.innerHTML =
          `<span>Retinal State: <strong>${retinalState === "bent" ? "11-cis (Bent)" : "all-trans (Straightened)"}</strong></span>` +
          `<span>Photoreceptor Potential: <strong>${membraneVoltage.toFixed(1)} mV</strong></span>` +
          `<span>Biophysical State: <strong>${stateWord}</strong></span>`;
      }

      requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }

  document.addEventListener("DOMContentLoaded", () => {
    initEyeOpticsSim();
    initPhototransductionSim();
  });
})();
