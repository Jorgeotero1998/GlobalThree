import type { MetricDefinition } from '@/types';
import type { MetricStats } from '@/data/countries';

interface LegendProps {
  metric: MetricDefinition;
  stats: MetricStats;
}

/** Gradient scale legend for the active metric (low → high). */
export function Legend({ metric, stats }: LegendProps) {
  const [from, to] = metric.gradient;
  return (
    <div className="legend">
      <div className="legend__row">
        <span className="legend__label">{metric.label}</span>
        <span className="legend__unit">{metric.unit}</span>
      </div>
      <div
        className="legend__bar"
        style={{ background: `linear-gradient(90deg, ${from}, ${to})` }}
        role="img"
        aria-label={`Color scale from ${metric.format(stats.min)} to ${metric.format(stats.max)}`}
      />
      <div className="legend__row legend__row--values">
        <span>{metric.format(stats.min)}</span>
        <span>{metric.format(stats.max)}</span>
      </div>
    </div>
  );
}
