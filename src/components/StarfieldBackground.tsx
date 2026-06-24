import { Canvas } from "@react-three/fiber";
import { Starfield } from "./Starfield";

const SHELL_CANVAS_DPR: [number, number] = [1, 1.25];

export function StarfieldBackground() {
  return (
    <div className="fixed inset-0 z-[0] pointer-events-auto bg-[#0a0a24]">
      <Canvas
        eventSource={
          typeof window !== "undefined"
            ? document.getElementById("root") || document.body
            : undefined
        }
        dpr={SHELL_CANVAS_DPR}
        gl={{ antialias: false, powerPreference: "low-power" }}
      >
        <Starfield />
      </Canvas>
    </div>
  );
}
