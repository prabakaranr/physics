/* ==========================================================================
   How 3D Movies Work & Stereoscopic Vision — Interactive Simulations
   1. Interactive 3D Cinema Simulator (Pop-out vs. Deep 3D, Glasses ON/OFF)
   2. 3D Technology Switcher (RealD Circular Polarization vs. Red/Cyan Anaglyph)
   ========================================================================== */

(function () {
  /* ========================================================================
     1. 3D CINEMA & BINOCULAR DISPARITY SIMULATOR
     ======================================================================== */
  function init3DCinemaSim() {
    const canvas = document.getElementById("threed-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const depthSlider = document.getElementById("depth-slider");
    const depthVal = document.getElementById("depth-val");
    const glassesBtn = document.getElementById("glasses-toggle");
    const techSelect = document.getElementById("tech-select");
    const readout = document.getElementById("threed-readout");

    let depthOffset = -35; // negative = pop-out into room; positive = deep behind screen
    let glassesOn = true;
    let techMode = "reald"; // 'reald' | 'anaglyph'
    let time = 0;

    if (depthSlider) {
      depthSlider.addEventListener("input", () => {
        depthOffset = parseFloat(depthSlider.value);
        if (depthVal) {
          const status = depthOffset < -10 ? "Pop-Out (In Front of Screen)" : depthOffset > 10 ? "Deep Inside (Behind Screen)" : "At Screen Level (Zero Depth)";
          depthVal.textContent = status;
        }
      });
    }

    if (glassesBtn) {
      glassesBtn.addEventListener("click", () => {
        glassesOn = !glassesOn;
        glassesBtn.textContent = glassesOn ? "👓 3D Glasses: ON (Merged 3D)" : "🚫 3D Glasses: OFF (Double Image)";
        glassesBtn.classList.toggle("amber-on", glassesOn);
      });
    }

    if (techSelect) {
      techSelect.addEventListener("change", () => {
        techMode = techSelect.value;
      });
    }

    function frame() {
      time++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const screenX = 540;
      const screenTop = 45;
      const screenBot = 275;
      const viewerX = 140;
      const viewerY = 160;
      const eyeSep = 36; // Interpupillary distance on canvas

      const leftEyeY = viewerY - eyeSep * 0.5;
      const rightEyeY = viewerY + eyeSep * 0.5;

      // 1. Draw Flat Movie Screen (Vertical silver wall)
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(screenX - 8, screenTop, 16, screenBot - screenTop);
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 3;
      ctx.strokeRect(screenX - 8, screenTop, 16, screenBot - screenTop);

      ctx.fillStyle = "#94a3b8";
      ctx.font = "11px Inter, sans-serif";
      ctx.fillText("Flat Theater Screen", screenX - 45, screenTop - 12);

      // 2. Screen Images (Left Eye Image & Right Eye Image separated on screen)
      // Parallax separation on screen:
      const screenLeftImgY = viewerY + depthOffset * 0.85;
      const screenRightImgY = viewerY - depthOffset * 0.85;

      // Color scheme based on technology
      const leftCol = techMode === "anaglyph" ? "rgba(239, 68, 68, 0.85)" : "rgba(56, 189, 248, 0.85)";
      const rightCol = techMode === "anaglyph" ? "rgba(6, 182, 212, 0.85)" : "rgba(168, 85, 247, 0.85)";

      // Draw projected spots on flat screen
      ctx.fillStyle = leftCol;
      ctx.beginPath();
      ctx.arc(screenX, screenLeftImgY, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = rightCol;
      ctx.beginPath();
      ctx.arc(screenX, screenRightImgY, 7, 0, Math.PI * 2);
      ctx.fill();

      // 3. Draw Viewer & Eyes
      // Head
      ctx.fillStyle = "#334155";
      ctx.beginPath();
      ctx.arc(viewerX - 25, viewerY, 35, 0, Math.PI * 2);
      ctx.fill();

      // Left Eye
      ctx.fillStyle = "#f8fafc";
      ctx.beginPath();
      ctx.arc(viewerX, leftEyeY, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#0284c7";
      ctx.beginPath();
      ctx.arc(viewerX + 4, leftEyeY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#94a3b8";
      ctx.font = "10px Inter, sans-serif";
      ctx.fillText("Left Eye", viewerX - 58, leftEyeY + 4);

      // Right Eye
      ctx.fillStyle = "#f8fafc";
      ctx.beginPath();
      ctx.arc(viewerX, rightEyeY, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#0284c7";
      ctx.beginPath();
      ctx.arc(viewerX + 4, rightEyeY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#94a3b8";
      ctx.fillText("Right Eye", viewerX - 64, rightEyeY + 4);

      // 3D Glasses on Viewer
      if (glassesOn) {
        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = 3;
        // Frame
        ctx.beginPath();
        ctx.moveTo(viewerX + 10, leftEyeY - 14);
        ctx.lineTo(viewerX + 10, rightEyeY + 14);
        ctx.stroke();

        // Left lens
        ctx.fillStyle = leftCol;
        ctx.beginPath();
        ctx.roundRect(viewerX + 8, leftEyeY - 11, 8, 22, 3);
        ctx.fill();

        // Right lens
        ctx.fillStyle = rightCol;
        ctx.beginPath();
        ctx.roundRect(viewerX + 8, rightEyeY - 11, 8, 22, 3);
        ctx.fill();

        ctx.fillStyle = "#cbd5e1";
        ctx.font = "10px Inter, sans-serif";
        ctx.fillText("3D Glasses Filter", viewerX + 4, viewerY - 32);
      }

      // 4. Trace Light Rays from Screen to Eyes
      if (!glassesOn) {
        // Without glasses: BOTH eyes see BOTH images -> blurry double image!
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = leftCol;
        ctx.beginPath();
        ctx.moveTo(screenX, screenLeftImgY);
        ctx.lineTo(viewerX + 5, leftEyeY);
        ctx.moveTo(screenX, screenLeftImgY);
        ctx.lineTo(viewerX + 5, rightEyeY);
        ctx.stroke();

        ctx.strokeStyle = rightCol;
        ctx.beginPath();
        ctx.moveTo(screenX, screenRightImgY);
        ctx.lineTo(viewerX + 5, leftEyeY);
        ctx.moveTo(screenX, screenRightImgY);
        ctx.lineTo(viewerX + 5, rightEyeY);
        ctx.stroke();

        // Double image indicator on screen
        ctx.fillStyle = "#f43f5e";
        ctx.font = "bold 11px Inter, sans-serif";
        ctx.fillText("Blurry Double Outline (No Depth)", screenX + 16, viewerY + 4);
      } else {
        // With glasses: Optical sorting! Left eye sees ONLY left image, Right eye sees ONLY right image
        ctx.lineWidth = 2.5;

        // Left Eye Ray
        ctx.strokeStyle = leftCol;
        ctx.beginPath();
        ctx.moveTo(screenX, screenLeftImgY);
        ctx.lineTo(viewerX + 16, leftEyeY);
        ctx.stroke();

        // Right Eye Ray
        ctx.strokeStyle = rightCol;
        ctx.beginPath();
        ctx.moveTo(screenX, screenRightImgY);
        ctx.lineTo(viewerX + 16, rightEyeY);
        ctx.stroke();

        // Calculate Brain's Perceived Convergence Point (The Virtual 3D Object!)
        // Intersection of line (viewerX, leftEyeY)->(screenX, screenLeftImgY)
        // and line (viewerX, rightEyeY)->(screenX, screenRightImgY)
        const slopeL = (screenLeftImgY - leftEyeY) / (screenX - viewerX);
        const slopeR = (screenRightImgY - rightEyeY) / (screenX - viewerX);

        let virtualX, virtualY;
        if (Math.abs(slopeL - slopeR) > 0.001) {
          virtualX = viewerX + (rightEyeY - leftEyeY) / (slopeL - slopeR);
          virtualY = leftEyeY + slopeL * (virtualX - viewerX);
        } else {
          virtualX = screenX;
          virtualY = viewerY;
        }

        // Draw the Brain's Perceived 3D Object in Space!
        ctx.save();
        ctx.fillStyle = "#fbbf24";
        ctx.shadowColor = "#fbbf24";
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(virtualX, virtualY, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = "#0f172a";
        ctx.font = "bold 10px Inter, sans-serif";
        ctx.fillText("3D", virtualX - 7, virtualY + 3);

        ctx.fillStyle = "#fbbf24";
        ctx.font = "11px Inter, sans-serif";
        if (virtualX < screenX - 25) {
          ctx.fillText("✨ Floating in Room (Pop-Out)", virtualX - 75, virtualY - 22);
        } else if (virtualX > screenX + 25) {
          ctx.fillText("🌌 Deep Behind Screen", virtualX - 60, virtualY - 22);
        } else {
          ctx.fillText("At Screen Level", virtualX - 40, virtualY - 22);
        }
        ctx.restore();
      }

      // Readout update
      if (readout) {
        const modeName = techMode === "reald" ? "Circular Polarization (RealD 3D)" : "Color Filtering (Red/Cyan Anaglyph)";
        const effectName =
          !glassesOn
            ? "Double Image (Brain cannot fuse into depth)"
            : depthOffset < -10
            ? "Negative Parallax: Object floats in the theater air!"
            : depthOffset > 10
            ? "Positive Parallax: Object sits deep inside the background"
            : "Zero Parallax: Object rests on the screen surface";

        readout.innerHTML =
          `<span>Technology: <strong>${modeName}</strong></span>` +
          `<span>Status: <strong>${glassesOn ? "Glasses Filtering Enabled" : "Glasses Removed"}</strong></span>` +
          `<span>Perception: <strong>${effectName}</strong></span>`;
      }

      requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }

  document.addEventListener("DOMContentLoaded", () => {
    init3DCinemaSim();
  });
})();
