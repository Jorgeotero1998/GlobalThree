import type { GlobeIndexEntry, MetricKey, CountryRecord } from '@/types';
import { metricValueFromIndex } from '@/lib/metrics';
import globeIndex from '../../data/globe-index.json';

export const GLOBE_INDEX: readonly GlobeIndexEntry[] = globeIndex as GlobeIndexEntry[];

/** @deprecated alias */
export const COUNTRIES = GLOBE_INDEX;

export interface MetricStats {
  min: number;
  max: number;
  mean: number;
}

export const METRIC_STATS: Record<MetricKey, MetricStats> = computeStats(GLOBE_INDEX);

function computeStats(entries: readonly GlobeIndexEntry[]): Record<MetricKey, MetricStats> {
  const keys: MetricKey[] = [
    'population',
    'areaKm2',
    'density',
    'gdpPerCapita',
    'lifeExpectancy',
    'internetUsers',
    'co2PerCapita',
  ];

  const result = {} as Record<MetricKey, MetricStats>;
  for (const key of keys) {
    let min = Infinity;
    let max = -Infinity;
    let sum = 0;
    for (const e of entries) {
      const v = metricValueFromIndex(e, key);
      if (v < min) min = v;
      if (v > max) max = v;
      sum += v;
    }
    result[key] = { min, max, mean: sum / entries.length };
  }
  return result;
}

export function rankFor(code: string, metric: MetricKey, entries = GLOBE_INDEX): number {
  const sorted = [...entries].sort(
    (a, b) => metricValueFromIndex(b, metric) - metricValueFromIndex(a, metric),
  );
  const idx = sorted.findIndex((c) => c.code === code);
  return idx === -1 ? 0 : idx + 1;
}

/** Fetch full encyclopedia record — API first, static JSON fallback. */
export async function fetchCountryDetail(code: string): Promise<CountryRecord | null> {
  try {
    const res = await fetch(`/api/countries/${code}`);
    if (res.ok) return (await res.json()) as CountryRecord;
  } catch {
    /* fall through */
  }
  try {
    const res = await fetch(`/data/encyclopedia.json`);
    if (!res.ok) return null;
    const all = (await res.json()) as CountryRecord[];
    return all.find((c) => c.code === code) ?? null;
  } catch {
    return null;
  }
}
