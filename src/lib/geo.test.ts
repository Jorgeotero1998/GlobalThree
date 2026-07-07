import { describe, expect, it } from 'vitest';
import { createArcPoints, latLngToVector3, seededRandom } from './geo';

describe('latLngToVector3', () => {
  it('places points on the sphere of the requested radius', () => {
    const v = latLngToVector3(35, 105, 2);
    expect(v.length()).toBeCloseTo(2, 5);
  });

  it('maps the north pole to +Y', () => {
    const v = latLngToVector3(90, 0, 1);
    expect(v.y).toBeCloseTo(1, 5);
    expect(v.x).toBeCloseTo(0, 5);
    expect(v.z).toBeCloseTo(0, 5);
  });

  it('maps the south pole to -Y', () => {
    const v = latLngToVector3(-90, 0, 1);
    expect(v.y).toBeCloseTo(-1, 5);
  });
});

describe('createArcPoints', () => {
  it('produces segments+1 points starting and ending at the anchors', () => {
    const start = latLngToVector3(0, 0, 2);
    const end = latLngToVector3(0, 90, 2);
    const points = createArcPoints(start, end, 2, 16);
    expect(points).toHaveLength(17);
    expect(points[0].distanceTo(start)).toBeCloseTo(0, 5);
    expect(points[points.length - 1].distanceTo(end)).toBeCloseTo(0, 5);
  });

  it('lifts the midpoint above the surface radius', () => {
    const start = latLngToVector3(0, 0, 2);
    const end = latLngToVector3(0, 60, 2);
    const points = createArcPoints(start, end, 2, 16);
    const mid = points[Math.floor(points.length / 2)];
    expect(mid.length()).toBeGreaterThan(2);
  });
});

describe('seededRandom', () => {
  it('is deterministic for a given seed', () => {
    expect(seededRandom(42)).toBe(seededRandom(42));
  });

  it('returns values within [0,1)', () => {
    for (let i = 0; i < 200; i++) {
      const v = seededRandom(i);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('differs across seeds', () => {
    expect(seededRandom(1)).not.toBe(seededRandom(2));
  });
});
