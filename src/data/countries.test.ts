import { describe, expect, it } from 'vitest';
import { GLOBE_INDEX, METRIC_STATS, rankFor } from './countries';
import { METRICS } from './metrics';

describe('globe index dataset', () => {
  it('covers nearly all world countries', () => {
    expect(GLOBE_INDEX.length).toBeGreaterThanOrEqual(190);
  });

  it('uses unique ISO codes', () => {
    const codes = new Set(GLOBE_INDEX.map((c) => c.code));
    expect(codes.size).toBe(GLOBE_INDEX.length);
  });

  it('has valid coordinates for every entry', () => {
    for (const c of GLOBE_INDEX) {
      expect(c.lat).toBeGreaterThanOrEqual(-90);
      expect(c.lat).toBeLessThanOrEqual(90);
      expect(c.lng).toBeGreaterThanOrEqual(-180);
      expect(c.lng).toBeLessThanOrEqual(180);
    }
  });
});

describe('METRIC_STATS', () => {
  it('computes min <= max for each visualized metric', () => {
    for (const metric of METRICS) {
      const stats = METRIC_STATS[metric.key];
      expect(stats.min).toBeLessThanOrEqual(stats.max);
    }
  });
});

describe('rankFor', () => {
  it('ranks India #1 by population', () => {
    const india = GLOBE_INDEX.find((c) => c.code === 'IN');
    expect(india).toBeDefined();
    expect(rankFor('IN', 'population')).toBe(1);
  });
});
