
import { useFrame, useThree } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";
import { useAppStore } from "../store";

const tempCamDir = new THREE.Vector3();
const tempRight = new THREE.Vector3();
const tempUp = new THREE.Vector3();
const zAxis = new THREE.Vector3(0, 0, 1);
const tempOffset = new THREE.Vector3();
const tempNegDir = new THREE.Vector3();

export function WarpLines() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { camera } = useThree();

  const count = 400;
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const radius = 10 + Math.random() * 60;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      temp.push({
        pos: new THREE.Vector3(x, y, z),
        speed: Math.random() * 150 + 100,
      });
    }
    return temp;
  }, [count]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const warpRatio = useAppStore.getState().warpRatio;
    const intensity = Math.pow(warpRatio, 1.5);

    meshRef.current.visible = intensity > 0.01;
    if (!meshRef.current.visible) return;

    camera.getWorldDirection(tempCamDir);

    for (let i = 0; i < count; i++) {
      const p = particles[i];

      p.pos.addScaledVector(tempCamDir, -p.speed * delta * intensity);

      const distToCam = p.pos.distanceTo(camera.position);

      if (distToCam > 120 || distToCam < 2) {
        const newDist = 60 + Math.random() * 40;
        const spreadX = (Math.random() - 0.5) * 60;
        const spreadY = (Math.random() - 0.5) * 60;

        tempRight.crossVectors(tempCamDir, camera.up).normalize();
        tempUp.crossVectors(tempRight, tempCamDir).normalize();

        tempOffset.copy(tempCamDir).multiplyScalar(newDist);
        p.pos
          .copy(camera.position)
          .add(tempOffset)
          .add(tempRight.multiplyScalar(spreadX))
          .add(tempUp.multiplyScalar(spreadY));
      }

      dummy.position.copy(p.pos);

      tempNegDir.copy(tempCamDir).negate();
      dummy.quaternion.setFromUnitVectors(zAxis, tempNegDir);

      dummy.scale.set(0.04, 0.04, 15 + 60 * intensity);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    (meshRef.current.material as THREE.MeshBasicMaterial).opacity =
      intensity * 0.9;
  });

  return (
    <instancedMesh
      ref={meshRef as any}
      args={[undefined, undefined, count]}
      renderOrder={99}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial
        color="#ffffff"
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  );
}