# Physics Learning Notes

An interactive, modern static web application documenting 100+ physics concepts from first principles, complete with visual diagrams and real-time browser simulations.

## 🏛️ The 6 Fundamental Physics Pillars

1. **🔮 Light, Optics & Waves** (Topics 01–08+)
   - **[01. All About Photons: Creation to Final Fate](topics/photons.html)** (Live · Interactive)
   - **[02. How the Human Eye Works](topics/human-eye.html)** (Live · Interactive)
   - **[03. Reflection and Scattering of Light](topics/reflection-scattering.html)** (Live · Interactive)
   - **[04. Colors & the Light Spectrum (Visible & Invisible)](topics/light-spectrum.html)** (Live · Interactive)
   - **[05. Casper Cloaking Film & Polarization](topics/casper-film.html)** (Live · Interactive)
   - **[06. How 3D Movies Work (Stereoscopic Vision & 3D Glasses)](topics/3d-cinema.html)** (Live · Interactive)
   - *07. Refraction, Snell's Law & Fiber Optics* (Roadmap)
   - *08. Wave Interference & Young's Double Slit* (Roadmap)
   - *09. Diffraction & Optical Resolution Limits* (Roadmap)

2. **⚛️ Quantum & Atomic Physics** (Topics 09–13+)
   - *09. Bohr Atom & Quantized Orbitals*
   - *10. Wave-Particle Duality & de Broglie Matter Waves*
   - *11. Heisenberg's Uncertainty Principle*
   - *12. Quantum Tunneling*
   - *13. Electron Spin & Pauli Exclusion Principle*

3. **⚡ Electricity & Magnetism** (Topics 14–17+)
   - *14. Electric Charges & Coulomb's Law*
   - *15. Magnetic Fields & The Lorentz Force*
   - *16. Electromagnetic Induction & Faraday's Law*
   - *17. Maxwell's Equations*

4. **🔥 Thermodynamics & Heat** (Topics 18–20+)
   - *18. Heat, Temperature & Kinetic Motion*
   - *19. The Second Law of Thermodynamics & Entropy*
   - *20. Heat Engines & The Carnot Limit*

5. **🪐 Relativity & Cosmology** (Topics 21–24+)
   - *21. Special Relativity: Time Dilation & Length Contraction*
   - *22. Mass-Energy Equivalence: E = mc²*
   - *23. General Relativity & Curved Spacetime*
   - *24. Black Holes & Event Horizons*

6. **🏎️ Mechanics & Fluid Dynamics** (Topics 25–26+)
   - *25. Newton's Laws & Momentum Conservation*
   - *26. Bernoulli's Principle & Aerodynamic Lift*

---

## 🛠️ Scalable 100-Topic Architecture

- **`assets/js/topics-data.js`**: Central catalog of all domains and topics. Adding a new topic only requires appending an object here!
- **`assets/js/main.js`**: Dynamically generates grouped shelves, live search with `/` keyboard shortcut, and auto-generates Previous/Next navigation links.
- **`index.html`**: Modern hub with a learning progress bar, instant domain filtering, and stats counters.
- **`topics/*.html`**: Lightweight, visual, interactive topic pages with breadcrumbs and a **Jump to Topic** menu.

## 🚀 Preview Locally & Deploy

```bash
# Preview locally
python -m http.server 8000
# Open http://localhost:8000
```

Deploying to GitHub Pages is automatic upon push to `main` via [.github/workflows/static.yml](.github/workflows/static.yml).
Live at: **`https://prabakaranr.github.io/physics/`**
