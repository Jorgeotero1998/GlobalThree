import type { CountryRecord, GlobeIndexEntry, MetricKey } from '@/types';

/** Read a numeric metric from a globe index entry (including derived density). */
export function metricValueFromIndex(entry: GlobeIndexEntry, metric: MetricKey): number {
  if (metric === 'density') return entry.areaKm2 > 0 ? entry.population / entry.areaKm2 : 0;
  if (metric === 'hdIndex' || metric === 'unescoSites' || metric === 'forestCover') return 0;
  return entry[metric as keyof GlobeIndexEntry] as number;
}

/** Read a numeric metric from a full encyclopedia record. */
export function metricValueFromRecord(record: CountryRecord, metric: MetricKey): number {
  if (metric === 'density') return record.areaKm2 > 0 ? record.population / record.areaKm2 : 0;
  return record[metric as keyof CountryRecord] as number;
}
