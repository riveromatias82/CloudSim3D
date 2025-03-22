import { ArchitecturePanel } from "../architecture/ArchitecturePanel";
import { ResourceDetailsPanel } from "../architecture/ResourceDetailsPanel";
import { ComparisonPanel } from "../scenarios/ComparisonPanel";
import { BottleneckPanel } from "../metrics/BottleneckPanel";
import { MetricsPanel } from "../metrics/MetricsPanel";
import { TimelineBar } from "../simulation/TimelineBar";
import { useSimulationController } from "../simulation/use-simulation-controller";
import { SceneViewport } from "./SceneViewport";
import { TopBar } from "./TopBar";
import { useArchitectureStore } from "../../store/architecture-store";

export function AppShell() {
  useSimulationController();
  const lastError = useArchitectureStore((state) => state.lastError);
  const clearError = useArchitectureStore((state) => state.clearError);

  return (
    <div className="flex h-full min-h-screen flex-col bg-surface-950 text-slate-100">
      <TopBar />
      {lastError ? (
        <div className="flex items-start justify-between gap-4 border-b border-rose-500/40 bg-rose-950/80 px-4 py-3 text-sm text-rose-100">
          <pre className="whitespace-pre-wrap font-sans">{lastError}</pre>
          <button className="text-rose-200 underline" onClick={clearError}>
            Dismiss
          </button>
        </div>
      ) : null}
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)_340px]">
        <div className="grid min-h-0 grid-rows-[minmax(0,1fr)_auto] border-r border-slate-800 lg:grid-rows-[minmax(220px,1fr)_220px]">
          <ArchitecturePanel />
          <ResourceDetailsPanel />
        </div>
        <SceneViewport />
        <div className="grid min-h-0 grid-rows-[minmax(0,1fr)_220px] border-l border-slate-800">
          <MetricsPanel />
          <BottleneckPanel />
        </div>
      </div>
      <TimelineBar />
      <ComparisonPanel />
    </div>
  );
}
