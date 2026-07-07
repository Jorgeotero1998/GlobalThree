import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { GlobeIndexEntry } from '@/types';
import { REGION_COLORS } from '@/data/metrics';
import { createArcPoints, latLngToVector3, seededRandom } from '@/lib/geo';
import { GLOBE_RADIUS } from './GlobeSphere';

interface RegionFlowsProps {
  countries: GlobeIndexEntry[];
  reducedMotion: boolean;
}

/** Inter-region flow arcs from each continent hub to peer hubs. */
export function RegionFlows({ countries, reducedMotion }: RegionFlowsProps) {
  const arcs = useMemo(() => buildRegionHubArcs(countries), [countries]);

  return (
    <group>
      {arcs.map((arc) => (
        <RegionArc key={arc.key} spec={arc} reducedMotion={reducedMotion} />
      ))}
    </group>
  );
}

interface ArcSpec {
  key: string;
  points: THREE.Vector3[];
  line: THREE.Line;
  color: string;
  delay: number;
  speed: number;
}

function buildRegionHubArcs(countries: GlobeIndexEntry[]): ArcSpec[] {
  const byRegion = new Map<string, GlobeIndexEntry>();
  for (const c of countries) {
    const existing = byRegion.get(c.region);
    if (!existing || c.population > existing.population) byRegion.set(c.region, c);
  }
  const hubs = [...byRegion.values()];
  const specs: ArcSpec[] = [];

  for (let i = 0; i < hubs.length; i++) {
    for (let j = i + 1; j < hubs.length; j++) {
      const from = hubs[i];
      const to = hubs[j];
      const start = latLngToVector3(from.lat, from.lng, GLOBE_RADIUS);
      const end = latLngToVector3(to.lat, to.lng, GLOBE_RADIUS);
      const points = createArcPoints(start, end, GLOBE_RADIUS, 56);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const color = REGION_COLORS[from.region];
      const seed = i * 13 + j * 29;
      specs.push({
        key: `${from.code}-${to.code}`,
        points,
        line: new THREE.Line(
          geometry,
          new THREE.LineBasicMaterial({
            color,
            transparent: true,
            opacity: 0.12,
            toneMapped: false,
          }),
        ),
        color,
        delay: seededRandom(seed),
        speed: 0.08 + seededRandom(seed + 1) * 0.06,
      });
    }
  }
  return specs;
}

function RegionArc({
  spec,
  reducedMotion,
}: {
  spec: ArcSpec;
  reducedMotion: boolean;
}) {
  const pulseRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (reducedMotion || !pulseRef.current) return;
    const cycle = (clock.getElapsedTime() * spec.speed + spec.delay) % 1;
    const idx = Math.floor(cycle * (spec.points.length - 1));
    const point = spec.points[idx];
    if (!point) return;
    pulseRef.current.position.copy(point);
    const fade = Math.sin(cycle * Math.PI);
    const mat = pulseRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = fade * 0.7;
    pulseRef.current.scale.setScalar(0.014 + fade * 0.012);
  });

  return (
    <group>
      <primitive object={spec.line} />
      {!reducedMotion && (
        <mesh ref={pulseRef}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshBasicMaterial color={spec.color} transparent opacity={0} toneMapped={false} />
        </mesh>
      )}
    </group>
  );
}
