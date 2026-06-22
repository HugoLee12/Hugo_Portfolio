
import { useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";
import { LensingBubble } from "./LensingBubble";
import { useAppStore } from "../store";
import {
  accretionDiskVertexShader,
  accretionDiskFragmentShader,
  lensingVertexShader,
  lensingFragmentShader
} from "../shaders";

export function BlackHole({
  onClick,
  selectedId
}: {
  onClick?: () => void;
  selectedId?: string | null;
}) {
  const diskRef = useRef<THREE.Mesh>(null);
  const lensingRef = useRef<THREE.Mesh>(null);
  const blackHoleGroupRef = useRef<THREE.Group>(null!);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColorInner: { value: new THREE.Color("#ccffff") },
      uColorMid: { value: new THREE.Color("#0055ff") },
      uColorOuter: { value: new THREE.Color("#6b21a8") },
    }),
    [],
  );

  useFrame(({ clock }, delta) => {
    const isPaused = selectedId != null || useAppStore.getState().hoveredId !== null;
    if (!isPaused) {
      uniforms.uTime.value += delta * 0.5;
    }

    const tiltX = Math.PI / 2.2;
    const tiltY = Math.PI / 8;

    if (diskRef.current) {
      diskRef.current.rotation.x = tiltX;
      diskRef.current.rotation.y = tiltY;
    }
  });

  return (
    <group
      onClick={(e) => {
        if (onClick) {
          e.stopPropagation();
          if (e.delta <= 5) {
            onClick();
          }
        }
      }}
      onPointerOver={(e) => {
        if (onClick) {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
        }
      }}
      onPointerOut={(e) => {
        if (onClick) {
          e.stopPropagation();
          document.body.style.cursor = "auto";
        }
      }}
    >
      <LensingBubble blackHoleRef={blackHoleGroupRef} />

      <group ref={blackHoleGroupRef}>
        <mesh renderOrder={1}>
          <sphereGeometry args={[1.8, 64, 64]} />
          <meshBasicMaterial color="#000000" depthWrite={true} />
        </mesh>

        <mesh ref={diskRef} renderOrder={2}>
          <ringGeometry args={[1.8, 4.5, 128]} />
          <shaderMaterial
            uniforms={uniforms}
            vertexShader={accretionDiskVertexShader}
            fragmentShader={accretionDiskFragmentShader}
            transparent={true}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>

        <mesh ref={lensingRef} renderOrder={3}>
          <sphereGeometry args={[1.85, 64, 64]} />
          <shaderMaterial
            uniforms={uniforms}
            vertexShader={lensingVertexShader}
            fragmentShader={lensingFragmentShader}
            transparent={true}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.FrontSide}
          />
        </mesh>
      </group>
    </group>
  );
}