import { useFrame, useThree } from "@react-three/fiber";
import { useFBO } from "@react-three/drei";
import { useRef, useMemo } from "react";
import { Group, Mesh, ShaderMaterial } from 'three';

const LENSING_FBO_SIZE = 512;
const LENSING_UPDATE_INTERVAL = 2;

const vertexShader = `
varying vec4 vScreenPos;
varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vViewPosition = -mvPosition.xyz;
  vNormal = normalMatrix * normal;

  gl_Position = projectionMatrix * mvPosition;
  vScreenPos = gl_Position;
}
`;

const fragmentShader = `
varying vec4 vScreenPos;
varying vec3 vNormal;
varying vec3 vViewPosition;

uniform sampler2D tDiffuse;

void main() {
  vec2 screenUv = (vScreenPos.xy / vScreenPos.w) * 0.5 + 0.5;

  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(vViewPosition);

  float fresnel = max(dot(normal, viewDir), 0.0);



  float radius = 1.0 - fresnel;

  float distortionStrength = (1.0 / (radius + 0.1) - 0.9) * 0.15;
  vec2 distortion = normal.xy * distortionStrength;
  vec2 finalUv = screenUv + distortion;
  vec4 texColor = texture2D(tDiffuse, clamp(finalUv, 0.0, 1.0));

  float alpha = smoothstep(0.0, 0.1, fresnel);

  gl_FragColor = vec4(texColor.rgb, alpha);
}
`;

export function LensingBubble({
  blackHoleRef,
}: {
  blackHoleRef?: React.RefObject<Group>;
}) {
  const meshRef = useRef<Mesh>(null!);
  const materialRef = useRef<ShaderMaterial>(null!);
  const frameCount = useRef(0);

  const fbo = useFBO(LENSING_FBO_SIZE, LENSING_FBO_SIZE);

  const uniforms = useMemo(
    () => ({
      tDiffuse: { value: null },
    }),
    [],
  );

  useFrame((state) => {
    frameCount.current += 1;
    const hasTexture = Boolean(materialRef.current?.uniforms.tDiffuse.value);
    const shouldRefreshTexture =
      frameCount.current % LENSING_UPDATE_INTERVAL === 1 || !hasTexture;

    if (!shouldRefreshTexture) {
      return;
    }

    meshRef.current.visible = false;

    let previousVisible = true;
    if (blackHoleRef?.current) {
      previousVisible = blackHoleRef.current.visible;
      blackHoleRef.current.visible = false;
    }

    state.gl.setRenderTarget(fbo);
    state.gl.render(state.scene, state.camera);
    state.gl.setRenderTarget(null);

    if (blackHoleRef?.current) {
      blackHoleRef.current.visible = previousVisible;
    }

    meshRef.current.visible = true;
    if (materialRef.current) {
      materialRef.current.uniforms.tDiffuse.value = fbo.texture;
    }
  });

  return (
    <mesh ref={meshRef} renderOrder={0}>
      <sphereGeometry args={[2.8, 64, 64]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
        depthWrite={false}
      />
    </mesh>
  );
}
