import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { CountryRecord } from '@/types';
import { formatInteger, formatOrdinal } from '@/lib/format';
import { rankFor } from '@/data/countries';
import { MetricChart } from './MetricChart';

type Tab = 'overview' | 'geography' | 'demographics' | 'economy' | 'culture';

interface EncyclopediaDrawerProps {
  record: CountryRecord | null;
  loading: boolean;
  error: string | null;
  activeMetric: string;
  asSheet: boolean;
  reducedMotion: boolean;
  onClose: () => void;
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'geography', label: 'Geography' },
  { id: 'demographics', label: 'Demographics' },
  { id: 'economy', label: 'Economy' },
  { id: 'culture', label: 'Culture' },
];

export function EncyclopediaDrawer({
  record,
  loading,
  error,
  activeMetric,
  asSheet,
  reducedMotion,
  onClose,
}: EncyclopediaDrawerProps) {
  const [tab, setTab] = useState<Tab>('overview');
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!record) return;
    setTab('overview');
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [record, onClose]);

  const offAxis = asSheet ? { y: 32 } : { x: 40 };
  const initial = reducedMotion ? { opacity: 0 } : { opacity: 0, ...offAxis };
  const animate = { opacity: 1, x: 0, y: 0 };
  const exit = reducedMotion ? { opacity: 0 } : { opacity: 0, ...offAxis };

  return (
    <AnimatePresence>
      {(record || loading) && (
        <motion.aside
          key={record?.code ?? 'loading'}
          className={`encyclopedia${asSheet ? ' encyclopedia--sheet' : ''}`}
          role="dialog"
          aria-label={record ? `${record.name} encyclopedia` : 'Loading country'}
          initial={initial}
          animate={animate}
          exit={exit}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        >
          <button
            ref={closeRef}
            type="button"
            className="encyclopedia__close"
            onClick={onClose}
            aria-label="Close encyclopedia"
          >
            ×
          </button>

          {loading && !record && (
            <div className="encyclopedia__skeleton" role="status">
              <div className="skeleton skeleton--title" />
              <div className="skeleton skeleton--line" />
              <div className="skeleton skeleton--line skeleton--short" />
            </div>
          )}

          {error && !record && <p className="encyclopedia__error">{error}</p>}

          {record && (
            <>
              <header className="encyclopedia__hero">
                <span className="encyclopedia__flag" aria-hidden="true">
                  {record.flag}
                </span>
                <div>
                  <h2 className="encyclopedia__name">{record.name}</h2>
                  <p className="encyclopedia__meta">
                    {record.capital} · {record.continent} · {record.code}
                  </p>
                </div>
              </header>

              <div className="encyclopedia__tabs" role="tablist" aria-label="Country sections">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={tab === t.id}
                    className={`encyclopedia__tab${tab === t.id ? ' is-active' : ''}`}
                    onClick={() => setTab(t.id)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="encyclopedia__body" role="tabpanel">
                {tab === 'overview' && <OverviewTab record={record} activeMetric={activeMetric} />}
                {tab === 'geography' && <GeographyTab record={record} />}
                {tab === 'demographics' && <DemographicsTab record={record} />}
                {tab === 'economy' && <EconomyTab record={record} />}
                {tab === 'culture' && <CultureTab record={record} />}
              </div>
            </>
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function OverviewTab({ record, activeMetric }: { record: CountryRecord; activeMetric: string }) {
  return (
    <>
      <StatGrid
        items={[
          ['Population', formatInteger(record.population), formatOrdinal(rankFor(record.code, 'population'))],
          ['Area', `${formatInteger(record.areaKm2)} km²`, `#${record.areaRank} globally`],
          ['Density', `${Math.round(record.density).toLocaleString()}/km²`, record.landlocked ? 'Landlocked' : 'Coastal'],
          ['Languages', record.languages.slice(0, 2).join(', '), record.languages.length > 2 ? `+${record.languages.length - 2} more` : ''],
          ['Currency', `${record.currency.name} (${record.currency.symbol})`, record.currency.code],
          ['Timezone', record.timezones[0] ?? '—', record.timezones.length > 1 ? `+${record.timezones.length - 1}` : ''],
        ]}
      />
      <p className="encyclopedia__section-label">Development profile</p>
      <MetricChart country={record} activeMetric={activeMetric} />
    </>
  );
}

function GeographyTab({ record }: { record: CountryRecord }) {
  return (
    <StatGrid
      items={[
        ['Coordinates', `${record.lat.toFixed(2)}°, ${record.lng.toFixed(2)}°`, ''],
        ['Climate', record.climateZone, record.region],
        ['Highest peak', `${record.highestPeak.name} (${record.highestPeak.elevationM.toLocaleString()} m)`, ''],
        ['Longest river', record.longestRiver, ''],
        ['Coastline', `${formatInteger(record.coastlineKm)} km`, ''],
        ['Borders', record.borders.length ? `${record.borders.length} countries` : 'None', record.borders.slice(0, 3).join(', ')],
      ]}
    />
  );
}

function DemographicsTab({ record }: { record: CountryRecord }) {
  return (
    <StatGrid
      items={[
        ['Life expectancy', `${record.lifeExpectancy} yrs`, formatOrdinal(rankFor(record.code, 'lifeExpectancy'))],
        ['Median age', `${record.medianAge} yrs`, ''],
        ['Urban population', `${record.urbanPercent}%`, ''],
        ['Fertility rate', `${record.fertilityRate}`, 'births/woman'],
        ['Infant mortality', `${record.infantMortality}/1k`, ''],
        ['Literacy', `${record.literacyRate}%`, ''],
        ['Healthcare index', `${record.healthcareIndex}`, '/100'],
      ]}
    />
  );
}

function EconomyTab({ record }: { record: CountryRecord }) {
  return (
    <>
      <StatGrid
        items={[
          ['GDP (nominal)', `$${formatInteger(record.gdpNominal)}`, ''],
          ['GDP per capita', `$${formatInteger(record.gdpPerCapita)}`, formatOrdinal(rankFor(record.code, 'gdpPerCapita'))],
          ['Unemployment', `${record.unemployment}%`, ''],
          ['Inflation', `${record.inflation}%`, ''],
          ['Gini index', `${record.gini}`, 'inequality'],
          ['HDI', `${record.hdIndex}`, 'development'],
        ]}
      />
      <p className="encyclopedia__section-label">Main exports</p>
      <div className="tag-list">
        {record.mainExports.map((e: string) => (
          <span key={e} className="tag">
            {e}
          </span>
        ))}
      </div>
    </>
  );
}

function CultureTab({ record }: { record: CountryRecord }) {
  return (
    <StatGrid
      items={[
        ['UNESCO sites', String(record.unescoSites), 'World Heritage'],
        ['National day', record.nationalDay, ''],
        ['Religions', record.religions.join(', '), ''],
        ['Government', record.governmentType, ''],
        ['Independence', record.independenceYear ? String(record.independenceYear) : '—', ''],
        ['UN member', record.unMember ? 'Yes' : 'No', `Calling ${record.callingCode}`],
        ['Driving', record.drivingSide === 'left' ? 'Left side' : 'Right side', ''],
        ['Press freedom', `${record.pressFreedom}/100`, ''],
      ]}
    />
  );
}

function StatGrid({
  items,
}: {
  items: [string, string, string][];
}) {
  return (
    <dl className="stat-grid">
      {items.map(([label, value, sub]) => (
        <div key={label} className="stat-grid__item">
          <dt>{label}</dt>
          <dd>
            {value}
            {sub && <span className="stat-grid__sub">{sub}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}
