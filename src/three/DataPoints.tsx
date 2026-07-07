import { useEffect, useMemo, useRef } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import type { GlobeIndexEntry } from '@/types';
import type { CountryView } from '@/hooks/useCountryView';
import { latLngToVector3 } from '@/lib/geo';
import { GLOBE_RADIUS } from './GlobeSphere';

interface DataPointsProps {
  views: CountryView[];
  selectedCode: string | null;
  compareCodes: readonly string[];
  hoveredCode: string | null;
  reducedMotion: boolean;
  onHover: (code: string | null) => void;
  onSelect: (country: GlobeIndexEntry) => void;
}

const dummy = new THREE.Object3D();
const tmpColor = new THREE.Color();
const POINT_SURFACE = GLOBE_RADIUS + 0.015;

/**
 * All data nodes rendered as a single InstancedMesh — one draw call for the
 * whole dataset. Positions are fixed to lat/lng; radius encodes the active
 * metric, color follows its gradient, and per-instance events drive hover and
 * selection via `instanceId`.
 */
export function DataPoints({
  views,
  selectedCode,
  compareCodes,
  hoveredCode,
  reducedMotion,
  onHover,
  onSelect,
}: DataPointsProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = views.length;

  const positions = useMemo(
    () => views.map((v) => latLngToVector3(v.country.lat, v.country.lng, POINT_SURFACE)),
    [views],
  );

  const baseScales = useMemo(
    () => views.map((v) => (v.matches ? 0.02 + v.norm * 0.05 : 0.012)),
    [views],
  );

  const geometry = useMemo(() => new THREE.SphereGeometry(1, 12, 12), []);
  const material = useMemo(() => new THREE.MeshBasicMaterial({ toneMapped: false }), []);

  // Per-instance colors: gradient hue for the metric, dimmed when filtered out,
  // brightened for the selected/hovered node.
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    views.forEach((v, i) => {
      const [r, g, b] = v.color;
      tmpColor.setRGB(r, g, b);
      if (!v.matches) {
        tmpColor.multiplyScalar(0.22);
      } else if (compareCodes.includes(v.country.code)) {
        tmpColor.set('#ff6b4a');
      } else if (v.country.code === selectedCode) {
        tmpColor.lerp(WHITE, 0.55);
      } else if (v.country.code === hoveredCode) {
        tmpColor.lerp(WHITE, 0.3);
      }
      mesh.setColorAt(i, tmpColor);
    });
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [views, selectedCode, compareCodes, hoveredCode]);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = clock.getElapsedTime();
    for (let i = 0; i < count; i++) {
      const v = views[i];
      const isCompare = compareCodes.includes(v.country.code);
      const isActive =
        v.country.code === selectedCode || v.country.code === hoveredCode || isCompare;
      const pulse = reducedMotion || !v.matches ? 1 : 1 + Math.sin(t * 2.2 + v.country.lat) * 0.16;
      const emphasis = isActive ? (isCompare ? 2.0 : 1.7) : 1;
      const scale = baseScales[i] * pulse * emphasis;
      dummy.position.copy(positions[i]);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  const handleMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (e.instanceId === undefined) return;
    const view = views[e.instanceId];
    if (!view?.matches) return;
    onHover(view.country.code);
    document.body.style.cursor = 'pointer';
  };

  const handleOut = () => {
    onHover(null);
    document.body.style.cursor = 'auto';
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.instanceId === undefined) return;
    const view = views[e.instanceId];
    if (view?.matches) onSelect(view.country);
  };

  return (
    <instancedMesh
      key={count}
      ref={meshRef}
      args={[geometry, material, count]}
      onPointerMove={handleMove}
      onPointerOut={handleOut}
      onClick={handleClick}
    />
  );
}

const WHITE = new THREE.Color('#ffffff');
