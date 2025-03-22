import { useRef } from "react";
import { Button } from "../common/Button";
import { useArchitectureStore } from "../../store/architecture-store";
import { useSimulationStore } from "../../store/simulation-store";
import { useUiStore } from "../../store/ui-store";
import { createFailureScenario, sampleScenarios } from "../../data/sample-scenarios";
import { getScenarioDuration } from "../../domain/simulation/scenarios";

export function TopBar() {
  const fileRef = useRef<HTMLInputElement>(null);
  const architectureA = useArchitectureStore((state) => state.architectureA);
  const architectureB = useArchitectureStore((state) => state.architectureB);
  const loadSample = useArchitectureStore((state) => state.loadSample);
  const importJson = useArchitectureStore((state) => state.importJson);
  const importTarget = useUiStore((state) => state.importTarget);
  const setImportTarget = useUiStore((state) => state.setImportTarget);
  const resetCamera = useUiStore((state) => state.resetCamera);
  const setComparisonOpen = useUiStore((state) => state.setComparisonOpen);
  const scenario = useSimulationStore((state) => state.scenario);
  const setScenario = useSimulationStore((state) => state.setScenario);
  const play = useSimulationStore((state) => state.play);
  const isPlaying = useSimulationStore((state) => state.isPlaying);
  const restart = useSimulationStore((state) => state.restart);
  const selectedResourceId = useUiStore((state) => state.selectedResourceId);

  const onImport = async (file: File | undefined) => {
    if (!file) {
      return;
    }
    const text = await file.text();
    const ok = importJson(text, importTarget);
    if (ok) {
      restart(
        importTarget === "a" ? useArchitectureStore.getState().architectureA : architectureA,
        importTarget === "b" ? useArchitectureStore.getState().architectureB : architectureB,
      );
    }
  };

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 bg-slate-950/90 px-4 py-3">
      <div>
        <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-400">CloudSim3D</p>
        <h1 className="text-lg font-semibold text-slate-100">AWS Infrastructure Simulator</h1>
        <p className="text-xs text-slate-400">Import an architecture, simulate scenarios, observe system behavior.</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={(event) => {
            void onImport(event.target.files?.[0]);
            event.currentTarget.value = "";
          }}
        />
        <select
          value={importTarget}
          onChange={(event) => setImportTarget(event.target.value === "b" ? "b" : "a")}
          className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-200"
        >
          <option value="a">Import into A</option>
          <option value="b">Import into B</option>
        </select>
        <Button onClick={() => fileRef.current?.click()}>Import Architecture</Button>
        <Button
          onClick={() => {
            loadSample("a");
            restart(useArchitectureStore.getState().architectureA, useArchitectureStore.getState().architectureB);
          }}
        >
          Load Sample Architecture
        </Button>
        <select
          value={scenario.type}
          onChange={(event) => {
            const next = sampleScenarios.find((item) => item.type === event.target.value);
            if (!next) {
              return;
            }
            if (next.type === "resource-failure") {
              setScenario(createFailureScenario(selectedResourceId ?? next.failureResourceId));
            } else {
              setScenario(next);
            }
          }}
          className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm text-slate-200"
        >
          {sampleScenarios.map((item) => (
            <option key={item.type} value={item.type}>
              {item.name}
            </option>
          ))}
        </select>
        <Button
          variant="primary"
          onClick={() => {
            const current = useSimulationStore.getState().currentTime;
            const duration = getScenarioDuration(scenario);
            if (!isPlaying && (current === 0 || current >= duration)) {
              restart(architectureA, architectureB);
            }
            play();
          }}
        >
          Start Simulation
        </Button>
        <Button onClick={resetCamera}>Reset View</Button>
        <Button onClick={() => setComparisonOpen(true)}>Compare</Button>
      </div>
    </header>
  );
}
