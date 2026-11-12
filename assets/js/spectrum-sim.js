/* ==========================================================================
   Colors & Electromagnetic Spectrum — Interactive Simulations
   1. Full EM Spectrum Wave Simulator (Gamma to Radio, Visible & Invisible)
   2. Visible Color Wavelength Tuner (380 nm to 750 nm Rainbow Explorer)
   ========================================================================== */

(function () {
  const C_LIGHT = 299792458; // m/s
  const H_EV = 4.135667696e-15; // eV·s

  function wavelengthToCSS(nm) {
    if (nm < 380) return "#7c3aed"; // UV representation
    if (nm > 750) return "#dc2626"; // IR representation
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

  /* ========================================================================
     1. FULL EM SPECTRUM & WAVE OSCILLATOR
     ======================================================================== */
  function initFullSpectrumSim() {
    const canvas = document.getElementById("full-em-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const slider = document.getElementById("em-log-slider");
    const presetBtns = document.querySelectorAll("[data-em-preset]");
    const readout = document.getElementById("full-em-readout");

    let logWavelength = -6.25; // ~560 nm (visible)
    let phase = 0;

    const BANDS = [
      { maxLog: -11.5, name: "Gamma Rays", visible: false, color: "#a855f7", example: "Nuclear reactions, cosmic rays, cancer radiation therapy" },
      { maxLog: -8.5, name: "X-Rays", visible: false, color: "#6366f1", example: "Medical bone scans, airport baggage security" },
      { maxLog: -6.42, name: "Ultraviolet (UV)", visible: false, color: "#818cf8", example: "Sunlight (causes sunburn/tans), blacklights, sterilization" },
      { maxLog: -6.12, name: "Visible Light", visible: true, color: "#34d399", example: "Only light human eyes can see! (Red, Green, Blue, Violet)" },
      { maxLog: -3.0, name: "Infrared (IR / Heat)", visible: false, color: "#f97316", example: "Thermal cameras, TV remotes, heat radiating from warm walls" },
      { maxLog: -0.5, name: "Microwaves", visible: false, color: "#ef4444", example: "Microwave ovens (heats water), Wi-Fi, 5G signals, radar" },
      { maxLog: Infinity, name: "Radio Waves", visible: false, color: "#e11d48", example: "FM/AM radio broadcasts, TV transmissions, walkie-talkies" },
    ];

    function getBand(logVal) {
      return BANDS.find((b) => logVal <= b.maxLog) || BANDS[BANDS.length - 1];
    }

    if (slider) {
      slider.addEventListener("input", () => {
        logWavelength = parseFloat(slider.value);
      });
    }

    presetBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const val = parseFloat(btn.dataset.emPreset);
        if (slider) slider.value = String(val);
        logWavelength = val;
      });
    });

    function frame() {
      phase += 0.08;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const band = getBand(logWavelength);
      const lambdaM = Math.pow(10, logWavelength);
      const freqHz = C_LIGHT / lambdaM;
      const energyEv = H_EV * freqHz;

      // Draw Top Spectrum Ribbon Bar (Radio to Gamma)
      const barY = 32;
      const barH = 26;
      const barW = canvas.width - 60;
      const barX = 30;

      // Multi-stop gradient showing full spectrum
      const ribbon = ctx.createLinearGradient(barX, 0, barX + barW, 0);
      ribbon.addColorStop(0, "#e11d48");    // Radio
      ribbon.addColorStop(0.25, "#f97316"); // IR
      ribbon.addColorStop(0.48, "#22c55e"); // Visible
      ribbon.addColorStop(0.52, "#38bdf8"); // Visible
      ribbon.addColorStop(0.68, "#818cf8"); // UV
      ribbon.addColorStop(0.85, "#6366f1"); // X-ray
      ribbon.addColorStop(1, "#a855f7");    // Gamma
      ctx.fillStyle = ribbon;
      ctx.fillRect(barX, barY, barW, barH);
      ctx.strokeStyle = "rgba(148, 163, 184, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(barX, barY, barW, barH);

      // Labels on Ribbon
      ctx.fillStyle = "#ffffff";
      ctx.font = "10px Inter, sans-serif";
      ctx.fillText("Radio", barX + 10, barY + 17);
      ctx.fillText("IR", barX + barW * 0.28, barY + 17);
      ctx.fillText("VIS", barX + barW * 0.48, barY + 17);
      ctx.fillText("UV", barX + barW * 0.65, barY + 17);
      ctx.fillText("X-Ray", barX + barW * 0.8, barY + 17);
      ctx.fillText("Gamma", barX + barW - 46, barY + 17);

      // Marker for current slider position
      // Slider range is 3 (Radio) down to -13 (Gamma)
      const normPos = (3 - logWavelength) / 16;
      const markerX = barX + Math.max(0, Math.min(barW, normPos * barW));

      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(markerX, barY - 6);
      ctx.lineTo(markerX - 6, barY - 14);
      ctx.lineTo(markerX + 6, barY - 14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Lower Area: Dynamic Oscillating EM Wave
      const waveCenterY = 165;
      const waveH = 46;

      // Visual wavelength mapping on screen (shorter wavelength = tighter ripples)
      // Visual spatial freq mapped from 0.015 (long radio wave) to 0.45 (ultra-tight gamma wave)
      const visualFreq = 0.015 + (1 - (logWavelength - (-13)) / 16) * 0.35;

      ctx.strokeStyle = band.color;
      ctx.lineWidth = 3.5;
      ctx.shadowColor = band.color;
      ctx.shadowBlur = 12;
      ctx.beginPath();

      for (let x = 30; x <= canvas.width - 30; x += 2) {
        const y = waveCenterY + Math.sin(x * visualFreq - phase) * waveH;
        if (x === 30) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Status pill on canvas
      ctx.fillStyle = band.visible ? "#059669" : "#334155";
      ctx.beginPath();
      ctx.roundRect(canvas.width - 170, 72, 140, 26, 6);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "11px Inter, sans-serif";
      ctx.fillText(band.visible ? "👁️ Visible to Humans" : "🚫 Invisible to Humans", canvas.width - 160, 89);

      // Readout update
      if (readout) {
        let sizeText =
          lambdaM >= 1 ? `${lambdaM.toFixed(1)} meters (Building / Human size)`
          : lambdaM >= 1e-3 ? `${(lambdaM * 1e3).toFixed(1)} mm (Insect size)`
          : lambdaM >= 1e-6 ? `${(lambdaM * 1e6).toFixed(1)} µm (Bacteria / Cell size)`
          : lambdaM >= 1e-9 ? `${(lambdaM * 1e9).toFixed(0)} nm (Molecule size)`
          : `${(lambdaM * 1e12).toFixed(1)} pm (Atom / Nucleus size)`;

        readout.innerHTML =
          `<span>Band: <strong>${band.name}</strong></span>` +
          `<span>Wavelength: <strong>${sizeText}</strong></span>` +
          `<span>Photon Energy: <strong>${energyEv < 0.01 ? (energyEv * 1000).toFixed(2) + " meV" : energyEv > 1e4 ? (energyEv / 1e3).toFixed(1) + " keV" : energyEv.toFixed(2) + " eV"}</strong></span>` +
          `<span>Common Uses: <strong>${band.example}</strong></span>`;
      }

      requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }

  /* ========================================================================
     2. VISIBLE COLOR RAINBOW TUNER (380 nm to 750 nm)
     ======================================================================== */
  function initRainbowTuner() {
    const slider = document.getElementById("color-nm-slider");
    const swatch = document.getElementById("color-swatch-box");
    const nameLabel = document.getElementById("color-name-label");
    const readout = document.getElementById("color-readout");

    if (!slider) return;

    function getColorName(nm) {
      if (nm < 450) return "Violet";
      if (nm < 495) return "Blue";
      if (nm < 570) return "Green";
      if (nm < 590) return "Yellow";
      if (nm < 620) return "Orange";
      return "Red";
    }

    function update() {
      const nm = parseFloat(slider.value);
      const colorCss = wavelengthToCSS(nm);
      const colorName = getColorName(nm);
      const freq = (C_LIGHT / (nm * 1e-9)) / 1e12; // THz
      const energyEv = H_EV * (C_LIGHT / (nm * 1e-9));

      if (swatch) {
        swatch.style.background = colorCss;
      }
      if (nameLabel) {
        nameLabel.textContent = `${nm} nm — ${colorName}`;
        nameLabel.style.color = colorCss;
      }

      if (readout) {
        readout.innerHTML =
          `<span>Color: <strong>${colorName}</strong></span>` +
          `<span>Wavelength: <strong>${nm} nm</strong></span>` +
          `<span>Frequency: <strong>${freq.toFixed(0)} THz</strong></span>` +
          `<span>Photon Energy: <strong>${energyEv.toFixed(2)} eV</strong></span>`;
      }
    }

    slider.addEventListener("input", update);
    update();
  }

  document.addEventListener("DOMContentLoaded", () => {
    initFullSpectrumSim();
    initRainbowTuner();
  });
})();
