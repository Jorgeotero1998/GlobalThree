# 🌐 Globe Pulse

Interactive 3D visualization of global demographic data, built with **React Three Fiber**. A navigable globe displays the world's most populated countries as pulsating nodes, connected by animated arcs that simulate real-time data flows.


![Stack](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=000)
![Stack](https://img.shields.io/badge/Three.js-R3F-000000?logo=three.js)
![Stack](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=fff)

**[▶ View Live Demo](#)**

https://global-three-9nl71p2hi-jorge-oteros-projects-8c2c437e.vercel.app/



https://github.com/user-attachments/assets/5ad4aa2c-fbcc-4c4e-8f31-82ec42fcf6a4




## ✨ Features

- **3D Globe with Realistic Texture** — satellite map of Earth (daytime), relief, specular highlights on oceans, city lights at night, and cloud layer
- **Automatic Rotation** + manual orbital control (drag + scroll)
- **45 Real-world data nodes** — the world's most populated countries, with capital, population, and coordinates
- **Animated flow arcs** — pulses traveling between nodes, colored by region/continent
- **Detail panel (HUD)** — click on any node to see its full details
- **Responsive design** — from desktop to mobile, with adapted typography and layout
- **100% client-side** — no backend, no API keys, data and textures baked at build time

## 🛠️ Technical Stack

| Layer | Technology |

---|---|


3D Rendering | [Three.js](https://threejs.org/) via [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber) + [@react-three/drei](https://github.com/pmndrs/drei) |

| UI / Animations | React 19 + [Framer Motion](https://www.framer.com/motion/) |

| Build | Vite |

| Typography | Space Grotesk · Inter · JetBrains Mono (self-hosted via `@fontsource`) |

## 📊 About the Data

Country data (capital, population, coordinates) comes from open-source public sources ([REST Countries](https://restcountries.com/) / [mledoze/countries](https://github.com/mledoze/countries)) and was processed and baked as static JSON in `src/data/countries.json` to avoid external API calls at runtime. Population figures are approximate and for illustrative purposes.


The globe textures (daytime map, bump map, specular map, nighttime lights, and clouds) come from PlanetPixelEmporium and are included locally in `public/textures/` so the project doesn't depend on any external APIs in production.

## 🚀 Run the project locally

```bash
# Clone the repo
git clone https://github.com/Jorgeotero1998/globe-pulse.git
cd globe-pulse

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open `http://localhost:5173` in your browser.

### Other Commands

```bash
`npm run build` # Production build in /dist
`npm run preview` # Preview the production build
`npm run lint` # Run ESLint
```

## 📁 Project Structure

```
`public/
``` textures/` # Globe textures (day, bump, specular, lights, clouds)
` ... Nodes
│ ├── InfoPanel.jsx # Detailed HUD panel when a country is selected
│ └── Header.jsx # Header with title and live metrics
├── data/
│ └── countries.json # Static dataset of countries
├── utils/
│ └── geo.js # Lat/lng conversion → 3D, arc generation, helpers
├── App.jsx
├── main.jsx
└── index.css # Design system (tokens, layout, responsive)
```

## 🌍 Deploy

This project is ready to be deployed on [Vercel](https://vercel.com) with zero additional configuration: automatically detects that it's a Vite project and applies the correct build.

## 📄 License

MIT — see [LICENSE](./LICENSE)

---

Built by [Jorge Otero](https://github.com/Jorgeotero1998) as a portfolio project.
