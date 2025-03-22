import { Panel } from "../common/Panel";
import { StatusBadge } from "../common/StatusBadge";
import { useArchitectureStore } from "../../store/architecture-store";
import { useSimulationStore } from "../../store/simulation-store";
import { useUiStore } from "../../store/ui-store";
import { getResourceCapacityRps, getResourceBaseLatencyMs } from "../../domain/infrastructure/resource";
import { formatMs, formatPercent, formatRps, formatStatus } from "../../utils/format";

export function ResourceDetailsPanel() {
  const architectureA = useArchitectureStore((state) => state.architectureA);
  const architectureB = useArchitectureStore((state) => state.architectureB);
  const activeSlot = useUiStore((state) => state.activeSlot);
  const selectedResourceId = useUiStore((state) => state.selectedResourceId);
  const architecture = activeSlot === "b" && architectureB ? architectureB : architectureA;
  const simulation = useSimulationStore((state) =>
    activeSlot === "b" && state.stateB ? state.stateB : state.stateA,
  );
  const resource = architecture.resources.find((item) => item.id === selectedResourceId);
  const state = selectedResourceId ? simulation.resources[selectedResourceId] : undefined;

  return (
    <Panel title="Resource" subtitle={resource ? resource.name : "Select a node"} className="h-full">
      {!resource ? (
        <p className="text-sm text-slate-400">
          Click a resource in the 3D scene or in the architecture list to inspect simulated state.
        </p>
      ) : (
        <dl className="space-y-3 text-sm">
          <Row label="Type" value={resource.type} />
          <Row label="Capacity" value={formatRps(getResourceCapacityRps(resource))} />
          <Row label="Base latency" value={formatMs(getResourceBaseLatencyMs(resource))} />
          <Row label="Current traffic" value={formatRps(state?.incomingRequestsPerSecond ?? 0)} />
          <Row label="Outgoing" value={formatRps(state?.outgoingRequestsPerSecond ?? 0)} />
          <Row label="Utilization" value={formatPercent(state?.utilization ?? 0, 1)} />
          <Row label="Latency" value={formatMs(state?.latencyMs ?? getResourceBaseLatencyMs(resource))} />
          <Row label="Error rate" value={formatPercent(state?.errorRate ?? 0, 1)} />
          <div className="flex items-center justify-between">
            <dt className="text-slate-400">Status</dt>
            <dd>{state ? <StatusBadge status={state.status} /> : formatStatus("healthy")}</dd>
          </div>
        </dl>
      )}
    </Panel>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-slate-400">{label}</dt>
      <dd className="font-mono text-slate-100">{value}</dd>
    </div>
  );
}
