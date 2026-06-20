import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { latLngToVector3, REGION_COLORS } from '../utils/geo';
import { GLOBE_RADIUS } from './GlobeSphere';

function CityPoint({ country, onSelect, isSelected }) {
  const haloRef = useRef();
  const [hovered, setHovered] = useState(false);

  const position = useMemo(
    () => latLngToVector3(country.lat, country.lng, GLOBE_RADIUS + 0.01),
    [country.lat, country.lng]
  );

  const color = REGION_COLORS[country.region] || REGION_COLORS.Unknown;

  // Escala del punto según población (raíz para no saturar el rango visual)
  const baseScale = useMemo(() => {
    const norm = Math.sqrt(country.population) / Math.sqrt(1_400_000_000);
    return 0.028 + norm * 0.05;
  }, [country.population]);

  const pulseGroupRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const pulse = 1 + Math.sin(t * 2.2 + country.lat) * 0.18;
    if (pulseGroupRef.current) {
      const targetScale = (hovered || isSelected ? baseScale * 1.6 : baseScale) * pulse;
      pulseGroupRef.current.scale.setScalar(targetScale);
    }
    if (haloRef.current) {
      const haloPulse = 1 + Math.sin(t * 2.2 + country.lat) * 0.4;
      haloRef.current.scale.setScalar(baseScale * 2.8 * haloPulse);
      haloRef.current.material.opacity = (hovered || isSelected ? 0.35 : 0.18) * (0.6 + Math.sin(t * 2.2 + country.lat) * 0.2);
    }
  });

  return (
    <group position={position}>
      {/* Mesh invisible más grande, solo para hacer el click/hover más tolerante */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelect(country);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <sphereGeometry args={[Math.max(baseScale * 2.5, 0.08), 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <group ref={pulseGroupRef}>
        <mesh>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial color={isSelected ? '#FF6B4A' : color} toneMapped={false} />
        </mesh>
      </group>
      <mesh ref={haloRef}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color={isSelected ? '#FF6B4A' : color}
          transparent
          opacity={0.2}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

export function CityPoints({ countries, selectedCountry, onSelect }) {
  return (
    <group>
      {countries.map((country) => (
        <CityPoint
          key={country.code}
          country={country}
          onSelect={onSelect}
          isSelected={selectedCountry?.code === country.code}
        />
      ))}
    </group>
  );
}
