import type { CSSProperties } from 'react';
import { CONTINENT_COLORS, CONTINENTS } from '@/data/metrics';
import { GLOBE_INDEX } from '@/data/countries';

interface ContinentFilterProps {
  continent: string;
  region: string;
  onContinentChange: (value: string) => void;
  onRegionChange: (value: string) => void;
}

const REGIONS = [...new Set(GLOBE_INDEX.map((c) => c.region))].sort();

export function ContinentFilter({
  continent,
  region,
  onContinentChange,
  onRegionChange,
}: ContinentFilterProps) {
  return (
    <div className="filter-stack">
      <div className="region-filter" role="group" aria-label="Filter by continent">
        <button
          type="button"
          aria-pressed={!continent}
          className={`chip${!continent ? ' is-active' : ''}`}
          onClick={() => onContinentChange('')}
        >
          All
        </button>
        {CONTINENTS.map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={continent === c}
            className={`chip${continent === c ? ' is-active' : ''}`}
            style={{ '--chip-color': CONTINENT_COLORS[c] } as CSSProperties}
            onClick={() => onContinentChange(continent === c ? '' : c)}
          >
            <span className="chip__dot" aria-hidden="true" />
            {c}
          </button>
        ))}
      </div>

      <select
        className="region-select"
        value={region}
        onChange={(e) => onRegionChange(e.target.value)}
        aria-label="Filter by sub-region"
      >
        <option value="">All sub-regions</option>
        {REGIONS.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
    </div>
  );
}
