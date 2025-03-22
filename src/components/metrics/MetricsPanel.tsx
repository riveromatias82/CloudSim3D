import { Panel } from "../common/Panel";
import { Sparkline } from "../common/Sparkline";
import { StatusBadge } from "../common/StatusBadge";
import { useArchitectureStore } from "../../store/architecture-store";
import { useSimulationStore } from "../../store/simulation-store";
import { formatMs, formatPercent, formatRps } from "../../utils/format";
import { defaultCostEngine } from "../../domain/cost/cost-engine";
import { formatCurrency } from "../../utils/format";

export function MetricsPanel() {
  const architecture = useArchitectureStore((state) => state.architectureA);
  const state = useSimulationStore((state) => state.stateA);
  const history = useSimulationStore((state) => state.historyA);
  const cost = defaultCostEngine.estimate(architecture);

  return (
    <Panel
      title="Metrics"
      subtitle="Simulation results, not AWS production diagnostics"
      className="h-full"
    >
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          label="Requests / sec"
          value={formatRps(state.metrics.throughput)}
          values={history.map((item) => item.throughput)}
        />
        <MetricCard
          label="Average latency"
          value={formatMs(state.metrics.averageLatencyMs)}
          values={history.map((item) => item.averageLatencyMs)}
          color="#818cf8"
        />
        <MetricCard
          label="P95 latency"
          value={formatMs(state.metrics.p95LatencyMs)}
          values={history.map((item) => item.p95LatencyMs)}
          color="#fbbf24"
        />
        <MetricCard
          label="Error rate"
          value={formatPercent(state.metrics.errorRate, 1)}
          values={history.map((item) => item.errorRate)}
          color="#fb7185"
        />
      </div>

      <div className="mt-5">
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          Resource metrics
        </h3>
        <div className="overflow-hidden rounded-md border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400">
              <tr>
                <th className="px-3 py-2 font-medium">Resource</th>
                <th className="px-3 py-2 font-medium">Util</th>
                <th className="px-3 py-2 font-medium">Latency</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {architecture.resources.map((resource) => {
                const row = state.resources[resource.id];
                return (
                  <tr key={resource.id} className="border-t border-slate-800">
                    <td className="px-3 py-2 text-slate-100">{resource.name}</td>
                    <td className="px-3 py-2 font-mono">{formatPercent(row?.utilization ?? 0)}</td>
                    <td className="px-3 py-2 font-mono">{formatMs(row?.latencyMs ?? 0)}</td>
                    <td className="px-3 py-2">{row ? <StatusBadge status={row.status} /> : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-5 rounded-md border border-slate-800 bg-slate-950/70 p-3">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          Cost estimate
        </h3>
        <p className="mt-1 text-xs text-amber-200/80">Demo pricing model · simulation estimate</p>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <CostStat label="Hour" value={formatCurrency(cost.currentEstimatedCostPerHour)} />
          <CostStat label="Day" value={formatCurrency(cost.projectedCostPerDay)} />
          <CostStat label="Month" value={formatCurrency(cost.projectedCostPerMonth)} />
        </div>
      </div>
    </Panel>
  );
}

function MetricCard({
  label,
  value,
  values,
  color,
}: {
  label: string;
  value: string;
  values: number[];
  color?: string;
}) {
  return (
    <div className="rounded-md border border-slate-800 bg-slate-950/70 p-3">
      <p className="text-[11px] uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 font-mono text-lg text-slate-50">{value}</p>
      <Sparkline values={values} color={color} />
    </div>
  );
}

function CostStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-slate-400">{label}</p>
      <p className="font-mono text-sm text-slate-100">{value}</p>
    </div>
  );
}
