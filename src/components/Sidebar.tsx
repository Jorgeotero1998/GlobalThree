import type { GlobeIndexEntry, MetricDefinition, MetricKey } from '@/types';
import type { CountryView } from '@/hooks/useCountryView';
import type { MetricStats } from '@/data/countries';
import { Header } from './Header';
import { MetricSelector } from './MetricSelector';
import { SearchBar } from './SearchBar';
import { ContinentFilter } from './ContinentFilter';
import { CompareToggle } from './CompareToggle';
import { Legend } from './Legend';
import { CountryList } from './CountryList';

interface SidebarProps {
  metric: MetricDefinition;
  metricKey: MetricKey;
  stats: MetricStats;
  search: string;
  continent: string;
  region: string;
  popMin: number;
  popMax: number;
  compareMode: boolean;
  compareCount: number;
  results: CountryView[];
  nodeCount: number;
  selectedCode: string | null;
  compareCodes: string[];
  hoveredCode: string | null;
  onMetricChange: (metric: MetricKey) => void;
  onSearchChange: (value: string) => void;
  onContinentChange: (value: string) => void;
  onRegionChange: (value: string) => void;
  onPopMinChange: (value: number) => void;
  onPopMaxChange: (value: number) => void;
  onCompareModeChange: (enabled: boolean) => void;
  onSelect: (country: GlobeIndexEntry) => void;
  onHover: (code: string | null) => void;
}

export function Sidebar(props: SidebarProps) {
  const {
    metric,
    metricKey,
    stats,
    search,
    continent,
    region,
    popMin,
    popMax,
    compareMode,
    compareCount,
    results,
    nodeCount,
    selectedCode,
    compareCodes,
    hoveredCode,
    onMetricChange,
    onSearchChange,
    onContinentChange,
    onRegionChange,
    onPopMinChange,
    onPopMaxChange,
    onCompareModeChange,
    onSelect,
    onHover,
  } = props;

  return (
    <div className="sidebar">
      <Header nodeCount={nodeCount} matchCount={results.length} />

      <div className="sidebar__controls">
        <label className="field-label" id="metric-label">
          Globe layer
        </label>
        <MetricSelector value={metricKey} onChange={onMetricChange} />

        <SearchBar value={search} onChange={onSearchChange} />
        <ContinentFilter continent={continent} region={region} onContinentChange={onContinentChange} onRegionChange={onRegionChange} />

        <div className="pop-filter">
          <label className="field-label" htmlFor="pop-min">
            Population range (millions)
          </label>
          <div className="pop-filter__inputs">
            <input
              id="pop-min"
              type="number"
              className="pop-filter__input"
              placeholder="Min"
              min={0}
              value={popMin || ''}
              onChange={(e) => onPopMinChange(Number(e.target.value) * 1_000_000 || 0)}
              aria-label="Minimum population in millions"
            />
            <span aria-hidden="true">—</span>
            <input
              type="number"
              className="pop-filter__input"
              placeholder="Max"
              min={0}
              value={popMax ? popMax / 1_000_000 : ''}
              onChange={(e) => onPopMaxChange(Number(e.target.value) * 1_000_000 || 0)}
              aria-label="Maximum population in millions"
            />
          </div>
        </div>

        <CompareToggle enabled={compareMode} count={compareCount} onChange={onCompareModeChange} />
        <Legend metric={metric} stats={stats} />
      </div>

      <div className="sidebar__list">
        <CountryList
          results={results}
          metric={metric}
          selectedCode={selectedCode}
          compareCodes={compareCodes}
          compareMode={compareMode}
          hoveredCode={hoveredCode}
          onSelect={onSelect}
          onHover={onHover}
        />
      </div>
    </div>
  );
}
