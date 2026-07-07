import * as THREE from 'three';

/**
 * Convert latitude/longitude (degrees) to a position on a sphere of the given
 * radius. Uses the standard spherical → Cartesian mapping with the texture
 * seam at lng = 180° to line up with the equirectangular Earth map.
 */
export function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

/**
 * Build a quadratic-bezier great-circle-ish arc between two surface points,
 * lifting the midpoint proportionally to the distance to simulate a "flight
 * path" over the globe.
 */
export function createArcPoints(
  start: THREE.Vector3,
  end: THREE.Vector3,
  radius: number,
  segments = 48,
): THREE.Vector3[] {
  const distance = start.distanceTo(end);
  const arcHeight = radius * 0.15 + distance * 0.25;

  const mid = start.clone().add(end).multiplyScalar(0.5);
  mid.normalize().multiplyScalar(radius + arcHeight);

  const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
  return curve.getPoints(segments);
}

/**
 * Deterministic pseudo-random generator (mulberry32) so memoized scene graph
 * data stays stable across renders without pulling in a dependency.
 */
export function seededRandom(seed: number): number {
  let t = seed + 0x6d2b79f5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
