import { Canvas } from "@react-three/fiber";
import { ArchitectureScene } from "../../renderer/three/ArchitectureScene";
import { useArchitectureStore } from "../../store/architecture-store";
import { useSimulationStore } from "../../store/simulation-store";
import { useUiStore } from "../../store/ui-store";

export function SceneViewport() {
  const architectureA = useArchitectureStore((state) => state.architectureA);
  const architectureB = useArchitectureStore((state) => state.architectureB);
  const activeSlot = useUiStore((state) => state.activeSlot);
  const architecture = activeSlot === "b" && architectureB ? architectureB : architectureA;
  const simulation = useSimulationStore((state) =>
    activeSlot === "b" && state.stateB ? state.stateB : state.stateA,
  );

  return (
    <div className="relative h-full min-h-[320px] overflow-hidden border-x border-slate-800 bg-[#070b14]">
      <Canvas
        camera={{ position: [9, 7, 12], fov: 45, near: 0.1, far: 80 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <ArchitectureScene architecture={architecture} simulation={simulation} />
      </Canvas>
      <div className="pointer-events-none absolute left-4 top-4 rounded-md border border-slate-700/80 bg-slate-950/70 px-3 py-2 text-xs text-slate-300">
        Drag to orbit · Scroll to zoom · Right-drag to pan
      </div>
    </div>
  );
}
