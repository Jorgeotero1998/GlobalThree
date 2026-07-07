import { describe, expect, it } from 'vitest';
import { filterCountries, getAggregateStats, getByCode, getCompare } from '../../api/lib/query.js';

describe('API query layer', () => {
  it('returns paginated countries', () => {
    const result = filterCountries({
      page: 1,
      pageSize: 10,
      search: '',
      continent: '',
      region: '',
      language: '',
      popMin: 0,
      popMax: Infinity,
      sort: 'population',
      order: 'desc',
    });
    expect(result.data).toHaveLength(10);
    expect(result.total).toBeGreaterThan(190);
    expect(result.data[0].population).toBeGreaterThan(result.data[1].population);
  });

  it('filters by search term', () => {
    const result = filterCountries({
      page: 1,
      pageSize: 5,
      search: 'japan',
      continent: '',
      region: '',
      language: '',
      popMin: 0,
      popMax: Infinity,
      sort: 'population',
      order: 'desc',
    });
    expect(result.data.some((c) => c.code === 'JP')).toBe(true);
  });

  it('returns full encyclopedia record by code', () => {
    const jp = getByCode('JP');
    expect(jp?.name).toBe('Japan');
    expect(jp?.languages.length).toBeGreaterThan(0);
    expect(Object.keys(jp ?? {}).length).toBeGreaterThanOrEqual(50);
  });

  it('compares two countries', () => {
    const result = getCompare('US', 'JP');
    expect(result?.a.code).toBe('US');
    expect(result?.b.code).toBe('JP');
  });

  it('returns aggregate stats', () => {
    const stats = getAggregateStats();
    expect(stats.countryCount).toBeGreaterThan(190);
    expect(stats.totalPopulation).toBeGreaterThan(7_000_000_000);
    expect(stats.topByPopulation[0].code).toBe('IN');
  });
});
