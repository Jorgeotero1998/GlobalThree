import type { MetricScale } from '@/types';

/** Apply a perceptual transform before normalizing a metric value. */
export function transform(value: number, scale: MetricScale): number {
  switch (scale) {
    case 'log':
      // +1 guards against log(0) for values that can legitimately be zero.
      return Math.log10(Math.max(value, 0) + 1);
    case 'sqrt':
      return Math.sqrt(Math.max(value, 0));
    case 'linear':
    default:
      return value;
  }
}

/**
 * Normalize a value to [0, 1] within [min, max] under a given perceptual
 * scale. Returns 0.5 for a degenerate (min === max) domain.
 */
export function normalize(value: number, min: number, max: number, scale: MetricScale): number {
  const tv = transform(value, scale);
  const tMin = transform(min, scale);
  const tMax = transform(max, scale);
  if (tMax === tMin) return 0.5;
  return clamp01((tv - tMin) / (tMax - tMin));
}

export function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

/** Linearly interpolate between two hex colors, returning an [r,g,b] 0–1 tuple. */
export function lerpColor(from: string, to: string, t: number): [number, number, number] {
  const a = hexToRgb(from);
  const b = hexToRgb(to);
  const k = clamp01(t);
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
}

/** Interpolate a gradient and return a CSS `rgb()` string (0–255). */
export function lerpColorCss(from: string, to: string, t: number): string {
  const [r, g, b] = lerpColor(from, to, t);
  return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const int = parseInt(clean, 16);
  return [((int >> 16) & 255) / 255, ((int >> 8) & 255) / 255, (int & 255) / 255];
}
