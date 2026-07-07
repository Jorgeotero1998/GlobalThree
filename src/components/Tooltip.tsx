import { useEffect, useState } from 'react';
import type { MetricDefinition } from '@/types';
import type { CountryView } from '@/hooks/useCountryView';

interface TooltipProps {
  view: CountryView | null;
  metric: MetricDefinition;
}

/** Cursor-following tooltip for the hovered globe node. */
export function Tooltip({ view, metric }: TooltipProps) {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!view) return;
    const onMove = (e: PointerEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, [view]);

  if (!view) return null;

  return (
    <div
      className="tooltip"
      style={{ transform: `translate(${pos.x + 14}px, ${pos.y + 14}px)` }}
      role="status"
    >
      <span className="tooltip__name">{view.country.name}</span>
      <span className="tooltip__value">
        {metric.shortLabel}: {metric.format(view.value)}
      </span>
    </div>
  );
}
