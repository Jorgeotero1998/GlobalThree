import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { GlobeSphere } from './GlobeSphere';
import { CityPoints } from './CityPoints';
import { DataArcs } from './DataArcs';

export function GlobeScene({ countries, selectedCountry, onSelect }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 4.4], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.6} />
        <pointLight position={[5, 3, 5]} intensity={1.2} color="#3EE6C4" />
        <pointLight position={[-5, -3, -5]} intensity={0.4} color="#FF6B4A" />

        <Stars radius={60} depth={40} count={2200} factor={2.2} saturation={0} fade speed={0.4} />

        <group onPointerMissed={() => onSelect(null)}>
          <GlobeSphere />
          <CityPoints
            countries={countries}
            selectedCountry={selectedCountry}
            onSelect={onSelect}
          />
          <DataArcs countries={countries} />
        </group>

        <OrbitControls
          enablePan={false}
          minDistance={3.2}
          maxDistance={9}
          autoRotate={false}
          enableDamping
          dampingFactor={0.08}
          rotateSpeed={0.5}
        />
      </Suspense>
    </Canvas>
  );
}
