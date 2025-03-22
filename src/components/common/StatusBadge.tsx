import type { ResourceHealthStatus } from "../../domain/simulation/types";
import { getStatusColor } from "../../renderer/visuals/resource-visual-state";
import { formatStatus } from "../../utils/format";

export function StatusBadge({ status }: { status: ResourceHealthStatus }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
      style={{ backgroundColor: `${getStatusColor(status)}22`, color: getStatusColor(status) }}
    >
      {formatStatus(status)}
    </span>
  );
}
