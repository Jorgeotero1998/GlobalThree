import { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

const GLOBE_RADIUS = 2;

export function GlobeSphere() {
  const earthRef = useRef();
  const cloudsRef = useRef();
  const wireRef = useRef();
  const groupRef = useRef();

  const [dayMap, bumpMap, specularMap, lightsMap, cloudsMap] = useLoader(THREE.TextureLoader, [
    '/textures/earth-day.jpg',
    '/textures/earth-bump.jpg',
    '/textures/earth-specular.jpg',
    '/textures/earth-lights.jpg',
    '/textures/earth-clouds.jpg',
  ]);

  // Material compuesto: textura de día + relieve + brillo especular en océanos,
  // con las luces nocturnas sumadas como emissive para un efecto "ciudades de noche"
  const earthMaterial = useMemo(() => {
    const material = new THREE.MeshPhongMaterial({
      map: dayMap,
      bumpMap: bumpMap,
      bumpScale: 0.04,
      specularMap: specularMap,
      specular: new THREE.Color('#223344'),
      shininess: 6,
      emissiveMap: lightsMap,
      emissive: new THREE.Color('#FFB347'),
      emissiveIntensity: 0.55,
    });
    return material;
  }, [dayMap, bumpMap, specularMap, lightsMap]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.04;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.018;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Esfera de la Tierra con textura real */}
      <mesh ref={earthRef} material={earthMaterial}>
        <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
      </mesh>

      {/* Capa de nubes, ligeramente más grande, semitransparente */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[GLOBE_RADIUS + 0.012, 64, 64]} />
        <meshStandardMaterial
          map={cloudsMap}
          transparent
          opacity={0.18}
          depthWrite={false}
        />
      </mesh>

      {/* Overlay sutil de grid técnico, encima de todo, para mantener la estética data-tech */}
      <mesh ref={wireRef}>
        <sphereGeometry args={[GLOBE_RADIUS + 0.02, 24, 24]} />
        <meshBasicMaterial
          color="#3EE6C4"
          wireframe
          transparent
          opacity={0.06}
          toneMapped={false}
        />
      </mesh>

      {/* Halo atmosférico exterior */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS + 0.05, 64, 64]} />
        <meshBasicMaterial
          color="#3EE6C4"
          transparent
          opacity={0.06}
          side={THREE.BackSide}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

export { GLOBE_RADIUS };
