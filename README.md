# 🌐 Globe Pulse

Visualización 3D interactiva de datos demográficos globales, construida con **React Three Fiber**. Un globo terráqueo navegable muestra los países más poblados del mundo como nodos pulsantes, conectados por arcos animados que simulan flujos de datos en tiempo real.

**[▶ Ver demo en vivo](#)** _(reemplazar con la URL de Vercel una vez desplegado)_

![Stack](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=000)
![Stack](https://img.shields.io/badge/Three.js-R3F-000000?logo=three.js)
![Stack](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=fff)

## ✨ Features

- **Globo 3D con textura realista** — mapa satelital de la Tierra (día), relieve, brillo especular en océanos, luces nocturnas de ciudades y capa de nubes
- **Rotación automática** + control orbital manual (drag + scroll)
- **45 nodos de datos reales** — los países más poblados del mundo, con capital, población y coordenadas
- **Arcos de flujo animados** — pulsos viajando entre nodos, coloreados por región/continente
- **Panel de detalle (HUD)** — click en cualquier nodo para ver su ficha completa
- **Diseño responsive** — de desktop a mobile, con tipografía y layout adaptados
- **100% client-side** — sin backend, sin API keys, datos y texturas bakeados en build time

## 🛠️ Stack técnico

| Capa | Tecnología |
|---|---|
| Render 3D | [Three.js](https://threejs.org/) vía [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber) + [@react-three/drei](https://github.com/pmndrs/drei) |
| UI / animaciones | React 19 + [Framer Motion](https://www.framer.com/motion/) |
| Build | Vite |
| Tipografía | Space Grotesk · Inter · JetBrains Mono (self-hosted vía `@fontsource`) |

## 📊 Sobre los datos

Los datos de países (capital, población, coordenadas) provienen de fuentes públicas open-source ([REST Countries](https://restcountries.com/) / [mledoze/countries](https://github.com/mledoze/countries)) y fueron procesados y bakeados como JSON estático en `src/data/countries.json` para evitar llamadas a APIs externas en runtime. Las cifras de población son aproximadas y con fines ilustrativos.

Las texturas del globo (mapa de día, relieve, especular, luces nocturnas y nubes) provienen de [PlanetPixelEmporium](https://planetpixelemporium.com/earth.html) y están incluidas localmente en `public/textures/` para que el proyecto no dependa de ninguna API externa en producción.

## 🚀 Correr el proyecto localmente

```bash
# Clonar el repo
git clone https://github.com/Jorgeotero1998/globe-pulse.git
cd globe-pulse

# Instalar dependencias
npm install

# Levantar servidor de desarrollo
npm run dev
```

Abrí `http://localhost:5173` en el navegador.

### Otros comandos

```bash
npm run build      # build de producción en /dist
npm run preview    # previsualizar el build de producción
npm run lint        # correr ESLint
```

## 📁 Estructura del proyecto

```
public/
└── textures/              # Texturas del globo (día, relieve, especular, luces, nubes)
src/
├── components/
│   ├── GlobeScene.jsx    # Canvas principal de R3F, cámara y luces
│   ├── GlobeSphere.jsx   # Esfera del globo con texturas reales + overlay técnico
│   ├── CityPoints.jsx    # Nodos pulsantes por país
│   ├── DataArcs.jsx      # Arcos animados entre nodos
│   ├── InfoPanel.jsx     # Panel HUD de detalle al seleccionar un país
│   └── Header.jsx        # Header con título y métricas en vivo
├── data/
│   └── countries.json    # Dataset estático de países
├── utils/
│   └── geo.js             # Conversión lat/lng → 3D, generación de arcos, helpers
├── App.jsx
├── main.jsx
└── index.css              # Sistema de diseño (tokens, layout, responsive)
```

## 🌍 Deploy

Este proyecto está listo para desplegarse en [Vercel](https://vercel.com) con cero configuración adicional: detecta automáticamente que es un proyecto Vite y aplica el build correcto.

## 📄 Licencia

MIT — ver [LICENSE](./LICENSE)

---

Construido por [Jorge Otero](https://github.com/Jorgeotero1998) como proyecto de portfolio.
