import { AnimatePresence, motion } from 'framer-motion';
import { formatPopulation, REGION_COLORS } from '../utils/geo';

export function InfoPanel({ country, onClose }) {
  return (
    <AnimatePresence>
      {country && (
        <motion.aside
          className="info-panel"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 40 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <button className="info-panel__close" onClick={onClose} aria-label="Cerrar panel">
            ×
          </button>

          <div
            className="info-panel__region-tag"
            style={{ color: REGION_COLORS[country.region] }}
          >
            <span
              className="info-panel__dot"
              style={{ background: REGION_COLORS[country.region] }}
            />
            {country.region}
          </div>

          <h2 className="info-panel__name">{country.name}</h2>
          <p className="info-panel__capital">Capital — {country.capital}</p>

          <div className="info-panel__stats">
            <div className="info-panel__stat">
              <span className="info-panel__stat-label">Población</span>
              <span className="info-panel__stat-value">
                {formatPopulation(country.population)}
              </span>
            </div>
            <div className="info-panel__stat">
              <span className="info-panel__stat-label">Coordenadas</span>
              <span className="info-panel__stat-value info-panel__stat-value--mono">
                {country.lat.toFixed(2)}°, {country.lng.toFixed(2)}°
              </span>
            </div>
            <div className="info-panel__stat">
              <span className="info-panel__stat-label">Código</span>
              <span className="info-panel__stat-value info-panel__stat-value--mono">
                {country.code}
              </span>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
