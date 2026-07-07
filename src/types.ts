export type {
  Continent,
  Region,
  CurrencyInfo,
  PeakInfo,
  CountryRecord,
  GlobeIndexEntry,
  MetricKey,
  MetricScale,
  MetricDefinition,
  PaginatedResponse,
  AggregateStats,
} from '../shared/types';

/** @deprecated Use GlobeIndexEntry */
export type Country = import('../shared/types').GlobeIndexEntry;
