import { useEffect, useRef } from 'react';
import type { GlobeIndexEntry, MetricDefinition } from '@/types';
import type { CountryView } from '@/hooks/useCountryView';
import { CONTINENT_COLORS } from '@/data/metrics';

interface CountryListProps {
  results: CountryView[];
  metric: MetricDefinition;
  selectedCode: string | null;
  compareCodes: string[];
  compareMode: boolean;
  hoveredCode: string | null;
  onSelect: (country: GlobeIndexEntry) => void;
  onHover: (code: string | null) => void;
}

export function CountryList({
  results,
  metric,
  selectedCode,
  compareCodes,
  compareMode,
  hoveredCode,
  onSelect,
  onHover,
}: CountryListProps) {
  if (results.length === 0) {
    return (
      <div className="empty-state" role="status">
        <span className="empty-state__glyph" aria-hidden="true">
          ∅
        </span>
        <p className="empty-state__title">No countries match</p>
        <p className="empty-state__hint">Try adjusting filters or search terms.</p>
      </div>
    );
  }

  return (
    <ul className="country-list" aria-label={`Countries ranked by ${metric.label}`}>
      {results.map((view, index) => (
        <CountryRow
          key={view.country.code}
          view={view}
          rank={index + 1}
          metric={metric}
          selected={!compareMode && view.country.code === selectedCode}
          compared={compareCodes.includes(view.country.code)}
          hovered={view.country.code === hoveredCode}
          onSelect={onSelect}
          onHover={onHover}
        />
      ))}
    </ul>
  );
}

function CountryRow({
  view,
  rank,
  metric,
  selected,
  compared,
  hovered,
  onSelect,
  onHover,
}: {
  view: CountryView;
  rank: number;
  metric: MetricDefinition;
  selected: boolean;
  compared: boolean;
  hovered: boolean;
  onSelect: (country: GlobeIndexEntry) => void;
  onHover: (code: string | null) => void;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const { country, norm } = view;

  useEffect(() => {
    if (selected || compared) ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [selected, compared]);

  return (
    <li ref={ref}>
      <button
        type="button"
        className={`country-row${selected ? ' is-selected' : ''}${compared ? ' is-compared' : ''}${hovered ? ' is-hovered' : ''}`}
        onClick={() => onSelect(country)}
        onMouseEnter={() => onHover(country.code)}
        onMouseLeave={() => onHover(null)}
        onFocus={() => onHover(country.code)}
        onBlur={() => onHover(null)}
        aria-pressed={selected || compared}
      >
        <span className="country-row__rank">{rank}</span>
        <span
          className="country-row__dot"
          style={{ background: CONTINENT_COLORS[country.continent] ?? '#8896a8' }}
          aria-hidden="true"
        />
        <span className="country-row__body">
          <span className="country-row__name">{country.name}</span>
          <span className="country-row__meta">{country.capital}</span>
        </span>
        <span className="country-row__value">{metric.format(view.value)}</span>
        <span className="country-row__bar" aria-hidden="true">
          <span
            className="country-row__bar-fill"
            style={{
              width: `${Math.max(4, norm * 100)}%`,
              background: `linear-gradient(90deg, ${metric.gradient[0]}, ${metric.gradient[1]})`,
            }}
          />
        </span>
      </button>
    </li>
  );
}
