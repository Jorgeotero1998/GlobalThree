import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function Header({ countryCount }) {
  const [activePulses, setActivePulses] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActivePulses(Math.floor(20 + Math.random() * 14));
    }, 1400);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.header
      className="hud-header"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="hud-header__title-row">
        <span className="hud-header__status-dot" />
        <h1 className="hud-header__title">Globe Pulse</h1>
      </div>
      <p className="hud-header__subtitle">Top {countryCount} países por población mundial</p>
      <div className="hud-header__metrics">
        <span className="hud-header__metric">
          <span className="hud-header__metric-value">{activePulses}</span>
          <span className="hud-header__metric-label">flujos activos</span>
        </span>
        <span className="hud-header__metric">
          <span className="hud-header__metric-value">{countryCount}</span>
          <span className="hud-header__metric-label">nodos</span>
        </span>
      </div>
    </motion.header>
  );
}
