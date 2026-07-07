import { useMemo } from 'react';
import type { GlobeIndexEntry, MetricKey } from '@/types';
import { GLOBE_INDEX, METRIC_STATS } from '@/data/countries';
import { getMetric } from '@/data/metrics';
import { metricValueFromIndex } from '@/lib/metrics';
import { lerpColor, normalize } from '@/lib/scale';

export interface CountryView {
  country: GlobeIndexEntry;
  value: number;
  norm: number;
  color: [number, number, number];
  matches: boolean;
}

export interface CountryViewOptions {
  metric: MetricKey;
  search: string;
  continent: string;
  region: string;
  popMin: number;
  popMax: number;
}

export function useCountryView({
  metric,
  search,
  continent,
  region,
  popMin,
  popMax,
}: CountryViewOptions) {
  return useMemo(() => {
    const def = getMetric(metric);
    const stats = METRIC_STATS[metric];
    const query = search.trim().toLowerCase();

    const views: CountryView[] = GLOBE_INDEX.map((country) => {
      const value = metricValueFromIndex(country, metric);
      const norm = normalize(value, stats.min, stats.max, def.scale);
      const color = lerpColor(def.gradient[0], def.gradient[1], norm);
      const matches = passesFilter(country, query, continent, region, popMin, popMax);
      return { country, value, norm, color, matches };
    });

    const results = views.filter((v) => v.matches).sort((a, b) => b.value - a.value);
    return { views, results, matchCount: results.length };
  }, [metric, search, continent, region, popMin, popMax]);
}

function passesFilter(
  country: GlobeIndexEntry,
  query: string,
  continent: string,
  region: string,
  popMin: number,
  popMax: number,
): boolean {
  if (continent && country.continent !== continent) return false;
  if (region && country.region !== region) return false;
  if (country.population < popMin) return false;
  if (popMax > 0 && country.population > popMax) return false;
  if (!query) return true;
  return (
    country.name.toLowerCase().includes(query) ||
    country.capital.toLowerCase().includes(query) ||
    country.code.toLowerCase().includes(query)
  );
}
