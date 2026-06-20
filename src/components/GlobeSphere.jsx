import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const GLOBE_RADIUS = 2;

export function GlobeSphere() {
  const groupRef = useRef();
  const wireRef = useRef();

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.04;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Esfera sólida base, oscura, casi invisible para dar profundidad */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS - 0.01, 64, 64]} />
        <meshStandardMaterial
          color="#070B14"
          roughness={0.9}
          metalness={0.1}
          emissive="#0A1220"
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* Wireframe de líneas de latitud/longitud, estética técnica */}
      <mesh ref={wireRef}>
        <sphereGeometry args={[GLOBE_RADIUS, 32, 32]} />
        <meshBasicMaterial
          color="#1C2A40"
          wireframe
          transparent
          opacity={0.45}
        />
      </mesh>

      {/* Halo atmosférico exterior */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS + 0.045, 64, 64]} />
        <meshBasicMaterial
          color="#3EE6C4"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

export { GLOBE_RADIUS };
