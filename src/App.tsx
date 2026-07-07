import { useCallback, useMemo, useRef, useState } from 'react';
import { useProgress } from '@react-three/drei';
import type { GlobeIndexEntry, MetricKey } from '@/types';
import { GLOBE_INDEX, METRIC_STATS } from '@/data/countries';
import { DEFAULT_METRIC, getMetric } from '@/data/metrics';
import { useCountryView } from '@/hooks/useCountryView';
import { useCountryDetail } from '@/hooks/useCountryDetail';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { GlobeScene } from '@/three/GlobeScene';
import { Sidebar } from '@/components/Sidebar';
import { EncyclopediaDrawer } from '@/components/EncyclopediaDrawer';
import { ComparePanel } from '@/components/ComparePanel';
import { Tooltip } from '@/components/Tooltip';
import { LoadingScreen } from '@/components/LoadingScreen';

export default function App() {
  const [metricKey, setMetricKey] = useState<MetricKey>(DEFAULT_METRIC);
  const [search, setSearch] = useState('');
  const [continent, setContinent] = useState('');
  const [region, setRegion] = useState('');
  const [popMin, setPopMin] = useState(0);
  const [popMax, setPopMax] = useState(0);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareCodes, setCompareCodes] = useState<string[]>([]);
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const ignoreDeselectRef = useRef(false);

  const reducedMotion = usePrefersReducedMotion();
  const isMobile = useMediaQuery('(max-width: 860px)');

  const metric = getMetric(metricKey);
  const stats = METRIC_STATS[metricKey];
  const { views, results } = useCountryView({
    metric: metricKey,
    search,
    continent,
    region,
    popMin,
    popMax,
  });

  const { record, loading, error } = useCountryDetail(compareMode ? null : selectedCode);

  const compareCountries = useMemo(
    () =>
      compareCodes
        .map((code) => GLOBE_INDEX.find((c) => c.code === code))
        .filter(Boolean) as GlobeIndexEntry[],
    [compareCodes],
  );

  const hoveredView = useMemo(
    () => (hoveredCode ? (views.find((v) => v.country.code === hoveredCode) ?? null) : null),
    [hoveredCode, views],
  );
  const arcCountries = useMemo(() => results.map((v) => v.country), [results]);

  const handleSelect = useCallback(
    (country: GlobeIndexEntry) => {
      ignoreDeselectRef.current = true;
      queueMicrotask(() => {
        ignoreDeselectRef.current = false;
      });

      if (compareMode) {
        setCompareCodes((prev) => {
          if (prev.includes(country.code)) return prev.filter((c) => c !== country.code);
          if (prev.length >= 2) return [prev[1], country.code];
          return [...prev, country.code];
        });
        return;
      }

      setSelectedCode(country.code);
      if (window.matchMedia('(max-width: 860px)').matches) setPanelOpen(false);
    },
    [compareMode],
  );

  const handleDeselect = useCallback(() => {
    if (ignoreDeselectRef.current) return;
    if (!compareMode) setSelectedCode(null);
  }, [compareMode]);

  const clearCompare = useCallback(() => setCompareCodes([]), []);

  return (
    <div className="app">
      <div className="app__canvas">
        <GlobeScene
          views={views}
          arcCountries={arcCountries}
          accent={metric.gradient[1]}
          selectedCode={compareMode ? null : selectedCode}
          compareCodes={compareCodes}
          hoveredCode={hoveredCode}
          reducedMotion={reducedMotion}
          onHover={setHoveredCode}
          onSelect={handleSelect}
          onDeselect={handleDeselect}
        />
      </div>

      <GlobeLoader />

      <aside className={`app__sidebar${panelOpen ? ' is-open' : ''}`} aria-label="Data controls">
        <Sidebar
          metric={metric}
          metricKey={metricKey}
          stats={stats}
          search={search}
          continent={continent}
          region={region}
          popMin={popMin}
          popMax={popMax}
          compareMode={compareMode}
          compareCount={compareCodes.length}
          results={results}
          nodeCount={GLOBE_INDEX.length}
          selectedCode={selectedCode}
          compareCodes={compareCodes}
          hoveredCode={hoveredCode}
          onMetricChange={setMetricKey}
          onSearchChange={setSearch}
          onContinentChange={setContinent}
          onRegionChange={setRegion}
          onPopMinChange={setPopMin}
          onPopMaxChange={setPopMax}
          onCompareModeChange={setCompareMode}
          onSelect={handleSelect}
          onHover={setHoveredCode}
        />
      </aside>

      <button
        type="button"
        className="panel-toggle"
        aria-expanded={panelOpen}
        onClick={() => setPanelOpen((o) => !o)}
      >
        {panelOpen ? 'Close' : 'Explore data'}
      </button>

      {!compareMode && (
        <EncyclopediaDrawer
          record={record}
          loading={loading}
          error={error}
          activeMetric={metricKey}
          asSheet={isMobile}
          reducedMotion={reducedMotion}
          onClose={() => setSelectedCode(null)}
        />
      )}

      {compareMode && compareCountries.length > 0 && (
        <ComparePanel
          countries={compareCountries}
          reducedMotion={reducedMotion}
          onClear={clearCompare}
        />
      )}

      {!isMobile && <Tooltip view={hoveredView} metric={metric} />}

      <p className="hud-hint" aria-hidden="true">
        Drag to rotate · scroll to zoom · click any country node
      </p>

      <footer className="hud-footer">
        <span>
          {GLOBE_INDEX.length} countries · 54 fields each · World Bank · mledoze/countries
        </span>
        <a
          href="https://github.com/Jorgeotero1998/GlobalThree"
          target="_blank"
          rel="noopener noreferrer"
        >
          Source ↗
        </a>
      </footer>
    </div>
  );
}

function GlobeLoader() {
  const { active } = useProgress();
  return active ? <LoadingScreen /> : null;
}
