import { useMemo, useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

export const GLOBE_RADIUS = 2;

interface GlobeSphereProps {
  reducedMotion: boolean;
  accent: string;
}

/**
 * Textured Earth with a custom day/night blend shader, drifting clouds, and a
 * Fresnel atmosphere rim. Sun direction animates slowly for a live feel.
 */
export function GlobeSphere({ reducedMotion, accent }: GlobeSphereProps) {
  const cloudsRef = useRef<THREE.Mesh>(null);
  const earthRef = useRef<THREE.Mesh>(null);

  const [dayMap, bumpMap, specularMap, lightsMap, cloudsMap] = useLoader(THREE.TextureLoader, [
    '/textures/earth-day.jpg',
    '/textures/earth-bump.jpg',
    '/textures/earth-specular.jpg',
    '/textures/earth-lights.jpg',
    '/textures/earth-clouds.jpg',
  ]);

  const earthMaterial = useMemo(
    () => createEarthMaterial(dayMap, bumpMap, specularMap, lightsMap),
    [dayMap, bumpMap, specularMap, lightsMap],
  );

  const atmosphereMaterial = useMemo(() => createAtmosphereMaterial(accent), [accent]);

  useFrame(({ clock }, delta) => {
    if (!reducedMotion && cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.012;
    }
    const sunDir = earthMaterial.uniforms.uSunDirection.value as THREE.Vector3;
    if (!reducedMotion) {
      const t = clock.getElapsedTime() * 0.04;
      sunDir.set(Math.cos(t) * 0.8, 0.35, Math.sin(t) * 0.8).normalize();
    }
  });

  return (
    <group>
      <mesh ref={earthRef} material={earthMaterial}>
        <sphereGeometry args={[GLOBE_RADIUS, 96, 96]} />
      </mesh>

      <mesh ref={cloudsRef}>
        <sphereGeometry args={[GLOBE_RADIUS + 0.012, 64, 64]} />
        <meshStandardMaterial map={cloudsMap} transparent opacity={0.18} depthWrite={false} />
      </mesh>

      <mesh material={atmosphereMaterial} scale={1.18}>
        <sphereGeometry args={[GLOBE_RADIUS, 72, 72]} />
      </mesh>

      {/* Inner glow shell */}
      <mesh scale={1.06}>
        <sphereGeometry args={[GLOBE_RADIUS, 48, 48]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={0.04}
          side={THREE.BackSide}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function createEarthMaterial(
  dayMap: THREE.Texture,
  bumpMap: THREE.Texture,
  specularMap: THREE.Texture,
  lightsMap: THREE.Texture,
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uDayMap: { value: dayMap },
      uBumpMap: { value: bumpMap },
      uSpecularMap: { value: specularMap },
      uLightsMap: { value: lightsMap },
      uSunDirection: { value: new THREE.Vector3(1, 0.3, 0.5).normalize() },
    },
    lights: false,
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      varying vec3 vNormalW;
      varying vec3 vViewDir;
      void main() {
        vUv = uv;
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vNormalW = normalize(mat3(modelMatrix) * normal);
        vViewDir = normalize(cameraPosition - worldPos.xyz);
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uDayMap;
      uniform sampler2D uBumpMap;
      uniform sampler2D uSpecularMap;
      uniform sampler2D uLightsMap;
      uniform vec3 uSunDirection;
      varying vec2 vUv;
      varying vec3 vNormalW;
      varying vec3 vViewDir;

      void main() {
        vec3 dayColor = texture2D(uDayMap, vUv).rgb;
        vec3 nightColor = texture2D(uLightsMap, vUv).rgb * vec3(1.0, 0.72, 0.42);
        float specMask = texture2D(uSpecularMap, vUv).r;

        float sunDot = dot(normalize(vNormalW), normalize(uSunDirection));
        float dayMix = smoothstep(-0.15, 0.35, sunDot);
        vec3 base = mix(nightColor, dayColor, dayMix);

        // Specular highlight on oceans
        vec3 halfDir = normalize(normalize(uSunDirection) + vViewDir);
        float spec = pow(max(dot(vNormalW, halfDir), 0.0), 18.0) * specMask * dayMix;
        base += vec3(spec * 0.35);

        // Subtle rim for depth
        float rim = pow(1.0 - max(dot(vNormalW, vViewDir), 0.0), 3.0);
        base += vec3(0.04, 0.12, 0.14) * rim;

        gl_FragColor = vec4(base, 1.0);
      }
    `,
  });
}

function createAtmosphereMaterial(accent: string): THREE.ShaderMaterial {
  const color = new THREE.Color(accent);
  return new THREE.ShaderMaterial({
    transparent: true,
    side: THREE.BackSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uColor: { value: color },
      uIntensity: { value: 1.0 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vNormal;
      uniform vec3 uColor;
      uniform float uIntensity;
      void main() {
        float rim = pow(0.68 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.8);
        float glow = clamp(rim, 0.0, 1.0) * uIntensity;
        gl_FragColor = vec4(uColor, glow * 0.85);
      }
    `,
  });
}
