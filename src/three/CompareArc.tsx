import { useMemo, useRef, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { GlobeIndexEntry } from '@/types';
import { createArcPoints, latLngToVector3 } from '@/lib/geo';
import { GLOBE_RADIUS } from './GlobeSphere';

interface CompareArcProps {
  from: GlobeIndexEntry;
  to: GlobeIndexEntry;
  reducedMotion: boolean;
}

/** Prominent animated arc linking two countries in compare mode. */
export function CompareArc({ from, to, reducedMotion }: CompareArcProps) {
  const pulseRef = useRef<THREE.Mesh>(null);
  const pulse2Ref = useRef<THREE.Mesh>(null);

  const { points, geometry } = useMemo(() => {
    const start = latLngToVector3(from.lat, from.lng, GLOBE_RADIUS);
    const end = latLngToVector3(to.lat, to.lng, GLOBE_RADIUS);
    const pts = createArcPoints(start, end, GLOBE_RADIUS, 64);
    return { points: pts, geometry: new THREE.BufferGeometry().setFromPoints(pts) };
  }, [from, to]);

  const line = useMemo(
    () =>
      new THREE.Line(
        geometry,
        new THREE.LineBasicMaterial({
          color: '#ff6b4a',
          transparent: true,
          opacity: 0.55,
          toneMapped: false,
        }),
      ),
    [geometry],
  );

  useFrame(({ clock }) => {
    if (reducedMotion) return;
    const t = clock.getElapsedTime();
    const cycle = (t * 0.18) % 1;
    const cycle2 = (t * 0.18 + 0.5) % 1;
    placePulse(pulseRef, points, cycle);
    placePulse(pulse2Ref, points, cycle2);
  });

  return (
    <group>
      <primitive object={line} />
      {!reducedMotion && (
        <>
          <mesh ref={pulseRef}>
            <sphereGeometry args={[1, 10, 10]} />
            <meshBasicMaterial color="#ff6b4a" transparent opacity={0} toneMapped={false} />
          </mesh>
          <mesh ref={pulse2Ref}>
            <sphereGeometry args={[1, 10, 10]} />
            <meshBasicMaterial color="#ffd166" transparent opacity={0} toneMapped={false} />
          </mesh>
        </>
      )}
    </group>
  );
}

function placePulse(
  ref: RefObject<THREE.Mesh | null>,
  points: THREE.Vector3[],
  cycle: number,
) {
  if (!ref.current) return;
  const idx = Math.floor(cycle * (points.length - 1));
  const point = points[idx];
  if (!point) return;
  ref.current.position.copy(point);
  const fade = Math.sin(cycle * Math.PI);
  const mat = ref.current.material as THREE.MeshBasicMaterial;
  mat.opacity = fade * 0.95;
  ref.current.scale.setScalar(0.022 + fade * 0.018);
}
