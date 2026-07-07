import type { MetricDefinition, MetricKey } from '@/types';
import { formatCompact, formatPercent, formatUsd } from '@/lib/format';

export const METRICS: readonly MetricDefinition[] = [
  {
    key: 'population',
    label: 'Population',
    shortLabel: 'Pop.',
    description: 'Total inhabitants (World Bank, latest).',
    unit: 'people',
    scale: 'sqrt',
    gradient: ['#1e3a8a', '#38bdf8'],
    format: (v: number) => formatCompact(v),
  },
  {
    key: 'areaKm2',
    label: 'Land area',
    shortLabel: 'Area',
    description: 'Total land area in km².',
    unit: 'km²',
    scale: 'log',
    gradient: ['#365314', '#a3e635'],
    format: (v: number) => `${formatCompact(v)} km²`,
  },
  {
    key: 'density',
    label: 'Pop. density',
    shortLabel: 'Density',
    description: 'Population per km².',
    unit: '/km²',
    scale: 'log',
    gradient: ['#431407', '#fb923c'],
    format: (v: number) => `${Math.round(v).toLocaleString()}/km²`,
  },
  {
    key: 'gdpPerCapita',
    label: 'GDP per capita',
    shortLabel: 'GDP',
    description: 'GDP per person, current US$.',
    unit: 'US$',
    scale: 'log',
    gradient: ['#3b0764', '#a855f7'],
    format: (v: number) => formatUsd(v),
  },
  {
    key: 'lifeExpectancy',
    label: 'Life expectancy',
    shortLabel: 'Longevity',
    description: 'Life expectancy at birth, years.',
    unit: 'years',
    scale: 'linear',
    gradient: ['#7f1d1d', '#34d399'],
    format: (v: number) => `${v.toFixed(1)} yrs`,
  },
  {
    key: 'internetUsers',
    label: 'Internet users',
    shortLabel: 'Internet',
    description: 'Share of population online, %.',
    unit: '%',
    scale: 'linear',
    gradient: ['#334155', '#22d3ee'],
    format: (v: number) => formatPercent(v),
  },
  {
    key: 'co2PerCapita',
    label: 'CO₂ per capita',
    shortLabel: 'CO₂',
    description: 'Annual CO₂ emissions per person, tonnes.',
    unit: 't/person',
    scale: 'linear',
    gradient: ['#14532d', '#f97316'],
    format: (v: number) => `${v.toFixed(1)} t`,
  },
] as const;

export const DEFAULT_METRIC: MetricKey = 'population';

export function getMetric(key: MetricKey): MetricDefinition {
  const metric = METRICS.find((m) => m.key === key);
  if (!metric) throw new Error(`Unknown metric: ${key}`);
  return metric;
}

export const CONTINENT_COLORS: Record<string, string> = {
  Africa: '#ff8b3d',
  Asia: '#3ee6c4',
  Europe: '#e6c9ff',
  'North America': '#4f8fff',
  'South America': '#22c55e',
  Oceania: '#f2e04c',
  Antarctica: '#8896a8',
};

export const CONTINENTS = Object.keys(CONTINENT_COLORS) as (keyof typeof CONTINENT_COLORS)[];

/** Legacy region colors for list dots */
export const REGION_COLORS: Record<string, string> = {
  'Northern Africa': '#ff8b3d',
  'Sub-Saharan Africa': '#f97316',
  'Middle East': '#eab308',
  'Central Asia': '#84cc16',
  'East Asia': '#3ee6c4',
  'South Asia': '#14b8a6',
  'Southeast Asia': '#06b6d4',
  'Western Europe': '#e6c9ff',
  'Eastern Europe': '#c084fc',
  'North America': '#4f8fff',
  'Central America': '#60a5fa',
  Caribbean: '#38bdf8',
  'South America': '#22c55e',
  Oceania: '#f2e04c',
  Antarctica: '#8896a8',
};
