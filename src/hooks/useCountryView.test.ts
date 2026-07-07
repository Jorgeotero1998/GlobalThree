import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCountryView } from './useCountryView';

describe('useCountryView', () => {
  it('returns sorted results by active metric', () => {
    const { result } = renderHook(() =>
      useCountryView({
        metric: 'population',
        search: '',
        continent: '',
        region: '',
        popMin: 0,
        popMax: 0,
      }),
    );
    expect(result.current.views.length).toBeGreaterThan(190);
    const values = result.current.results.map((v) => v.value);
    expect(values).toEqual([...values].sort((a, b) => b - a));
  });

  it('filters by continent', () => {
    const { result } = renderHook(() =>
      useCountryView({
        metric: 'population',
        search: '',
        continent: 'Europe',
        region: '',
        popMin: 0,
        popMax: 0,
      }),
    );
    expect(result.current.results.every((v) => v.country.continent === 'Europe')).toBe(true);
  });
});
