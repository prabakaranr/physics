/* ==========================================================================
   Reflection & Scattering of Light — Interactive Simulations
   1. Reflection Lab: Specular (Mirror) vs. Diffuse (Rough Surface)
   2. Atmosphere Scattering Lab: Rayleigh (Blue Sky & Red Sunset) vs. Mie (White Clouds)
   ========================================================================== */

(function () {
  /* ========================================================================
     1. REFLECTION LAB (Specular vs. Diffuse)
     ======================================================================== */
  function initReflectionLab() {
    const canvas = document.getElementById("reflection-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const angleSlider = document.getElementById("refl-angle-slider");
    const angleVal = document.getElementById("refl-angle-val");
    const surfaceSelect = document.getElementById("surface-select");
    const readout = document.getElementById("refl-readout");

    let angleDeg = 45;
    let surfaceType = "specular"; // 'specular' | 'diffuse'
    let time = 0;

    if (angleSlider) {
      angleSlider.addEventListener("input", () => {
        angleDeg = parseFloat(angleSlider.value);
        if (angleVal) angleVal.textContent = `${angleDeg}°`;
      });
    }

    if (surfaceSelect) {
      surfaceSelect.addEventListener("change", () => {
        surfaceType = surfaceSelect.value;
      });
    }

    function drawSurface(cx, cy, width, isRough) {
      ctx.save();
      const halfW = width * 0.5;

      if (!isRough) {
        // Specular Mirror (smooth silver bar)
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(cx - halfW, cy, width, 24);
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(cx - halfW, cy);
        ctx.lineTo(cx + halfW, cy);
        ctx.stroke();

        ctx.fillStyle = "#94a3b8";
        ctx.font = "11px Inter, sans-serif";
        ctx.fillText("Smooth Mirror Surface", cx - 60, cy + 18);
      } else {
        // Diffuse Rough Surface (microscopic bumps)
        ctx.fillStyle = "#334155";
        ctx.fillRect(cx - halfW, cy, width, 24);
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx - halfW, cy);
        for (let x = cx - halfW; x <= cx + halfW; x += 10) {
          const bump = Math.sin(x * 0.45) * 3 + Math.cos(x * 0.8) * 2;
          ctx.lineTo(x, cy + bump);
        }
        ctx.stroke();

        ctx.fillStyle = "#cbd5e1";
        ctx.font = "11px Inter, sans-serif";
        ctx.fillText("Microscopically Rough Surface (Paper, Wall)", cx - 110, cy + 18);
      }
      ctx.restore();
    }

    function frame() {
      time++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const hitX = canvas.width * 0.5;
      const hitY = 220;
      const rayLen = 170;

      // Normal line (perpendicular to surface at 90°)
      ctx.strokeStyle = "rgba(148, 163, 184, 0.35)";
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(hitX, hitY - 180);
      ctx.lineTo(hitX, hitY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "11px JetBrains Mono, monospace";
      ctx.fillText("Normal Line (90°)", hitX + 8, hitY - 155);

      // Incident ray (shining down from top-left)
      const rad = (angleDeg * Math.PI) / 180;
      const srcX = hitX - Math.sin(rad) * rayLen;
      const srcY = hitY - Math.cos(rad) * rayLen;

      // Incident ray beam
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 3.5;
      ctx.shadowColor = "#fbbf24";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(srcX, srcY);
      ctx.lineTo(hitX, hitY);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Angle of incidence arc
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(hitX, hitY, 45, -Math.PI * 0.5 - rad, -Math.PI * 0.5);
      ctx.stroke();
      ctx.fillStyle = "#fbbf24";
      ctx.font = "11px Inter, sans-serif";
      ctx.fillText(`θi = ${angleDeg}°`, hitX - 38, hitY - 55);

      // Light source icon
      ctx.fillStyle = "#fef08a";
      ctx.beginPath();
      ctx.arc(srcX, srcY, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#94a3b8";
      ctx.fillText("Light Source", srcX - 35, srcY - 14);

      // Draw surface
      drawSurface(hitX, hitY, 560, surfaceType === "diffuse");

      if (surfaceType === "specular") {
        // Specular: Single sharp reflected ray at exact same angle (θr = θi)
        const refX = hitX + Math.sin(rad) * rayLen;
        const refY = hitY - Math.cos(rad) * rayLen;

        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 3.5;
        ctx.shadowColor = "#38bdf8";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(hitX, hitY);
        ctx.lineTo(refX, refY);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Angle of reflection arc
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(hitX, hitY, 45, -Math.PI * 0.5, -Math.PI * 0.5 + rad);
        ctx.stroke();
        ctx.fillStyle = "#38bdf8";
        ctx.fillText(`θr = ${angleDeg}°`, hitX + 16, hitY - 55);

        if (readout) {
          readout.innerHTML =
            `<span>Law of Reflection: <strong>Angle of Incidence (θi) = Angle of Reflection (θr) = ${angleDeg}°</strong></span>` +
            `<span>Surface: <strong>Specular (Smooth Mirror)</strong> — All rays stay in parallel order</span>`;
        }
      } else {
        // Diffuse: Scatters in many random directions because each micro-facet has a different normal
        const numRays = 9;
        ctx.lineWidth = 2;
        for (let i = 0; i < numRays; i++) {
          const spread = -Math.PI * 0.45 + (i / (numRays - 1)) * Math.PI * 0.9;
          const rx = hitX + Math.sin(spread) * (rayLen * (0.6 + 0.35 * Math.cos(spread)));
          const ry = hitY - Math.cos(spread) * (rayLen * (0.6 + 0.35 * Math.cos(spread)));

          ctx.strokeStyle = "rgba(251, 146, 60, 0.75)";
          ctx.beginPath();
          ctx.moveTo(hitX, hitY);
          ctx.lineTo(rx, ry);
          ctx.stroke();
        }

        if (readout) {
          readout.innerHTML =
            `<span>Scattered Bounces: <strong>Diffuse Reflection</strong></span>` +
            `<span>Reason: <strong>Microscopic surface bumps reflect light in all directions</strong> (why you can see paper/walls from any angle!)</span>`;
        }
      }

      requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }

  /* ========================================================================
     2. ATMOSPHERE SCATTERING LAB (Rayleigh Sky & Sunset vs. Mie Clouds)
     ======================================================================== */
  function initScatteringLab() {
    const canvas = document.getElementById("scattering-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const timeSlider = document.getElementById("sun-time-slider");
    const timeVal = document.getElementById("sun-time-val");
    const cloudCheck = document.getElementById("cloud-toggle");
    const readout = document.getElementById("scat-readout");

    let sunAltitude = 75; // degrees above horizon (90 = noon, 5 = sunset)
    let hasClouds = false;
    let particles = [];

    // Initialize atmospheric air particles
    for (let i = 0; i < 90; i++) {
      particles.push({
        x: 60 + Math.random() * 700,
        y: 40 + Math.random() * 170,
        scatterBlue: Math.random() < 0.65,
        phase: Math.random() * 10,
      });
    }

    if (timeSlider) {
      timeSlider.addEventListener("input", () => {
        sunAltitude = parseFloat(timeSlider.value);
        if (timeVal) {
          const label = sunAltitude > 60 ? "Noon (High Sun)" : sunAltitude > 20 ? "Late Afternoon" : "Sunset (Low Sun)";
          timeVal.textContent = `${sunAltitude}° — ${label}`;
        }
      });
    }

    if (cloudCheck) {
      cloudCheck.addEventListener("change", () => {
        hasClouds = cloudCheck.checked;
      });
    }

    function getSkyColor(alt) {
      // Color gradient from noon blue to twilight deep orange/purple
      if (alt > 50) {
        return { top: "#0284c7", bottom: "#bae6fd", sunCol: "#fef08a" }; // Bright blue sky
      } else if (alt > 20) {
        return { top: "#0369a1", bottom: "#fed7aa", sunCol: "#fde047" }; // Afternoon golden
      } else {
        return { top: "#1e1b4b", bottom: "#ea580c", sunCol: "#ef4444" }; // Deep red/orange sunset
      }
    }

    function frame() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const sky = getSkyColor(sunAltitude);

      // Sky Background Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 240);
      skyGrad.addColorStop(0, sky.top);
      skyGrad.addColorStop(1, sky.bottom);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvas.width, 240);

      // Ground (Earth curve)
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 240, canvas.width, canvas.height - 240);
      ctx.strokeStyle = "rgba(148, 163, 184, 0.4)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 240);
      ctx.lineTo(canvas.width, 240);
      ctx.stroke();

      // Observer on the ground
      const obsX = canvas.width * 0.72;
      ctx.fillStyle = "#e2e8f0";
      ctx.beginPath();
      ctx.arc(obsX, 233, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#94a3b8";
      ctx.font = "11px Inter, sans-serif";
      ctx.fillText("Observer on Ground", obsX - 52, 258);

      // Sun position based on altitude slider
      const sunRad = (sunAltitude * Math.PI) / 180;
      const sunDist = 320;
      const sunX = obsX - Math.cos(sunRad) * sunDist;
      const sunY = 240 - Math.sin(sunRad) * sunDist * 0.65;

      // Draw Sun
      ctx.fillStyle = sky.sunCol;
      ctx.shadowColor = sky.sunCol;
      ctx.shadowBlur = 24;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Sunlight beam through the atmosphere to observer
      // At low altitude, beam travels through ~10x more atmosphere!
      const pathDist = Math.hypot(obsX - sunX, 235 - sunY);
      const isSunset = sunAltitude <= 20;

      ctx.strokeStyle = isSunset ? "rgba(239, 68, 68, 0.7)" : "rgba(253, 224, 71, 0.65)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(sunX, sunY);
      ctx.lineTo(obsX, 235);
      ctx.stroke();

      // Atmospheric scattering particles
      particles.forEach((p) => {
        p.phase += 0.05;
        // Rayleigh: Blue light scatters in all directions across the sky
        if (!isSunset && p.scatterBlue) {
          ctx.fillStyle = "rgba(56, 189, 248, 0.6)";
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
          ctx.fill();

          // Little scattering ripples
          ctx.strokeStyle = "rgba(56, 189, 248, 0.25)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 6 + Math.sin(p.phase) * 3, 0, Math.PI * 2);
          ctx.stroke();
        } else if (isSunset) {
          // At sunset, blue is scattered away miles back; only red/orange survives along the path!
          if (p.x < obsX - 100) {
            ctx.fillStyle = "rgba(56, 189, 248, 0.25)";
            ctx.beginPath();
            ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });

      // Optional Cloud (Mie scattering)
      if (hasClouds) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        ctx.shadowColor = "rgba(255, 255, 255, 0.4)";
        ctx.shadowBlur = 14;
        const cx = 310, cy = 90;
        ctx.beginPath();
        ctx.arc(cx - 30, cy, 22, 0, Math.PI * 2);
        ctx.arc(cx, cy - 14, 28, 0, Math.PI * 2);
        ctx.arc(cx + 32, cy, 24, 0, Math.PI * 2);
        ctx.arc(cx, cy + 6, 24, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = "#0f172a";
        ctx.font = "10px Inter, sans-serif";
        ctx.fillText("Cloud (Mie Scattering: All colors scatter equally = White)", cx - 110, cy + 38);
      }

      // Readout update
      if (readout) {
        if (sunAltitude > 50) {
          readout.innerHTML =
            `<span>Rayleigh Scattering (λ⁻⁴ Rule): <strong>Blue light scatters ~10× more than red</strong></span>` +
            `<span>Result: <strong>Scattered blue photons fill the daytime sky in every direction!</strong></span>`;
        } else if (sunAltitude > 20) {
          readout.innerHTML =
            `<span>Sun Angle Dropping: <strong>Sunlight travels through 3× more air</strong></span>` +
            `<span>Result: <strong>Golden hour — blue begins scattering away, leaving yellow &amp; amber</strong></span>`;
        } else {
          readout.innerHTML =
            `<span>Sunset Geometry: <strong>Sunlight travels through 10× more atmosphere</strong></span>` +
            `<span>Result: <strong>Virtually ALL blue light scatters away before reaching you — only RED arrives!</strong></span>`;
        }
      }

      requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }

  document.addEventListener("DOMContentLoaded", () => {
    initReflectionLab();
    initScatteringLab();
  });
})();
