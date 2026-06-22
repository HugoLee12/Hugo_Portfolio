
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { OrbitControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useState, useRef, useEffect } from "react";
import { Project } from "../data";
import { UniverseBackground } from "./UniverseBackground";
import { CameraManager } from "./CameraManager";
import { WarpLines } from "./WarpLines";
import { BlackHole } from "./BlackHole";
import { ProjectNode } from "./ProjectNode";
import { ShakeEffect } from "./ShakeEffect";
import { useAppStore } from "../store";

export interface UniverseSceneProps {
  projects: Project[];
  selectedId: string | null;
  isTransitioning?: boolean;
  onSingularityTrigger?: () => void;
  onEnteredSingularity?: () => void;
  onSelect: (id: string | null) => void;
}

export function UniverseScene({
  projects,
  selectedId,
  isTransitioning,
  onSingularityTrigger,
  onEnteredSingularity,
  onSelect,
}: UniverseSceneProps) {
  const prevSelectedId = useRef(selectedId);
  const [isIntro, setIsIntro] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIsIntro(false), 2000);
    return () => clearTimeout(t);
  }, []);

  useFrame((_, delta) => {
    if (prevSelectedId.current !== selectedId) {
      if (selectedId || prevSelectedId.current) {
        useAppStore.getState().setWarpRatio(1.0);
      }
      prevSelectedId.current = selectedId;
    }

    const currentWarp = useAppStore.getState().warpRatio;
    if (currentWarp > 0) {
      useAppStore.getState().setWarpRatio(Math.max(0, currentWarp - delta * 1.5));
    }
  });

  return (
    <>
      <color attach="background" args={["#020617"]} />
      <OrbitControls
        makeDefault
        enabled={!isTransitioning}
        autoRotateSpeed={0.5}
        enablePan={false}
        minDistance={isTransitioning ? 0 : 8}
        maxDistance={40}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.2}
      />
      <CameraManager
        selectedId={selectedId}
        isIntro={isIntro}
        isTransitioning={isTransitioning}
        onEnteredSingularity={onEnteredSingularity}
      />
      <ShakeEffect />
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 10]} intensity={1} color="#f8fafc" />
      <pointLight
        position={[0, 0, 0]}
        intensity={2}
        color="#38bdf8"
        distance={20}
        decay={2}
      />{" "}
      <UniverseBackground />
      <WarpLines />
      <BlackHole selectedId={selectedId} onClick={onSingularityTrigger} />
      {projects.map((project) => (
        <ProjectNode
          key={project.id}
          project={project}
          isSelected={selectedId === project.id}
          selectedId={selectedId}
          isTransitioning={isTransitioning}
          onSelect={onSelect}
        />
      ))}
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.15}
          mipmapBlur
          luminanceSmoothing={0.8}
          intensity={1.5}
        />
      </EffectComposer>
    </>
  );
}