import * as THREE from 'three';

/**
 * Convierte latitud/longitud a una posición en la superficie de una esfera 3D.
 * @param {number} lat - Latitud en grados
 * @param {number} lng - Longitud en grados
 * @param {number} radius - Radio de la esfera
 * @returns {THREE.Vector3}
 */
export function latLngToVector3(lat, lng, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

/**
 * Genera puntos de control para un arco curvo entre dos posiciones en la esfera,
 * elevando el punto medio para simular un "vuelo" sobre la superficie.
 * @param {THREE.Vector3} start
 * @param {THREE.Vector3} end
 * @param {number} radius
 * @param {number} segments
 * @returns {THREE.Vector3[]}
 */
export function createArcPoints(start, end, radius, segments = 64) {
  const distance = start.distanceTo(end);
  // Altura del arco proporcional a la distancia entre los puntos
  const arcHeight = radius * 0.15 + distance * 0.25;

  const mid = start.clone().add(end).multiplyScalar(0.5);
  mid.normalize().multiplyScalar(radius + arcHeight);

  const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
  return curve.getPoints(segments);
}

/** Colores por región para diferenciar visualmente los continentes */
export const REGION_COLORS = {
  Asia: '#3EE6C4',
  Africa: '#FF8B3D',
  Americas: '#4F8FFF',
  Europe: '#E6C9FF',
  Oceania: '#F2E04C',
  Antarctic: '#8896A8',
  Unknown: '#8896A8',
};

export function formatPopulation(num) {
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(2)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(0)}K`;
  return num.toString();
}
