import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { GlobeIndexEntry } from '@/types';
import { createArcPoints, latLngToVector3, seededRandom } from '@/lib/geo';
import { GLOBE_RADIUS } from './GlobeSphere';

interface DataArcsProps {
  /** Countries to connect (typically the current metric's top nodes). */
  countries: GlobeIndexEntry[];
  color: string;
  reducedMotion: boolean;
}

const ARC_SEGMENTS = 48;
const MAX_ANCHORS = 16;

interface ArcSpec {
  key: string;
  points: THREE.Vector3[];
  line: THREE.Line;
  delay: number;
  speed: number;
}

/**
 * Great-circle "flow" arcs between the top nodes, each carrying a traveling
 * light pulse. Line geometry is memoized per dataset; only pulse positions
 * update each frame.
 */
export function DataArcs({ countries, color, reducedMotion }: DataArcsProps) {
  const arcs = useMemo<ArcSpec[]>(() => {
    const anchors = countries.slice(0, MAX_ANCHORS);
    const specs: ArcSpec[] = [];
    for (let i = 0; i < anchors.length; i++) {
      const connections = 1 + (i % 2);
      for (let j = 1; j <= connections; j++) {
        const targetIdx = (i + j * 3 + 2) % anchors.length;
        if (targetIdx === i) continue;
        const from = anchors[i];
        const to = anchors[targetIdx];
        const start = latLngToVector3(from.lat, from.lng, GLOBE_RADIUS);
        const end = latLngToVector3(to.lat, to.lng, GLOBE_RADIUS);
        const points = createArcPoints(start, end, GLOBE_RADIUS, ARC_SEGMENTS);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
          color,
          transparent: true,
          opacity: 0.2,
          toneMapped: false,
        });
        const seed = i * 17 + j * 31;
        specs.push({
          key: `${from.code}-${to.code}`,
          points,
          line: new THREE.Line(geometry, material),
          delay: seededRandom(seed),
          speed: 0.12 + seededRandom(seed + 1) * 0.1,
        });
      }
    }
    return specs;
  }, [countries, color]);

  return (
    <group>
      {arcs.map((arc) => (
        <Arc key={arc.key} spec={arc} color={color} reducedMotion={reducedMotion} />
      ))}
    </group>
  );
}

function Arc({
  spec,
  color,
  reducedMotion,
}: {
  spec: ArcSpec;
  color: string;
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
    mat.opacity = fade;
    pulseRef.current.scale.setScalar(0.016 + fade * 0.014);
  });

  return (
    <group>
      <primitive object={spec.line} />
      {!reducedMotion && (
        <mesh ref={pulseRef}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshBasicMaterial color={color} transparent opacity={0} toneMapped={false} />
        </mesh>
      )}
    </group>
  );
}
