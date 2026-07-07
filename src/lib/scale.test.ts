import { describe, expect, it } from 'vitest';
import { clamp01, lerpColor, normalize, transform } from './scale';

describe('transform', () => {
  it('applies sqrt and log perceptual transforms', () => {
    expect(transform(9, 'sqrt')).toBe(3);
    expect(transform(0, 'log')).toBe(0);
    expect(transform(9, 'log')).toBeCloseTo(1, 5);
    expect(transform(42, 'linear')).toBe(42);
  });
});

describe('normalize', () => {
  it('maps endpoints to 0 and 1 on a linear scale', () => {
    expect(normalize(0, 0, 10, 'linear')).toBe(0);
    expect(normalize(10, 0, 10, 'linear')).toBe(1);
    expect(normalize(5, 0, 10, 'linear')).toBe(0.5);
  });

  it('clamps out-of-range values to [0,1]', () => {
    expect(normalize(-5, 0, 10, 'linear')).toBe(0);
    expect(normalize(50, 0, 10, 'linear')).toBe(1);
  });

  it('returns 0.5 for a degenerate domain', () => {
    expect(normalize(7, 7, 7, 'linear')).toBe(0.5);
  });

  it('respects the sqrt scale midpoint', () => {
    // sqrt(25)=5 is the midpoint of sqrt(0)=0 and sqrt(100)=10.
    expect(normalize(25, 0, 100, 'sqrt')).toBeCloseTo(0.5, 5);
  });
});

describe('clamp01', () => {
  it('bounds values to the unit interval', () => {
    expect(clamp01(-1)).toBe(0);
    expect(clamp01(2)).toBe(1);
    expect(clamp01(0.3)).toBe(0.3);
  });
});

describe('lerpColor', () => {
  it('returns the endpoints at t=0 and t=1', () => {
    expect(lerpColor('#000000', '#ffffff', 0)).toEqual([0, 0, 0]);
    expect(lerpColor('#000000', '#ffffff', 1)).toEqual([1, 1, 1]);
  });

  it('interpolates the midpoint', () => {
    const [r, g, b] = lerpColor('#000000', '#ffffff', 0.5);
    expect(r).toBeCloseTo(0.5, 2);
    expect(g).toBeCloseTo(0.5, 2);
    expect(b).toBeCloseTo(0.5, 2);
  });
});
