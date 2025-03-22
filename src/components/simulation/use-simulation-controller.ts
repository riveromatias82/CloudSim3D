import { useEffect, useRef } from "react";
import { useArchitectureStore } from "../../store/architecture-store";
import { useSimulationStore } from "../../store/simulation-store";

export function useSimulationController() {
  const architectureA = useArchitectureStore((state) => state.architectureA);
  const architectureB = useArchitectureStore((state) => state.architectureB);
  const scenario = useSimulationStore((state) => state.scenario);
  const frameRef = useRef<number>(0);
  const lastRef = useRef<number>(0);
  const accRef = useRef(0);

  useEffect(() => {
    useSimulationStore.getState().syncArchitectures(architectureA, architectureB);
  }, [architectureA, architectureB, scenario]);

  useEffect(() => {
    const loop = (now: number) => {
      const previous = lastRef.current || now;
      const delta = Math.min(0.08, (now - previous) / 1000);
      lastRef.current = now;
      accRef.current += delta;
      if (accRef.current >= 1 / 16) {
        useSimulationStore.getState().tick(accRef.current, architectureA, architectureB);
        accRef.current = 0;
      }
      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frameRef.current);
    };
  }, [architectureA, architectureB]);
}
