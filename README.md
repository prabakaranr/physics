# Physics Learning Notes

An interactive, static GitHub Pages site documenting physics concepts from first principles, complete with visual explanations and browser-based simulations.

## Topics

1. **[All About Photons: Creation, Room Journey & Final Fate](topics/photons.html)**
   - Fundamental photon properties & QED wave-particle duality
   - Interactive EM Spectrum & Photon Calculator
   - Photon generation mechanisms (atomic transitions, LED bandgaps, blackbody thermal radiation, accelerating charges, annihilation)
   - Interactive Photon Generation Lab
   - Step-by-step lifecycle of light inside a room (~13 ns per bounce, reflection, color absorption, refraction, thermal phonons, infrared re-emission, and window escape)
   - Interactive Room Photon Simulator

2. **[How the Human Eye Works](topics/human-eye.html)**
   - Cornea and lens optics, pupil aperture, and inverted retinal imaging
   - Interactive Eye Ray-Tracing & Accommodation Simulator (Normal, Myopia, Hyperopia, corrective lenses)
   - Rods (~120M) vs. Cones (~6M)
   - The Molecular Switch (retinal 11-cis to all-trans isomerization) & Interactive Lab
   - Interactive Blind Spot test

3. **[Reflection and Scattering of Light](topics/reflection-scattering.html)**
   - The Law of Reflection: Angle of incidence = Angle of reflection ($\theta_i = \theta_r$)
   - Specular (mirror) vs. Diffuse (rough wall/paper) reflection & Interactive Reflection Lab
   - Rayleigh scattering ($1/\lambda^4$ rule) — why the sky is blue and sunsets are red
   - Interactive Sky & Sunset Scattering Lab
   - Mie scattering — why clouds and fog appear white

4. **[Colors & the Spectrum of Light (Visible & Invisible)](topics/light-spectrum.html)**
   - The full electromagnetic spectrum from Radio to Gamma rays
   - Interactive Full Spectrum Wave Simulator (wavelength vs. frequency & energy)
   - The visible rainbow sliver (380 nm – 750 nm) & Interactive Color Wavelength Tuner
   - The 6 invisible bands of light (Radio, Microwave, Infrared, UV, X-Ray, Gamma Ray)
   - Why human eyes cannot detect invisible light

## Structure

```text
.
├── .nojekyll               # Ensures GitHub Pages serves all static files directly
├── index.html              # Concept Hub with search & category filters
├── topics/
│   └── photons.html        # Topic 01: All About Photons
└── assets/
    ├── css/style.css       # Shared dark/light theme & layout styles
    └── js/
        ├── main.js         # Theme toggle, search/filter, TOC scrollspy
        └── photons-sim.js  # Interactive HTML5 Canvas physics simulations
```

## Preview Locally

You can open `index.html` directly in any browser, or run a lightweight local HTTP server:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Deploying to GitHub Pages

1. Commit and push to the `main` branch.
2. Open the repository on GitHub → **Settings** → **Pages**.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
4. Select branch **`main`** and folder **`/ (root)`**, then click **Save**.
5. Your site will be live at `https://prabakaranr.github.io/physics/`.

## Adding New Concepts

1. Create a new HTML file under `topics/<concept-name>.html` using `topics/photons.html` as a template.
2. Add any topic-specific interactive simulation script under `assets/js/`.
3. Add or update the corresponding card in `index.html`.
