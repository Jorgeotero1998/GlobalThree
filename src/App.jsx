import { useState, useCallback } from 'react';
import { GlobeScene } from './components/GlobeScene';
import { InfoPanel } from './components/InfoPanel';
import { Header } from './components/Header';
import countriesData from './data/countries.json';

function App() {
  const [selectedCountry, setSelectedCountry] = useState(null);

  const handleSelect = useCallback((country) => {
    setSelectedCountry(country);
  }, []);

  return (
    <div className="app">
      <GlobeScene
        countries={countriesData}
        selectedCountry={selectedCountry}
        onSelect={handleSelect}
      />

      <Header countryCount={countriesData.length} />

      <InfoPanel country={selectedCountry} onClose={() => setSelectedCountry(null)} />

      <div className="hud-hint">
        Arrastrá para rotar · Scroll para zoom · Click en un nodo para ver detalles
      </div>

      <footer className="hud-footer">
        <span>Datos: REST Countries / mledoze · población aproximada</span>
        <a
          href="https://github.com/Jorgeotero1998/globe-pulse"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub ↗
        </a>
      </footer>
    </div>
  );
}

export default App;
