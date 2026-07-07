import type { MetricKey } from '@/types';
import { METRICS } from '@/data/metrics';

interface MetricSelectorProps {
  value: MetricKey;
  onChange: (metric: MetricKey) => void;
}

/** Segmented control that switches the metric encoded on the globe. */
export function MetricSelector({ value, onChange }: MetricSelectorProps) {
  return (
    <div className="metric-selector" role="radiogroup" aria-label="Select the metric to visualize">
      {METRICS.map((metric) => {
        const active = metric.key === value;
        return (
          <button
            key={metric.key}
            type="button"
            role="radio"
            aria-checked={active}
            className={`metric-selector__item${active ? ' is-active' : ''}`}
            onClick={() => onChange(metric.key)}
            title={metric.description}
          >
            {metric.shortLabel}
          </button>
        );
      })}
    </div>
  );
}
