import { Panel } from "../common/Panel";
import { useArchitectureStore } from "../../store/architecture-store";
import { useSimulationStore } from "../../store/simulation-store";
import { formatPercent } from "../../utils/format";

export function BottleneckPanel() {
  const architecture = useArchitectureStore((state) => state.architectureA);
  const bottlenecks = useSimulationStore((state) => state.stateA.bottlenecks);

  return (
    <Panel title="Potential Bottlenecks" subtitle="Simulation result only" className="h-full">
      {bottlenecks.length === 0 ? (
        <p className="text-sm text-slate-400">No simulated bottlenecks at the current playhead.</p>
      ) : (
        <ul className="space-y-3">
          {bottlenecks.map((bottleneck) => {
            const resource = architecture.resources.find((item) => item.id === bottleneck.resourceId);
            return (
              <li key={bottleneck.resourceId} className="rounded-md border border-orange-500/30 bg-orange-500/10 p-3">
                <p className="font-semibold text-orange-200">{resource?.name ?? bottleneck.resourceId}</p>
                <p className="font-mono text-sm text-slate-100">{formatPercent(bottleneck.utilization, 1)} utilization</p>
                <p className="mt-1 text-xs text-slate-400">{bottleneck.reason}</p>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
