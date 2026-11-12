/* ==========================================================================
   All About Photons — Interactive Physics Simulations
   1. Photon Generation Lab (Atomic Transition, LED Bandgap, Thermal Blackbody)
   2. Photon Inside a Room Simulator (Emission, Reflection, Absorption -> Heat, Escape, IR)
   3. Electromagnetic Spectrum & Photon Properties Explorer
   ========================================================================== */

(function () {
  const H_PLANCK_J = 6.62607015e-34;
  const H_PLANCK_EV = 4.135667696e-15;
  const C_LIGHT = 299792458;
  const EV_TO_J = 1.602176634e-19;
  const K_BOLTZMANN = 1.380649e-23;

  function wavelengthToCSS(nm) {
    if (nm < 380) return "#a855f7"; // UV representation
    if (nm > 750) return "#ef4444"; // IR representation
    let r = 0, g = 0, b = 0;
    if (nm >= 380 && nm < 440) {
      r = -(nm - 440) / (440 - 380);
      g = 0;
      b = 1;
    } else if (nm >= 440 && nm < 490) {
      r = 0;
      g = (nm - 440) / (490 - 440);
      b = 1;
    } else if (nm >= 490 && nm < 510) {
      r = 0;
      g = 1;
      b = -(nm - 510) / (510 - 490);
    } else if (nm >= 510 && nm < 580) {
      r = (nm - 510) / (580 - 510);
      g = 1;
      b = 0;
    } else if (nm >= 580 && nm < 645) {
      r = 1;
      g = -(nm - 645) / (645 - 580);
      b = 0;
    } else if (nm >= 645 && nm <= 750) {
      r = 1;
      g = 0;
      b = 0;
    }
    let factor = 1;
    if (nm >= 380 && nm < 420) factor = 0.3 + 0.7 * (nm - 380) / (420 - 380);
    else if (nm > 700 && nm <= 750) factor = 0.3 + 0.7 * (750 - nm) / (750 - 700);
    const to255 = (v) => Math.round(255 * Math.pow(v * factor, 0.85));
    return `rgb(${to255(r)}, ${to255(g)}, ${to255(b)})`;
  }

  function formatSci(val, unit = "") {
    if (val === 0) return `0 ${unit}`.trim();
    const exp = Math.floor(Math.log10(Math.abs(val)));
    if (exp >= -2 && exp <= 4) {
      return `${Number(val.toPrecision(3))} ${unit}`.trim();
    }
    const mant = val / Math.pow(10, exp);
    return `${mant.toFixed(2)} × 10^${exp} ${unit}`.trim();
  }

  function drawWavepacket(ctx, x, y, vx, vy, color, phase, length = 34, amp = 5) {
    const angle = Math.atan2(vy, vx);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    const steps = 24;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const px = (t - 0.5) * length;
      const env = Math.sin(t * Math.PI); // Gaussian-like packet envelope
      const py = Math.sin(t * 16 - phase) * amp * env;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Small glowing core dot
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(length * 0.25, 0, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /* ========================================================================
     1. PHOTON GENERATION LAB
     ======================================================================== */
  function initGenerationSim() {
    const canvas = document.getElementById("gen-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const tabBtns = document.querySelectorAll("[data-gen-mode]");
    const actionBtn = document.getElementById("gen-action-btn");
    const sliderWrap = document.getElementById("gen-slider-wrap");
    const sliderLabel = document.getElementById("gen-slider-label");
    const slider = document.getElementById("gen-slider");
    const sliderVal = document.getElementById("gen-slider-val");
    const readout = document.getElementById("gen-readout");

    let mode = "atom"; // 'atom' | 'led' | 'blackbody'
    let time = 0;

    // Atom mode state
    let electronLevel = 1; // 1, 2, 3
    let targetLevel = 1;
    let levelRadius = [0, 48, 92, 138];
    let electronAngle = 0;
    let transitionTimer = 0;
    let emittedPhotons = [];

    // LED mode state
    let bandgapEv = 2.33; // Green ~532nm
    let ledPairs = [];
    for (let i = 0; i < 6; i++) {
      ledPairs.push({
        x: 110 + i * 95,
        phase: Math.random() * 100,
        recombined: false,
      });
    }

    // Blackbody mode state
    let tempK = 2700;

    function setMode(nextMode) {
      mode = nextMode;
      tabBtns.forEach((b) => b.classList.toggle("active", b.dataset.genMode === mode));
      emittedPhotons = [];

      if (mode === "atom") {
        actionBtn.style.display = "";
        actionBtn.textContent = "⚡ Excite Electron (n=1 → n=3)";
        sliderWrap.style.display = "none";
      } else if (mode === "led") {
        actionBtn.style.display = "none";
        sliderWrap.style.display = "flex";
        sliderLabel.textContent = "Bandgap Energy (Eg):";
        slider.min = "1.40";
        slider.max = "3.10";
        slider.step = "0.02";
        slider.value = bandgapEv.toFixed(2);
        sliderVal.textContent = `${bandgapEv.toFixed(2)} eV`;
      } else {
        actionBtn.style.display = "none";
        sliderWrap.style.display = "flex";
        sliderLabel.textContent = "Temperature (T):";
        slider.min = "300";
        slider.max = "8000";
        slider.step = "50";
        slider.value = String(tempK);
        sliderVal.textContent = `${tempK} K`;
      }
    }

    tabBtns.forEach((btn) => {
      btn.addEventListener("click", () => setMode(btn.dataset.genMode));
    });

    actionBtn.addEventListener("click", () => {
      if (mode === "atom") {
        electronLevel = 3;
        targetLevel = 3;
        transitionTimer = 75;
      }
    });

    slider.addEventListener("input", () => {
      const val = parseFloat(slider.value);
      if (mode === "led") {
        bandgapEv = val;
        sliderVal.textContent = `${bandgapEv.toFixed(2)} eV`;
      } else if (mode === "blackbody") {
        tempK = val;
        sliderVal.textContent = `${tempK} K`;
      }
    });

    function spawnPhoton(x, y, vx, vy, nm, label) {
      emittedPhotons.push({
        x, y, vx, vy,
        color: wavelengthToCSS(nm),
        nm,
        label,
        phase: 0,
        life: 160,
      });
    }

    function updateAtom() {
      electronAngle += 0.045 / Math.max(1, electronLevel * 0.6);
      if (electronLevel > 1) {
        transitionTimer--;
        if (transitionTimer === 35 && electronLevel === 3) {
          // Drop n=3 -> n=2 (H-alpha red 656 nm)
          electronLevel = 2;
          const r = levelRadius[2];
          const px = 210 + Math.cos(electronAngle) * r;
          const py = 180 + Math.sin(electronAngle) * r;
          spawnPhoton(px, py, 3.3, -0.6, 656, "656 nm (1.89 eV)");
        } else if (transitionTimer <= 0 && electronLevel === 2) {
          // Drop n=2 -> n=1 (Lyman-alpha UV 121 nm -> represent violet)
          electronLevel = 1;
          const r = levelRadius[1];
          const px = 210 + Math.cos(electronAngle) * r;
          const py = 180 + Math.sin(electronAngle) * r;
          spawnPhoton(px, py, 3.5, 0.7, 390, "121.6 nm UV (10.2 eV)");
        }
      }

      // Draw atom on left
      const cx = 210, cy = 180;
      ctx.fillStyle = "#94a3b8";
      ctx.font = "12px Inter, sans-serif";
      ctx.fillText("Hydrogen-like Atom Shells", 30, 28);

      [1, 2, 3].forEach((n) => {
        const r = levelRadius[n];
        ctx.strokeStyle = n === electronLevel ? "rgba(56, 189, 248, 0.55)" : "rgba(148, 163, 184, 0.22)";
        ctx.lineWidth = n === electronLevel ? 1.8 : 1;
        ctx.setLineDash(n === electronLevel ? [] : [4, 4]);
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "#64748b";
        ctx.fillText(`n=${n}`, cx + r + 5, cy + 4);
      });

      // Nucleus
      const nucGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 14);
      nucGrad.addColorStop(0, "#fbbf24");
      nucGrad.addColorStop(1, "rgba(245, 158, 11, 0)");
      ctx.fillStyle = nucGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fef3c7";
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fill();

      // Electron
      const er = levelRadius[electronLevel];
      const ex = cx + Math.cos(electronAngle) * er;
      const ey = cy + Math.sin(electronAngle) * er;
      ctx.fillStyle = "#38bdf8";
      ctx.shadowColor = "#38bdf8";
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(ex, ey, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Right side energy level diagram
      const dx = 470;
      ctx.fillStyle = "#94a3b8";
      ctx.fillText("Energy Levels (ΔE = hν)", dx, 28);
      const levelsY = { 3: 85, 2: 165, 1: 290 };
      [1, 2, 3].forEach((n) => {
        const y = levelsY[n];
        ctx.strokeStyle = n === electronLevel ? "#38bdf8" : "#475569";
        ctx.lineWidth = n === electronLevel ? 3 : 1.5;
        ctx.beginPath();
        ctx.moveTo(dx, y);
        ctx.lineTo(dx + 190, y);
        ctx.stroke();
        ctx.fillStyle = "#cbd5e1";
        ctx.fillText(`n = ${n}`, dx + 200, y + 4);
      });

      // Active electron dot on diagram
      ctx.fillStyle = "#38bdf8";
      ctx.beginPath();
      ctx.arc(dx + 95, levelsY[electronLevel], 6, 0, Math.PI * 2);
      ctx.fill();

      readout.innerHTML =
        `<span>Mechanism: <strong>Spontaneous Atomic Emission</strong></span>` +
        `<span>Electron State: <strong>n = ${electronLevel}</strong></span>` +
        `<span>Rule: <strong>E_photon = E_upper − E_lower = hc / λ</strong></span>`;
    }

    function updateLED() {
      const nm = 1239.84 / bandgapEv;
      const col = wavelengthToCSS(nm);

      // Draw Conduction & Valence bands
      const topY = 95;
      const botY = 255;
      const gapOffset = (bandgapEv - 1.4) * 22;

      ctx.fillStyle = "rgba(56, 189, 248, 0.12)";
      ctx.fillRect(60, 45, 640, 65 - gapOffset * 0.35);
      ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
      ctx.strokeRect(60, 45, 640, 65 - gapOffset * 0.35);

      ctx.fillStyle = "rgba(251, 191, 36, 0.1)";
      ctx.fillRect(60, 245 + gapOffset * 0.35, 640, 65);
      ctx.strokeStyle = "rgba(251, 191, 36, 0.4)";
      ctx.strokeRect(60, 245 + gapOffset * 0.35, 640, 65);

      ctx.fillStyle = "#94a3b8";
      ctx.font = "13px Inter, sans-serif";
      ctx.fillText("Conduction Band (Electrons e⁻)", 74, 72);
      ctx.fillText("Valence Band (Holes h⁺)", 74, 286 + gapOffset * 0.35);
      ctx.fillStyle = "#e2e8f0";
      ctx.fillText(`Bandgap Eg = ${bandgapEv.toFixed(2)} eV`, 540, 182);

      const cbBottom = 110 - gapOffset * 0.35;
      const vbTop = 245 + gapOffset * 0.35;

      ledPairs.forEach((p) => {
        p.phase += 1.4;
        if (p.phase > 120) {
          p.phase = 0;
          p.recombined = false;
        }
        const progress = p.phase / 120;
        if (progress < 0.55) {
          const ey = cbBottom - 18 + (progress / 0.55) * ((vbTop - cbBottom) * 0.5 + 18);
          const hy = vbTop + 18 - (progress / 0.55) * ((vbTop - cbBottom) * 0.5 + 18);
          // Electron
          ctx.fillStyle = "#38bdf8";
          ctx.beginPath();
          ctx.arc(p.x, ey, 6, 0, Math.PI * 2);
          ctx.fill();
          // Hole
          ctx.strokeStyle = "#fbbf24";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(p.x, hy, 6, 0, Math.PI * 2);
          ctx.stroke();
        } else if (!p.recombined) {
          p.recombined = true;
          const midY = (cbBottom + vbTop) * 0.5;
          spawnPhoton(p.x, midY, 2.8, (Math.random() - 0.5) * 1.4, nm, `${Math.round(nm)} nm`);
        }
      });

      const bandName = nm < 395 ? "Near-UV" : nm > 750 ? "Near-Infrared (IR remote)" : "Visible";
      readout.innerHTML =
        `<span>Mechanism: <strong>Electroluminescence (p-n Junction)</strong></span>` +
        `<span>Bandgap: <strong>${bandgapEv.toFixed(2)} eV</strong></span>` +
        `<span>Emitted λ: <strong style="color:${col}">${Math.round(nm)} nm (${bandName})</strong></span>`;
    }

    function planck(nm, T) {
      const lam = nm * 1e-9;
      const c1 = 1 / Math.pow(lam, 5);
      const expo = (H_PLANCK_J * C_LIGHT) / (lam * K_BOLTZMANN * T);
      if (expo > 700) return 0;
      return c1 / (Math.exp(expo) - 1);
    }

    function updateBlackbody() {
      // Draw Planck Curve from 200 nm to 3000 nm (or higher for 300K)
      const maxNm = tempK < 1200 ? 18000 : 2800;
      const minNm = 150;
      const gx = 65, gy = 40, gw = 640, gh = 260;

      // Visible rainbow band inside chart
      const visStart = gx + ((380 - minNm) / (maxNm - minNm)) * gw;
      const visEnd = gx + ((750 - minNm) / (maxNm - minNm)) * gw;
      if (visEnd > gx) {
        const grad = ctx.createLinearGradient(Math.max(gx, visStart), 0, visEnd, 0);
        grad.addColorStop(0, "rgba(139, 92, 246, 0.25)");
        grad.addColorStop(0.25, "rgba(59, 130, 246, 0.25)");
        grad.addColorStop(0.5, "rgba(34, 197, 94, 0.25)");
        grad.addColorStop(0.75, "rgba(234, 179, 8, 0.25)");
        grad.addColorStop(1, "rgba(239, 68, 68, 0.25)");
        ctx.fillStyle = grad;
        ctx.fillRect(Math.max(gx, visStart), gy, Math.max(2, visEnd - Math.max(gx, visStart)), gh);
      }

      // Compute curve max to normalize height
      let maxVal = 0;
      const samples = 140;
      const vals = [];
      for (let i = 0; i <= samples; i++) {
        const nm = minNm + (i / samples) * (maxNm - minNm);
        const v = planck(nm, tempK);
        vals.push({ nm, v });
        if (v > maxVal) maxVal = v;
      }

      // Axes
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(gx, gy);
      ctx.lineTo(gx, gy + gh);
      ctx.lineTo(gx + gw, gy + gh);
      ctx.stroke();

      // Curve
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      vals.forEach((pt, idx) => {
        const x = gx + ((pt.nm - minNm) / (maxNm - minNm)) * gw;
        const y = gy + gh - (maxVal > 0 ? (pt.v / maxVal) * (gh - 20) : 0);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Wien's displacement peak
      const peakNm = 2897771.95 / tempK;
      const peakX = gx + ((peakNm - minNm) / (maxNm - minNm)) * gw;
      if (peakX >= gx && peakX <= gx + gw) {
        ctx.strokeStyle = "rgba(56, 189, 248, 0.7)";
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(peakX, gy);
        ctx.lineTo(peakX, gy + gh);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "#38bdf8";
        ctx.font = "12px JetBrains Mono, monospace";
        ctx.fillText(`Peak λ ≈ ${peakNm > 1000 ? (peakNm / 1000).toFixed(2) + " µm" : Math.round(peakNm) + " nm"}`, Math.min(peakX + 6, gx + gw - 140), gy + 18);
      }

      // Emit sample photons near peak
      if (time % 14 === 0) {
        const sampleNm = Math.max(250, Math.min(1200, peakNm * (0.7 + Math.random() * 0.7)));
        spawnPhoton(gx + gw * 0.75, gy + 80 + Math.random() * 110, 2.6, (Math.random() - 0.5) * 0.9, sampleNm, "");
      }

      ctx.fillStyle = "#94a3b8";
      ctx.font = "12px Inter, sans-serif";
      ctx.fillText(`${minNm} nm`, gx, gy + gh + 18);
      ctx.fillText(`${maxNm >= 2000 ? (maxNm / 1000).toFixed(1) + " µm" : maxNm + " nm"} (Wavelength)`, gx + gw - 130, gy + gh + 18);
      ctx.fillText("Visible", Math.max(gx, visStart), gy + 14);

      const regime =
        tempK < 600
          ? "Room-temp Infrared (~10 µm)"
          : tempK < 3200
          ? "Warm Incandescent (mostly IR + warm red/amber)"
          : tempK < 6200
          ? "Solar Photosphere (peaks in visible green/yellow)"
          : "Blue-white Hot Star (UV + blue)";

      readout.innerHTML =
        `<span>Mechanism: <strong>Thermal Blackbody Radiation</strong></span>` +
        `<span>Wien Peak: <strong>${peakNm > 1000 ? (peakNm / 1000).toFixed(2) + " µm" : Math.round(peakNm) + " nm"}</strong></span>` +
        `<span>Character: <strong>${regime}</strong></span>`;
    }

    function frame() {
      time++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Subtle background grid
      ctx.strokeStyle = "rgba(148, 163, 184, 0.06)";
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

      if (mode === "atom") updateAtom();
      else if (mode === "led") updateLED();
      else updateBlackbody();

      // Update and render emitted photons
      for (let i = emittedPhotons.length - 1; i >= 0; i--) {
        const p = emittedPhotons[i];
        p.x += p.vx;
        p.y += p.vy;
        p.phase += 0.32;
        p.life--;
        drawWavepacket(ctx, p.x, p.y, p.vx, p.vy, p.color, p.phase);
        if (p.label) {
          ctx.fillStyle = p.color;
          ctx.font = "11px JetBrains Mono, monospace";
          ctx.fillText(p.label, p.x - 20, p.y - 12);
        }
        if (p.life <= 0 || p.x > canvas.width + 40 || p.y < -30 || p.y > canvas.height + 30) {
          emittedPhotons.splice(i, 1);
        }
      }

      requestAnimationFrame(frame);
    }

    setMode("atom");
    requestAnimationFrame(frame);
  }

  /* ========================================================================
     2. PHOTON INSIDE A ROOM SIMULATOR
     ======================================================================== */
  function initRoomSim() {
    const canvas = document.getElementById("room-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const switchBtn = document.getElementById("room-switch-btn");
    const burstBtn = document.getElementById("room-burst-btn");
    const speedSelect = document.getElementById("room-speed-select");
    const wallSelect = document.getElementById("room-wall-select");
    const irToggle = document.getElementById("room-ir-toggle");
    const readout = document.getElementById("room-readout");

    let lightOn = true;
    let showIR = true;
    let timeScale = "slow"; // 'slow' | 'fast' | 'realtime'
    let wallType = "white"; // 'white' | 'red' | 'dark'
    let photons = [];
    let heatFlashes = [];

    let stats = {
      absorbed: 0,
      escaped: 0,
      vision: 0,
    };
    let offNanoseconds = 0;
    let frameCount = 0;

    // Room geometry (4m x 2.5m scaled to 670 x 315 px)
    const room = { left: 40, right: 710, top: 52, bottom: 367 };
    const NS_PER_PX = 13.34 / (room.right - room.left); // 4 m room crossing = 13.34 ns
    const bulb = { x: 375, y: 72 };
    const mirror = { x: room.left, y1: 120, y2: 280 };
    const win = { x: room.right, y1: 120, y2: 270 };
    const eye = { x: 545, y: 262, r: 16 };
    const table = { x: 245, y: 287, w: 120, h: 80 };

    const WALL_CONFIG = {
      white: {
        label: "White Matte Paint (R ≈ 0.78)",
        wallHex: "#cbd5e1",
        reflectance: { red: 0.78, green: 0.78, blue: 0.78 },
      },
      red: {
        label: "Red Matte Paint (Reflects Red, Absorbs Blue/Green)",
        wallHex: "#dc2626",
        reflectance: { red: 0.76, green: 0.14, blue: 0.12 },
      },
      dark: {
        label: "Dark Charcoal Wall (R ≈ 0.18)",
        wallHex: "#334155",
        reflectance: { red: 0.18, green: 0.18, blue: 0.18 },
      },
    };

    const SPECTRUM_BANDS = [
      { key: "red", color: "#ff5a5f" },
      { key: "green", color: "#34d399" },
      { key: "blue", color: "#38bdf8" },
    ];

    function emitPhotons(count) {
      const visCount = photons.filter((p) => !p.isIR).length;
      for (let i = 0; i < count; i++) {
        if (visCount + i >= 120) break;
        const band = SPECTRUM_BANDS[Math.floor(Math.random() * SPECTRUM_BANDS.length)];
        const angle = Math.random() * Math.PI; // downward hemisphere from ceiling bulb
        const speed = 4.5;
        photons.push({
          x: bulb.x + (Math.random() - 0.5) * 14,
          y: bulb.y + 8,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          band: band.key,
          color: band.color,
          isIR: false,
          bounces: 0,
          phase: Math.random() * 6,
          outside: false,
        });
      }
    }

    function emitIRPhoton() {
      if (!showIR || photons.filter((p) => p.isIR).length > 26) return;
      const pick = Math.random();
      let x, y, angle;
      if (pick < 0.35) {
        x = room.left + 20 + Math.random() * (room.right - room.left - 40);
        y = room.bottom - 2;
        angle = -Math.PI * (0.15 + Math.random() * 0.7);
      } else if (pick < 0.7) {
        x = room.left + 20 + Math.random() * (room.right - room.left - 40);
        y = room.top + 2;
        angle = Math.PI * (0.15 + Math.random() * 0.7);
      } else {
        x = room.left + 2;
        y = room.top + 20 + Math.random() * (room.bottom - room.top - 40);
        angle = (Math.random() - 0.5) * Math.PI * 0.7;
      }
      const speed = 3.0;
      photons.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        band: "ir",
        color: "#f97316",
        isIR: true,
        bounces: 0,
        phase: 0,
        outside: false,
      });
    }

    function diffuseReflect(nx, ny, speed) {
      const base = Math.atan2(ny, nx);
      const angle = base + (Math.random() - 0.5) * 1.45;
      return { vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed };
    }

    function handleWallHit(p, nx, ny, isMirror = false) {
      if (p.isIR) {
        heatFlashes.push({ x: p.x, y: p.y, life: 14, color: "rgba(249,115,22,0.45)" });
        return false;
      }

      const cfg = WALL_CONFIG[wallType];
      const prob = isMirror ? 0.95 : cfg.reflectance[p.band];

      if (Math.random() > prob) {
        stats.absorbed++;
        heatFlashes.push({ x: p.x, y: p.y, life: 20, color: "rgba(251, 146, 60, 0.85)" });
        return false;
      }

      p.bounces++;
      const speed = Math.hypot(p.vx, p.vy);
      if (isMirror) {
        const dot = p.vx * nx + p.vy * ny;
        p.vx = p.vx - 2 * dot * nx;
        p.vy = p.vy - 2 * dot * ny;
      } else {
        const ref = diffuseReflect(nx, ny, speed);
        p.vx = ref.vx;
        p.vy = ref.vy;
      }
      return true;
    }

    function extinguishVisibleRealtime() {
      const remaining = photons.filter((p) => !p.isIR).length;
      if (remaining > 0) {
        stats.absorbed += remaining;
        offNanoseconds = Math.max(offNanoseconds, 480);
      }
      photons = photons.filter((p) => p.isIR);
    }

    switchBtn.addEventListener("click", () => {
      lightOn = !lightOn;
      switchBtn.textContent = lightOn ? "💡 Light: ON (Click to Turn OFF)" : "🌑 Light: OFF (Click to Turn ON)";
      switchBtn.classList.toggle("amber-on", lightOn);
      if (!lightOn) {
        offNanoseconds = 0;
        if (timeScale === "realtime") {
          extinguishVisibleRealtime();
        }
      }
    });

    burstBtn.addEventListener("click", () => {
      emitPhotons(24);
      if (!lightOn) offNanoseconds = 0;
    });

    if (speedSelect) {
      speedSelect.addEventListener("change", () => {
        timeScale = speedSelect.value;
        if (!lightOn && timeScale === "realtime") {
          extinguishVisibleRealtime();
        }
      });
    }

    wallSelect.addEventListener("change", () => {
      wallType = wallSelect.value;
    });

    irToggle.addEventListener("change", () => {
      showIR = irToggle.checked;
      if (!showIR) photons = photons.filter((p) => !p.isIR);
    });

    function stepPhotons(substeps) {
      for (let s = 0; s < substeps; s++) {
        let movedVisible = false;
        for (let i = photons.length - 1; i >= 0; i--) {
          const p = photons[i];
          p.x += p.vx;
          p.y += p.vy;
          p.phase += 0.35;
          if (!p.isIR && !p.outside) movedVisible = true;

          let alive = true;

          if (!p.outside) {
            if (!p.isIR && Math.hypot(p.x - eye.x, p.y - eye.y) < eye.r) {
              stats.vision++;
              heatFlashes.push({ x: eye.x, y: eye.y, life: 14, color: "rgba(56, 189, 248, 0.85)" });
              photons.splice(i, 1);
              continue;
            }

            if (
              p.x >= table.x &&
              p.x <= table.x + table.w &&
              p.y >= table.y - 3 &&
              p.y <= table.y + 12 &&
              p.vy > 0
            ) {
              p.y = table.y - 3;
              alive = handleWallHit(p, 0, -1, false);
            }

            if (alive && p.y <= room.top + 4) {
              p.y = room.top + 4;
              alive = handleWallHit(p, 0, 1, false);
            } else if (alive && p.y >= room.bottom - 4) {
              p.y = room.bottom - 4;
              alive = handleWallHit(p, 0, -1, false);
            }

            if (alive && p.x <= room.left + 4) {
              p.x = room.left + 4;
              const onMirror = p.y >= mirror.y1 && p.y <= mirror.y2;
              alive = handleWallHit(p, 1, 0, onMirror);
            }

            if (alive && p.x >= room.right - 3) {
              const inWindow = p.y >= win.y1 && p.y <= win.y2;
              if (inWindow) {
                if (p.isIR) {
                  alive = false; // Glass absorbs ~10 µm thermal IR
                } else if (Math.random() < 0.08) {
                  p.x = room.right - 4;
                  alive = handleWallHit(p, -1, 0, true);
                } else {
                  p.outside = true;
                  stats.escaped++;
                }
              } else {
                p.x = room.right - 4;
                alive = handleWallHit(p, -1, 0, false);
              }
            }
          }

          if (!alive || p.x > canvas.width + 30 || p.y < 30 || p.y > canvas.height + 30) {
            photons.splice(i, 1);
          }
        }
        if (!lightOn && movedVisible) {
          offNanoseconds += 4.5 * NS_PER_PX;
        }
      }
    }

    function drawRoomGeometry(activeVis, activeIR) {
      const cfg = WALL_CONFIG[wallType];

      // Top status & legend bar
      ctx.fillStyle = "#0b1120";
      ctx.fillRect(0, 0, canvas.width, 36);
      ctx.strokeStyle = "rgba(148, 163, 184, 0.18)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, 36);
      ctx.lineTo(canvas.width, 36);
      ctx.stroke();

      // Legend items on left
      ctx.font = "11px Inter, sans-serif";
      ctx.fillStyle = "#38bdf8";
      ctx.fillText("● RGB = Visible Light (1.8–3.1 eV)", 16, 22);
      ctx.fillStyle = "#fb923c";
      ctx.fillText("〜 Orange = 10 µm Thermal IR (295 K walls)", 225, 22);

      // State badge on right
      ctx.textAlign = "right";
      if (lightOn) {
        ctx.fillStyle = "#fde047";
        ctx.fillText(`💡 Light ON — ${activeVis} visible + ${activeIR} IR photons`, canvas.width - 16, 22);
      } else if (activeVis > 0) {
        ctx.fillStyle = "#38bdf8";
        ctx.fillText(`⏳ Slow-Mo Decay (${offNanoseconds.toFixed(0)} ns): ${activeVis} visible left…`, canvas.width - 16, 22);
      } else {
        ctx.fillStyle = "#fb923c";
        ctx.fillText(`🌑 0 Visible Left (~${offNanoseconds.toFixed(0)} ns) — Only ${activeIR} Thermal IR photons remain!`, canvas.width - 16, 22);
      }
      ctx.textAlign = "left";

      // Night sky outside window
      ctx.fillStyle = "#040710";
      ctx.fillRect(room.right, 36, canvas.width - room.right, canvas.height - 36);
      ctx.fillStyle = "#64748b";
      ctx.font = "11px Inter, sans-serif";
      ctx.fillText("Outdoors / Space", room.right + 12, 58);

      // Ambient room glow proportional to active visible photons
      const glowAlpha = Math.min(0.18, activeVis * 0.0022);
      ctx.fillStyle = `rgba(254, 243, 199, ${glowAlpha})`;
      ctx.fillRect(room.left, room.top, room.right - room.left, room.bottom - room.top);

      // Room walls
      ctx.strokeStyle = cfg.wallHex;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(room.left, room.top);
      ctx.lineTo(room.right, room.top);
      ctx.moveTo(room.right, room.top);
      ctx.lineTo(room.right, win.y1);
      ctx.moveTo(room.right, win.y2);
      ctx.lineTo(room.right, room.bottom);
      ctx.moveTo(room.left, room.bottom);
      ctx.lineTo(room.right, room.bottom);
      ctx.moveTo(room.left, room.top);
      ctx.lineTo(room.left, room.bottom);
      ctx.stroke();

      // Mirror on left wall
      ctx.strokeStyle = "#7dd3fc";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(mirror.x + 2, mirror.y1);
      ctx.lineTo(mirror.x + 2, mirror.y2);
      ctx.stroke();
      ctx.fillStyle = "#7dd3fc";
      ctx.font = "11px Inter, sans-serif";
      ctx.fillText("Mirror", mirror.x + 10, mirror.y1 + 14);

      // Glass window on right wall
      ctx.strokeStyle = "rgba(125, 211, 252, 0.55)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(win.x, win.y1);
      ctx.lineTo(win.x, win.y2);
      ctx.stroke();
      ctx.fillStyle = "#93c5fd";
      ctx.fillText("Glass Window", win.x - 84, win.y1 + 14);

      // Table / furniture
      ctx.fillStyle = "#78350f";
      ctx.fillRect(table.x, table.y, table.w, 12);
      ctx.fillRect(table.x + 12, table.y + 12, 10, table.h - 12);
      ctx.fillRect(table.x + table.w - 22, table.y + 12, 10, table.h - 12);
      ctx.fillStyle = "#cbd5e1";
      ctx.font = "11px Inter, sans-serif";
      ctx.fillText("Wooden Table", table.x + 22, table.y + 34);

      // Ceiling bulb
      ctx.strokeStyle = "#64748b";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bulb.x, room.top);
      ctx.lineTo(bulb.x, bulb.y - 8);
      ctx.stroke();

      if (lightOn) {
        const bGrad = ctx.createRadialGradient(bulb.x, bulb.y, 2, bulb.x, bulb.y, 38);
        bGrad.addColorStop(0, "rgba(253, 224, 71, 0.95)");
        bGrad.addColorStop(1, "rgba(253, 224, 71, 0)");
        ctx.fillStyle = bGrad;
        ctx.beginPath();
        ctx.arc(bulb.x, bulb.y, 38, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = lightOn ? "#fef08a" : "#475569";
      ctx.beginPath();
      ctx.arc(bulb.x, bulb.y, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#94a3b8";
      ctx.fillText("LED Bulb", bulb.x - 24, bulb.y + 22);

      // Human Eye / Observer
      ctx.fillStyle = "#e2e8f0";
      ctx.beginPath();
      ctx.arc(eye.x, eye.y, eye.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#0284c7";
      ctx.beginPath();
      ctx.arc(eye.x - 6, eye.y, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#020617";
      ctx.beginPath();
      ctx.arc(eye.x - 8, eye.y, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#cbd5e1";
      ctx.fillText("Eye (Retina)", eye.x - 28, eye.y + 30);
    }

    function frame() {
      frameCount++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (lightOn && frameCount % 3 === 0) {
        emitPhotons(3);
      }

      if (showIR && frameCount % 9 === 0) {
        emitIRPhoton();
      }

      const substeps = timeScale === "fast" ? 7 : timeScale === "slow" ? 3 : 2;
      stepPhotons(substeps);
      if (!lightOn && timeScale === "realtime") {
        // Real-time mode: visible photons extinguish in ~500 ns (instantaneous to human eyes)
        const anyVis = photons.some((p) => !p.isIR);
        if (anyVis) extinguishVisibleRealtime();
      }

      const activeVis = photons.filter((p) => !p.isIR && !p.outside).length;
      const activeIR = photons.filter((p) => p.isIR && !p.outside).length;

      drawRoomGeometry(activeVis, activeIR);

      // Heat absorption flashes (phonons!)
      for (let i = heatFlashes.length - 1; i >= 0; i--) {
        const f = heatFlashes[i];
        f.life--;
        ctx.fillStyle = f.color;
        ctx.globalAlpha = f.life / 22;
        ctx.beginPath();
        ctx.arc(f.x, f.y, (24 - f.life) * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        if (f.life <= 0) heatFlashes.splice(i, 1);
      }

      // Render photons
      for (const p of photons) {
        if (p.isIR) {
          drawWavepacket(ctx, p.x, p.y, p.vx, p.vy, "rgba(251, 146, 60, 0.78)", p.phase, 30, 4.5);
          ctx.fillStyle = "rgba(251, 146, 60, 0.8)";
          ctx.font = "9px JetBrains Mono, monospace";
          ctx.fillText("IR", p.x + 6, p.y - 6);
        } else {
          drawWavepacket(ctx, p.x, p.y, p.vx, p.vy, p.color, p.phase, 22, 3.5);
        }
      }

      const decayStatus = lightOn
        ? "Bulb emitting (~10¹⁹ visible photons/s in reality)"
        : activeVis > 0
        ? `Slow-mo decay: ${offNanoseconds.toFixed(0)} ns after switch off (${activeVis} visible left)`
        : showIR
        ? `Visible dark in ~${offNanoseconds.toFixed(0)} ns — ${activeIR} thermal IR (10 µm) photons still active!`
        : `Visible dark in ~${offNanoseconds.toFixed(0)} ns (all visible photons absorbed/escaped!)`;

      readout.innerHTML =
        `<span>Visible In-Flight: <strong>${activeVis}</strong></span>` +
        `<span>Thermal IR (10 µm): <strong>${activeIR}</strong></span>` +
        `<span>Absorbed → Heat: <strong>${stats.absorbed}</strong></span>` +
        `<span>Escaped Window: <strong>${stats.escaped}</strong></span>` +
        `<span>Hit Retina: <strong>${stats.vision}</strong></span>` +
        `<span>Status: <strong>${decayStatus}</strong></span>`;

      requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }

  /* ========================================================================
     3. ELECTROMAGNETIC SPECTRUM & PHOTON PROPERTIES EXPLORER
     ======================================================================== */
  function initSpectrumExplorer() {
    const slider = document.getElementById("em-slider");
    if (!slider) return;
    const presetBtns = document.querySelectorAll("[data-em-exp]");
    const readout = document.getElementById("em-readout");
    const swatch = document.getElementById("em-swatch");

    const REGIMES = [
      { maxNm: 0.01, name: "Gamma Rays", gen: "Nuclear decay, particle-antiparticle annihilation", matter: "Nuclear excitation & pair production (deeply ionizing)" },
      { maxNm: 10, name: "X-Rays", gen: "Inner-shell electron drops, Bremsstrahlung in X-ray tubes", matter: "Ionizes core electrons; passes through soft tissue, absorbed by bone" },
      { maxNm: 380, name: "Ultraviolet (UV)", gen: "High-energy atomic transitions, mercury plasma, Sun", matter: "Breaks chemical bonds, causes sunburn, excites fluorescent dyes" },
      { maxNm: 750, name: "Visible Light", gen: "Valence electron jumps, LEDs, incandescent filaments, Sun", matter: "Excite valence electrons -> vision (retina), photosynthesis, color" },
      { maxNm: 1e6, name: "Infrared (IR)", gen: "Thermal vibrations (~300 K walls emit ~10 µm), IR LEDs", matter: "Excites molecular vibrations & rotations -> felt directly as heat" },
      { maxNm: 1e9, name: "Microwaves", gen: "Magnetrons, Wi-Fi/5G antennas, Cosmic Microwave Background", matter: "Rotates polar water molecules (microwave oven) or drives AC currents" },
      { maxNm: Infinity, name: "Radio Waves", gen: "Macroscopic oscillating currents in broadcast antennas", matter: "Induces oscillating voltages in receiving antennas; passes right through walls" },
    ];

    function update(logMeters) {
      const lambdaM = Math.pow(10, logMeters);
      const lambdaNm = lambdaM * 1e9;
      const freq = C_LIGHT / lambdaM;
      const energyJ = H_PLANCK_J * freq;
      const energyEv = H_PLANCK_EV * freq;
      const momentum = H_PLANCK_J / lambdaM;

      const regime = REGIMES.find((r) => lambdaNm <= r.maxNm) || REGIMES[REGIMES.length - 1];

      let lambdaStr;
      if (lambdaM >= 1) lambdaStr = `${lambdaM.toPrecision(3)} m`;
      else if (lambdaM >= 1e-3) lambdaStr = `${(lambdaM * 1e3).toPrecision(3)} mm`;
      else if (lambdaM >= 1e-6) lambdaStr = `${(lambdaM * 1e6).toPrecision(3)} µm`;
      else if (lambdaM >= 1e-9) lambdaStr = `${(lambdaM * 1e9).toPrecision(3)} nm`;
      else lambdaStr = `${(lambdaM * 1e12).toPrecision(3)} pm`;

      if (swatch) {
        if (lambdaNm >= 380 && lambdaNm <= 750) {
          swatch.style.background = wavelengthToCSS(lambdaNm);
          swatch.textContent = "Visible";
        } else {
          swatch.style.background = "#1e293b";
          swatch.textContent = "Invisible";
        }
      }

      readout.innerHTML =
        `<div><strong>Band:</strong> ${regime.name}</div>` +
        `<div><strong>Wavelength (λ):</strong> ${lambdaStr}</div>` +
        `<div><strong>Frequency (ν):</strong> ${formatSci(freq, "Hz")}</div>` +
        `<div><strong>Photon Energy (E):</strong> ${formatSci(energyEv, "eV")} (${formatSci(energyJ, "J")})</div>` +
        `<div><strong>Momentum (p = h/λ):</strong> ${formatSci(momentum, "kg·m/s")}</div>` +
        `<div><strong>Typical Source:</strong> ${regime.gen}</div>` +
        `<div><strong>Interaction with Matter:</strong> ${regime.matter}</div>`;
    }

    slider.addEventListener("input", () => update(parseFloat(slider.value)));

    presetBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const exp = parseFloat(btn.dataset.emExp);
        slider.value = String(exp);
        update(exp);
      });
    });

    update(parseFloat(slider.value));
  }

  document.addEventListener("DOMContentLoaded", () => {
    initGenerationSim();
    initRoomSim();
    initSpectrumExplorer();
  });
})();
