import type { CountryRecord } from '@/types';
import { METRICS } from '@/data/metrics';
import { METRIC_STATS, rankFor } from '@/data/countries';
import { metricValueFromRecord } from '@/lib/metrics';
import { normalize } from '@/lib/scale';
import { formatOrdinal } from '@/lib/format';

interface MetricChartProps {
  country: CountryRecord;
  activeMetric: string;
}

/** Normalized bar chart across all globe metrics for a country. */
export function MetricChart({ country, activeMetric }: MetricChartProps) {
  const rows = METRICS.map((metric) => {
    const value = metricValueFromRecord(country, metric.key);
    const stats = METRIC_STATS[metric.key];
    const norm = normalize(value, stats.min, stats.max, metric.scale);
    return {
      key: metric.key,
      label: metric.shortLabel,
      display: metric.format(value),
      rank: rankFor(country.code, metric.key),
      norm,
      gradient: metric.gradient,
      active: metric.key === activeMetric,
    };
  });

  return (
    <div className="profile-chart" role="img" aria-label={`Development profile for ${country.name}`}>
      {rows.map((row) => (
        <div key={row.key} className={`profile-chart__row${row.active ? ' is-active' : ''}`}>
          <span className="profile-chart__label">{row.label}</span>
          <span className="profile-chart__track">
            <span
              className="profile-chart__fill"
              style={{
                width: `${Math.max(3, row.norm * 100)}%`,
                background: `linear-gradient(90deg, ${row.gradient[0]}, ${row.gradient[1]})`,
              }}
            />
          </span>
          <span className="profile-chart__value">
            {row.display}
            <span className="profile-chart__rank">{formatOrdinal(row.rank)}</span>
          </span>
        </div>
      ))}
    </div>
  );
}
