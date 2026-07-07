import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import type { GlobeIndexEntry } from '@/types';
import type { CountryView } from '@/hooks/useCountryView';
import { GLOBE_INDEX } from '@/data/countries';
import { latLngToVector3 } from '@/lib/geo';
import { GlobeSphere, GLOBE_RADIUS } from './GlobeSphere';
import { DataPoints } from './DataPoints';
import { DataArcs } from './DataArcs';
import { RegionFlows } from './RegionFlows';
import { CompareArc } from './CompareArc';

interface GlobeSceneProps {
  views: CountryView[];
  arcCountries: GlobeIndexEntry[];
  accent: string;
  selectedCode: string | null;
  compareCodes: readonly string[];
  hoveredCode: string | null;
  reducedMotion: boolean;
  onHover: (code: string | null) => void;
  onSelect: (country: GlobeIndexEntry) => void;
  onDeselect: () => void;
}

export function GlobeScene(props: GlobeSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0.4, 5.2], fov: 45 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      dpr={[1, 2]}
    >
      <Suspense fallback={null}>
        <SceneContents {...props} />
      </Suspense>
    </Canvas>
  );
}

function SceneContents({
  views,
  arcCountries,
  accent,
  selectedCode,
  compareCodes,
  hoveredCode,
  reducedMotion,
  onHover,
  onSelect,
  onDeselect,
}: GlobeSceneProps) {
  const worldRef = useRef<THREE.Group>(null);
  const interactingRef = useRef(false);
  const targetYRef = useRef<number | null>(null);

  const focusCode = selectedCode ?? compareCodes[0] ?? null;

  useEffect(() => {
    if (!focusCode) {
      targetYRef.current = null;
      return;
    }
    const view = views.find((v) => v.country.code === focusCode);
    if (!view) return;
    const p = latLngToVector3(view.country.lat, view.country.lng, GLOBE_RADIUS);
    targetYRef.current = -Math.atan2(p.x, p.z);
  }, [focusCode, views]);

  useFrame((_, delta) => {
    const world = worldRef.current;
    if (!world) return;

    if (targetYRef.current !== null) {
      let diff = targetYRef.current - world.rotation.y;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      world.rotation.y += diff * Math.min(1, delta * 3.2);
    } else if (!reducedMotion && !interactingRef.current) {
      world.rotation.y += delta * 0.035;
    }
  });

  const comparePair = useMemo(() => {
    if (compareCodes.length !== 2) return null;
    const a = GLOBE_INDEX.find((c) => c.code === compareCodes[0]);
    const b = GLOBE_INDEX.find((c) => c.code === compareCodes[1]);
    return a && b ? ([a, b] as const) : null;
  }, [compareCodes]);

  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[5, 3, 5]} intensity={2.4} color="#ffffff" />
      <pointLight position={[-6, -3, -4]} intensity={0.7} color={accent} />
      <hemisphereLight args={['#3ee6c4', '#0a1020', 0.35]} />

      {!reducedMotion && (
        <Stars radius={80} depth={50} count={2400} factor={2.6} saturation={0} fade speed={0.25} />
      )}

      <group ref={worldRef} onPointerMissed={onDeselect}>
        <GlobeSphere reducedMotion={reducedMotion} accent={accent} />
        <RegionFlows countries={arcCountries} reducedMotion={reducedMotion} />
        <DataArcs countries={arcCountries} color={accent} reducedMotion={reducedMotion} />
        {comparePair && (
          <CompareArc from={comparePair[0]} to={comparePair[1]} reducedMotion={reducedMotion} />
        )}
        <DataPoints
          views={views}
          selectedCode={selectedCode}
          compareCodes={compareCodes}
          hoveredCode={hoveredCode}
          reducedMotion={reducedMotion}
          onHover={onHover}
          onSelect={onSelect}
        />
      </group>

      <OrbitControls
        enablePan={false}
        minDistance={3.0}
        maxDistance={9.5}
        minPolarAngle={Math.PI * 0.12}
        maxPolarAngle={Math.PI * 0.88}
        enableDamping
        dampingFactor={0.06}
        rotateSpeed={0.45}
        zoomSpeed={0.7}
        onStart={() => {
          interactingRef.current = true;
        }}
        onEnd={() => {
          interactingRef.current = false;
        }}
      />
    </>
  );
}
