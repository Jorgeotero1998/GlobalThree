import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { latLngToVector3, createArcPoints, REGION_COLORS } from '../utils/geo';
import { GLOBE_RADIUS } from './GlobeSphere';

const ARC_SEGMENTS = 48;

/** Generador pseudo-aleatorio determinístico (mulberry32) para mantener useMemo puro */
function seededRandom(seed) {
  let t = seed + 0x6d2b79f5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function DataArc({ from, to, delay, speed, color }) {
  const lineRef = useRef();
  const pulseRef = useRef();

  const points = useMemo(() => {
    const start = latLngToVector3(from.lat, from.lng, GLOBE_RADIUS);
    const end = latLngToVector3(to.lat, to.lng, GLOBE_RADIUS);
    return createArcPoints(start, end, GLOBE_RADIUS, ARC_SEGMENTS);
  }, [from, to]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    return geo;
  }, [points]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed + delay;
    const cycle = t % 1;

    // Línea base tenue, siempre visible
    if (lineRef.current) {
      lineRef.current.material.opacity = 0.22;
    }

    // Pulso que viaja a lo largo del arco
    if (pulseRef.current) {
      const idx = Math.floor(cycle * (points.length - 1));
      const point = points[idx];
      if (point) {
        pulseRef.current.position.copy(point);
        const fade = Math.sin(cycle * Math.PI); // fade in/out en los extremos
        pulseRef.current.material.opacity = fade;
        pulseRef.current.scale.setScalar(0.018 + fade * 0.014);
      }
    }
  });

  return (
    <group>
      <line ref={lineRef} geometry={geometry}>
        <lineBasicMaterial color={color} transparent opacity={0.22} toneMapped={false} />
      </line>
      <mesh ref={pulseRef}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.9} toneMapped={false} />
      </mesh>
    </group>
  );
}

/**
 * Genera un set de arcos entre países cercanos en el ranking (simulando "flujos")
 * conectando cada país con los siguientes 1-2 en la lista para no saturar el globo.
 */
export function DataArcs({ countries }) {
  const arcs = useMemo(() => {
    const result = [];
    const top = countries.slice(0, 22); // limitar arcos para legibilidad visual

    for (let i = 0; i < top.length; i++) {
      const connections = 1 + (i % 2); // alterna 1 o 2 conexiones
      for (let j = 1; j <= connections; j++) {
        const targetIdx = (i + j * 3 + 2) % top.length;
        if (targetIdx === i) continue;
        const seed = i * 17 + j * 31;
        result.push({
          from: top[i],
          to: top[targetIdx],
          delay: seededRandom(seed),
          speed: 0.12 + seededRandom(seed + 1) * 0.1,
          color: REGION_COLORS[top[i].region] || REGION_COLORS.Unknown,
          key: `${top[i].code}-${top[targetIdx].code}`,
        });
      }
    }
    return result;
  }, [countries]);

  return (
    <group>
      {arcs.map((arc) => (
        <DataArc
          key={arc.key}
          from={arc.from}
          to={arc.to}
          delay={arc.delay}
          speed={arc.speed}
          color={arc.color}
        />
      ))}
    </group>
  );
}
