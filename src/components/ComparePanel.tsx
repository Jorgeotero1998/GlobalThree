import { AnimatePresence, motion } from 'framer-motion';
import type { GlobeIndexEntry } from '@/types';
import { METRICS } from '@/data/metrics';
import { rankFor } from '@/data/countries';
import { metricValueFromIndex } from '@/lib/metrics';
import { formatOrdinal } from '@/lib/format';

interface ComparePanelProps {
  countries: GlobeIndexEntry[];
  reducedMotion: boolean;
  onClear: () => void;
}

export function ComparePanel({ countries, reducedMotion, onClear }: ComparePanelProps) {
  if (countries.length === 0) return null;

  const [a, b] = countries;
  const waiting = countries.length === 1;

  const offAxis = { y: 24 };
  const initial = reducedMotion ? { opacity: 0 } : { opacity: 0, ...offAxis };

  return (
    <AnimatePresence>
      <motion.aside
        className="compare-panel"
        role="region"
        aria-label="Country comparison"
        initial={initial}
        animate={{ opacity: 1, y: 0 }}
        exit={initial}
        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="compare-panel__header">
          <h2 className="compare-panel__title">Compare</h2>
          <button type="button" className="compare-panel__clear" onClick={onClear}>
            Clear
          </button>
        </div>

        <div className={`compare-panel__countries${waiting ? ' compare-panel__countries--solo' : ''}`}>
          <Chip country={a} slot="A" />
          {b ? <Chip country={b} slot="B" /> : <div className="compare-panel__placeholder">Pick another…</div>}
        </div>

        {waiting ? (
          <p className="compare-panel__waiting">Select one more country for a full comparison.</p>
        ) : (
          b && (
            <div className="compare-panel__metrics">
              {METRICS.map((metric) => {
                const valA = metricValueFromIndex(a, metric.key);
                const valB = metricValueFromIndex(b, metric.key);
                const winner = valA === valB ? 'tie' : valA > valB ? a.code : b.code;
                return (
                  <div key={metric.key} className="compare-metric">
                    <div className="compare-metric__label">{metric.label}</div>
                    <div className="compare-metric__row">
                      <span className={`compare-metric__value${winner === a.code ? ' is-winner' : ''}`}>
                        {metric.format(valA)}
                        <span className="compare-metric__rank">{formatOrdinal(rankFor(a.code, metric.key))}</span>
                      </span>
                      <span className="compare-metric__vs">vs</span>
                      <span className={`compare-metric__value${winner === b.code ? ' is-winner' : ''}`}>
                        {metric.format(valB)}
                        <span className="compare-metric__rank">{formatOrdinal(rankFor(b.code, metric.key))}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </motion.aside>
    </AnimatePresence>
  );
}

function Chip({ country, slot }: { country: GlobeIndexEntry; slot: 'A' | 'B' }) {
  return (
    <div className="compare-chip">
      <span className="compare-chip__slot">{slot}</span>
      <span className="compare-chip__name">{country.name}</span>
      <span className="compare-chip__meta">{country.capital}</span>
    </div>
  );
}
