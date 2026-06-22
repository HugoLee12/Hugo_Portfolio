import { CameraShake } from "@react-three/drei";
import { useAppStore } from "../store";

export function ShakeEffect() {
  const warpRatio = useAppStore((state) => state.warpRatio);
  
  return (
    <CameraShake
      maxYaw={0.06}
      maxPitch={0.06}
      maxRoll={0.06}
      yawFrequency={0.6}
      pitchFrequency={0.6}
      rollFrequency={0.5}
      intensity={warpRatio}
      decayRate={0}
    />
  );
}
