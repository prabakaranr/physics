/* ==========================================================================
   Casper Cloaking Film & Polarization — Interactive Simulations
   1. Interactive Conference Room Cloaking Simulator (Screens Cloaked vs. People Visible)
   2. Wave Polarization & Malus's Law Lab (I = I₀ cos²θ)
   ========================================================================== */

(function () {
  /* ========================================================================
     1. CASPER CLOAKING ROOM SIMULATOR
     ======================================================================== */
  function initCasperRoomSim() {
    const canvas = document.getElementById("casper-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const filmToggle = document.getElementById("film-toggle");
    const angleSlider = document.getElementById("polar-angle-slider");
    const angleVal = document.getElementById("polar-angle-val");
    const readout = document.getElementById("casper-readout");

    let filmActive = true;
    let angleDeg = 90; // 90° = cross-polarized (100% cloaked)
    let time = 0;

    if (filmToggle) {
      filmToggle.addEventListener("click", () => {
        filmActive = !filmActive;
        filmToggle.textContent = filmActive ? "🛡️ Casper Film: ON (Screens Cloaked)" : "🪟 Ordinary Glass (Film OFF)";
        filmToggle.classList.toggle("amber-on", filmActive);
      });
    }

    if (angleSlider) {
      angleSlider.addEventListener("input", () => {
        angleDeg = parseFloat(angleSlider.value);
        if (angleVal) angleVal.textContent = `${angleDeg}°`;
      });
    }

    function frame() {
      time++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Transparency factor of screen based on Malus's law: I = cos²(θ)
      // Screen emits light polarized at 0°. Film filters at angleDeg.
      const rad = (angleDeg * Math.PI) / 180;
      const screenTransmission = filmActive ? Math.pow(Math.cos(rad), 2) : 1.0;

      // Unpolarized room objects (people, whiteboard) only dim slightly (~85% bright) through film
      const roomDim = filmActive ? 0.88 : 1.0;

      // 1. Conference Room Background (Wall & Floor)
      ctx.fillStyle = filmActive ? "#0d1526" : "#111a2e";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Floor
      ctx.fillStyle = filmActive ? "#1e293b" : "#24324a";
      ctx.fillRect(0, 250, canvas.width, canvas.height - 250);

      // 2. Whiteboard on Left Wall (Diffuse light - NEVER cloaked!)
      ctx.fillStyle = "#f8fafc";
      ctx.globalAlpha = roomDim;
      ctx.fillRect(40, 60, 150, 110);
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 3;
      ctx.strokeRect(40, 60, 150, 110);
      ctx.fillStyle = "#0284c7";
      ctx.font = "11px Inter, sans-serif";
      ctx.fillText("Whiteboard Notes", 52, 85);
      ctx.fillStyle = "#475569";
      ctx.fillText("• Q4 Revenue +38%", 52, 108);
      ctx.fillText("• Product Launch", 52, 128);
      ctx.fillText("• Confidential Design", 52, 148);
      ctx.globalAlpha = 1.0;

      // 3. Large Presentation Display Screen (Linearly Polarized Light!)
      const screenX = 230, screenY = 45, screenW = 260, screenH = 150;
      // TV Bezel
      ctx.fillStyle = "#020617";
      ctx.fillRect(screenX - 8, screenY - 8, screenW + 16, screenH + 16);
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 2;
      ctx.strokeRect(screenX - 8, screenY - 8, screenW + 16, screenH + 16);

      // TV Display Content (Modulated by screenTransmission)
      if (screenTransmission > 0.04) {
        ctx.save();
        ctx.globalAlpha = screenTransmission;

        // Presentation slide background
        ctx.fillStyle = "#0284c7";
        ctx.fillRect(screenX, screenY, screenW, screenH);

        // Slide graph / confidential text
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 13px Inter, sans-serif";
        ctx.fillText("CONFIDENTIAL PROJECT", screenX + 30, screenY + 35);

        // Bar chart on slide
        ctx.fillStyle = "#34d399";
        ctx.fillRect(screenX + 30, screenY + 80, 25, 45);
        ctx.fillStyle = "#facc15";
        ctx.fillRect(screenX + 65, screenY + 60, 25, 65);
        ctx.fillStyle = "#f87171";
        ctx.fillRect(screenX + 100, screenY + 45, 25, 80);

        ctx.fillStyle = "#e0f2fe";
        ctx.font = "10px JetBrains Mono, monospace";
        ctx.fillText("Financials & Patents", screenX + 30, screenY + 140);
        ctx.restore();
      } else {
        // 100% Cloaked: Pitch Black TV Screen!
        ctx.fillStyle = "#000000";
        ctx.fillRect(screenX, screenY, screenW, screenH);
        ctx.fillStyle = "#64748b";
        ctx.font = "11px Inter, sans-serif";
        ctx.fillText("🚫 [Screen Cloaked / Blacked Out]", screenX + 35, screenY + 80);
      }

      // 4. Conference Table & Person (Unpolarized light - ALWAYS visible!)
      ctx.globalAlpha = roomDim;
      // Table
      ctx.fillStyle = "#78350f";
      ctx.fillRect(520, 210, 240, 16);
      ctx.fillRect(540, 226, 14, 60);
      ctx.fillRect(720, 226, 14, 60);

      // Person sitting at table
      // Head
      ctx.fillStyle = "#fed7aa";
      ctx.beginPath();
      ctx.arc(640, 155, 18, 0, Math.PI * 2);
      ctx.fill();
      // Body
      ctx.fillStyle = "#0369a1";
      ctx.beginPath();
      ctx.roundRect(615, 175, 50, 50, 10);
      ctx.fill();
      // Coffee mug on table
      ctx.fillStyle = "#f43f5e";
      ctx.fillRect(560, 195, 12, 15);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "10px Inter, sans-serif";
      ctx.fillText("Person Visible", 605, 130);
      ctx.globalAlpha = 1.0;

      // 5. Glass Wall & Casper Film Overlay
      if (filmActive) {
        ctx.fillStyle = "rgba(56, 189, 248, 0.05)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Subtle Casper branding / film glass border
        ctx.strokeStyle = "rgba(56, 189, 248, 0.65)";
        ctx.lineWidth = 3;
        ctx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);

        ctx.fillStyle = "#38bdf8";
        ctx.font = "11px Inter, sans-serif";
        ctx.fillText("Casper Cloaking Film Applied to Glass (Cross-Polarized Filter)", 18, 25);
      } else {
        ctx.strokeStyle = "rgba(148, 163, 184, 0.3)";
        ctx.lineWidth = 2;
        ctx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);
        ctx.fillStyle = "#94a3b8";
        ctx.font = "11px Inter, sans-serif";
        ctx.fillText("Clear Glass Window (No Cloaking)", 18, 25);
      }

      // Readout update
      if (readout) {
        const cloakedPct = Math.round((1 - screenTransmission) * 100);
        readout.innerHTML =
          `<span>Screen Polarization: <strong>0° Linear</strong></span>` +
          `<span>Casper Filter Angle: <strong>${angleDeg}°</strong></span>` +
          `<span>Screen Blocked: <strong style="color: ${cloakedPct > 80 ? '#f43f5e' : '#38bdf8'}">${cloakedPct}% (Malus's Law)</strong></span>` +
          `<span>Room Objects: <strong>100% Visible (Unpolarized light passes through)</strong></span>`;
      }

      requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }

  /* ========================================================================
     2. WAVE POLARIZATION & MALUS'S LAW LAB (I = I₀ cos²θ)
     ======================================================================== */
  function initPolarizationWaveLab() {
    const canvas = document.getElementById("polar-wave-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const rotSlider = document.getElementById("filter-rot-slider");
    const rotVal = document.getElementById("filter-rot-val");
    const readout = document.getElementById("wave-readout");

    let filterAngle = 90; // degrees
    let phase = 0;

    if (rotSlider) {
      rotSlider.addEventListener("input", () => {
        filterAngle = parseFloat(rotSlider.value);
        if (rotVal) rotVal.textContent = `${filterAngle}°`;
      });
    }

    function frame() {
      phase += 0.08;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const rad = (filterAngle * Math.PI) / 180;
      const transmittedAmp = Math.cos(rad); // Amplitude factor: cos(θ)
      const intensity = Math.pow(transmittedAmp, 2); // Intensity: cos²(θ)

      const cy = 130;

      // 1. Light Source (Screen): Vertically Polarized EM Wave (x: 40 to 350)
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 3;
      ctx.shadowColor = "#38bdf8";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      for (let x = 40; x <= 350; x += 3) {
        const y = cy + Math.sin(x * 0.05 - phase) * 45;
        if (x === 40) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.fillStyle = "#38bdf8";
      ctx.font = "11px Inter, sans-serif";
      ctx.fillText("1. Polarized Light from Screen (100% Vertical)", 40, 42);

      // 2. Casper Cloaking Film (Polarizing Slits at x = 380)
      const slitX = 390;
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(slitX - 16, cy - 80, 32, 160);
      ctx.strokeStyle = "#a78bfa";
      ctx.lineWidth = 3;
      ctx.strokeRect(slitX - 16, cy - 80, 32, 160);

      // Draw Slits rotating with filterAngle
      ctx.save();
      ctx.translate(slitX, cy);
      ctx.rotate(rad);
      ctx.strokeStyle = "#facc15";
      ctx.lineWidth = 2.5;
      for (let offset = -50; offset <= 50; offset += 14) {
        ctx.beginPath();
        ctx.moveTo(offset, -40);
        ctx.lineTo(offset, 40);
        ctx.stroke();
      }
      ctx.restore();

      ctx.fillStyle = "#facc15";
      ctx.fillText(`2. Casper Filter (${filterAngle}°)`, slitX - 45, cy + 98);

      // 3. Transmitted Wave to Viewer's Eyes (x: 430 to 760)
      const amp = 45 * transmittedAmp;
      if (Math.abs(amp) > 1.5) {
        ctx.strokeStyle = "rgba(56, 189, 248, " + Math.max(0.15, intensity) + ")";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let x = 430; x <= 760; x += 3) {
          const y = cy + Math.sin(x * 0.05 - phase) * amp;
          if (x === 430) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else {
        // Flat zero line when 90° crossed
        ctx.strokeStyle = "rgba(148, 163, 184, 0.3)";
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(430, cy);
        ctx.lineTo(760, cy);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = "#f43f5e";
        ctx.font = "bold 12px Inter, sans-serif";
        ctx.fillText("✕ Wave Completely Blocked! (0% Light Reaches Eyes)", 440, cy - 14);
      }

      ctx.fillStyle = "#94a3b8";
      ctx.font = "11px Inter, sans-serif";
      ctx.fillText("3. Light Reaching Outside Viewer", 480, 42);

      // Readout update
      if (readout) {
        readout.innerHTML =
          `<span>Malus's Law: <strong>I = I₀ · cos²(${filterAngle}°) = ${(intensity * 100).toFixed(0)}% Light Passed</strong></span>` +
          `<span>Status: <strong style="color: ${intensity < 0.1 ? '#f43f5e' : '#34d399'}">${intensity < 0.05 ? "SCREEN CLOAKED (Pitch Black)" : "SCREEN VISIBLE"}</strong></span>`;
      }

      requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }

  document.addEventListener("DOMContentLoaded", () => {
    initCasperRoomSim();
    initPolarizationWaveLab();
  });
})();
