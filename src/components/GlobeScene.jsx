import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { GlobeSphere } from './GlobeSphere';
import { CityPoints } from './CityPoints';
import { DataArcs } from './DataArcs';

export function GlobeScene({ countries, selectedCountry, onSelect }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5.0], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.45} />
        <directionalLight position={[5, 2, 5]} intensity={2.4} color="#FFFFFF" />
        <pointLight position={[-5, -3, -5]} intensity={0.6} color="#3EE6C4" />

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
