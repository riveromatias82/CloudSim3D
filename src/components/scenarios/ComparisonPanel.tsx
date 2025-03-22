import { Button } from "../common/Button";
import { useArchitectureStore } from "../../store/architecture-store";
import { useSimulationStore } from "../../store/simulation-store";
import { useUiStore } from "../../store/ui-store";
import { formatCurrency, formatMs, formatPercent, formatRps } from "../../utils/format";

export function ComparisonPanel() {
  const open = useUiStore((state) => state.comparisonOpen);
  const setComparisonOpen = useUiStore((state) => state.setComparisonOpen);
  const architectureA = useArchitectureStore((state) => state.architectureA);
  const architectureB = useArchitectureStore((state) => state.architectureB);
  const duplicateAtoB = useArchitectureStore((state) => state.duplicateAtoB);
  const loadCachelessSampleIntoB = useArchitectureStore((state) => state.loadCachelessSampleIntoB);
  const clearB = useArchitectureStore((state) => state.clearB);
  const comparison = useSimulationStore((state) => state.comparison);

  if (!open) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-lg border border-slate-700 bg-slate-900 p-5 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">What-if comparison</h2>
            <p className="text-sm text-slate-400">
              Same scenario, two architectures. Results expose trade-offs; they do not rank a winner.
            </p>
          </div>
          <Button onClick={() => setComparisonOpen(false)}>Close</Button>
        </div>
        <div className="mb-4 flex flex-wrap gap-2">
          <Button onClick={duplicateAtoB}>Duplicate A → B</Button>
          <Button onClick={loadCachelessSampleIntoB}>Load B without Redis</Button>
          <Button onClick={clearB}>Clear B</Button>
        </div>
        {!architectureB || !comparison ? (
          <p className="text-sm text-slate-400">
            Load or duplicate an architecture into slot B, then run the scenario to compare metrics.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-slate-400">
                <th className="py-2 font-medium">Metric</th>
                <th className="py-2 font-medium">{comparison.architectureA.architectureName}</th>
                <th className="py-2 font-medium">{comparison.architectureB.architectureName}</th>
              </tr>
            </thead>
            <tbody className="font-mono text-slate-100">
              <CmpRow
                label="Throughput"
                a={formatRps(comparison.architectureA.metrics.throughput)}
                b={formatRps(comparison.architectureB.metrics.throughput)}
              />
              <CmpRow
                label="Avg latency"
                a={formatMs(comparison.architectureA.metrics.averageLatencyMs)}
                b={formatMs(comparison.architectureB.metrics.averageLatencyMs)}
              />
              <CmpRow
                label="P95 latency"
                a={formatMs(comparison.architectureA.metrics.p95LatencyMs)}
                b={formatMs(comparison.architectureB.metrics.p95LatencyMs)}
              />
              <CmpRow
                label="Error rate"
                a={formatPercent(comparison.architectureA.metrics.errorRate, 1)}
                b={formatPercent(comparison.architectureB.metrics.errorRate, 1)}
              />
              <CmpRow
                label="Estimated cost / hour"
                a={formatCurrency(comparison.architectureA.cost.currentEstimatedCostPerHour)}
                b={formatCurrency(comparison.architectureB.cost.currentEstimatedCostPerHour)}
              />
            </tbody>
          </table>
        )}
        {architectureB ? (
          <p className="mt-4 text-xs text-slate-500">
            Architecture A currently shown in the 3D scene: {architectureA.name}. Use the A/B toggle to inspect the
            alternative graph.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function CmpRow({ label, a, b }: { label: string; a: string; b: string }) {
  return (
    <tr className="border-t border-slate-800">
      <td className="py-2 font-sans text-slate-300">{label}</td>
      <td className="py-2">{a}</td>
      <td className="py-2">{b}</td>
    </tr>
  );
}
