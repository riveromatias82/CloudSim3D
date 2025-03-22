import { Panel } from "../common/Panel";
import { StatusBadge } from "../common/StatusBadge";
import { useArchitectureStore } from "../../store/architecture-store";
import { useSimulationStore } from "../../store/simulation-store";
import { useUiStore } from "../../store/ui-store";
import { getResourceCapacityRps } from "../../domain/infrastructure/resource";
import { formatPercent, formatRps } from "../../utils/format";
import { Button } from "../common/Button";
import { createFailureScenario } from "../../data/sample-scenarios";

export function ArchitecturePanel() {
  const architectureA = useArchitectureStore((state) => state.architectureA);
  const architectureB = useArchitectureStore((state) => state.architectureB);
  const activeSlot = useUiStore((state) => state.activeSlot);
  const setActiveSlot = useUiStore((state) => state.setActiveSlot);
  const selectedResourceId = useUiStore((state) => state.selectedResourceId);
  const selectResource = useUiStore((state) => state.selectResource);
  const setScenario = useSimulationStore((state) => state.setScenario);
  const architecture = activeSlot === "b" && architectureB ? architectureB : architectureA;
  const simulation = useSimulationStore((state) =>
    activeSlot === "b" && state.stateB ? state.stateB : state.stateA,
  );

  return (
    <Panel
      title="Architecture"
      subtitle={architecture.name}
      className="h-full"
      actions={
        architectureB ? (
          <div className="flex gap-1">
            <Button variant={activeSlot === "a" ? "primary" : "ghost"} onClick={() => setActiveSlot("a")}>
              A
            </Button>
            <Button variant={activeSlot === "b" ? "primary" : "ghost"} onClick={() => setActiveSlot("b")}>
              B
            </Button>
          </div>
        ) : null
      }
    >
      <p className="mb-3 text-xs text-slate-400">
        {architecture.metadata?.provider?.toUpperCase() ?? "AWS"} · {architecture.metadata?.region ?? "n/a"} ·{" "}
        {architecture.resources.length} resources
      </p>
      <ul className="space-y-2">
        {architecture.resources.map((resource) => {
          const state = simulation.resources[resource.id];
          const selected = selectedResourceId === resource.id;
          return (
            <li key={resource.id}>
              <button
                className={`w-full rounded-md border px-3 py-2 text-left transition ${
                  selected
                    ? "border-cyan-400 bg-cyan-400/10"
                    : "border-slate-800 bg-slate-950/60 hover:border-slate-600"
                }`}
                onClick={() => selectResource(resource.id)}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-slate-100">{resource.name}</span>
                  {state ? <StatusBadge status={state.status} /> : null}
                </div>
                <div className="mt-1 flex justify-between text-[11px] text-slate-400">
                  <span>{resource.type}</span>
                  <span>
                    {state
                      ? `${formatRps(state.incomingRequestsPerSecond)} · ${formatPercent(state.utilization)}`
                      : formatRps(getResourceCapacityRps(resource))}
                  </span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
      {selectedResourceId ? (
        <Button
          className="mt-4 w-full"
          onClick={() => setScenario(createFailureScenario(selectedResourceId))}
        >
          Fail selected resource
        </Button>
      ) : null}
    </Panel>
  );
}
