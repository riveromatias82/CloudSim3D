import type { Resource } from "../../domain/infrastructure/types";
import type { ResourceHealthStatus, ResourceSimulationState } from "../../domain/simulation/types";
import { clamp } from "../../utils/math";

export interface ResourceVisualState {
  baseColor: string;
  statusColor: string;
  emissiveIntensity: number;
  scale: number;
  pulseSpeed: number;
  opacity: number;
  particleDensity: number;
  labelEmphasis: number;
  status: ResourceHealthStatus;
}

const TYPE_COLORS: Record<Resource["type"], string> = {
  cloudfront: "#7dd3fc",
  alb: "#38bdf8",
  ecs: "#818cf8",
  lambda: "#c084fc",
  sqs: "#fbbf24",
  redis: "#fb7185",
  rds: "#34d399",
  dynamodb: "#22d3ee",
};

const STATUS_COLORS: Record<ResourceHealthStatus, string> = {
  healthy: "#34d399",
  busy: "#fbbf24",
  saturated: "#fb923c",
  failed: "#f43f5e",
};

export function getTypeColor(type: Resource["type"]): string {
  return TYPE_COLORS[type];
}

export function getStatusColor(status: ResourceHealthStatus): string {
  return STATUS_COLORS[status];
}

export function getResourceVisualState(
  resource: Resource,
  simulation?: ResourceSimulationState,
): ResourceVisualState {
  const status = simulation?.status ?? "healthy";
  const utilization = simulation?.utilization ?? 0;

  switch (status) {
    case "failed":
      return {
        baseColor: TYPE_COLORS[resource.type],
        statusColor: STATUS_COLORS.failed,
        emissiveIntensity: 0.08,
        scale: 0.88,
        pulseSpeed: 0,
        opacity: 0.45,
        particleDensity: 0,
        labelEmphasis: 1.15,
        status,
      };
    case "saturated":
      return {
        baseColor: TYPE_COLORS[resource.type],
        statusColor: STATUS_COLORS.saturated,
        emissiveIntensity: 1.35 + clamp(utilization - 0.85, 0, 1),
        scale: 1.14,
        pulseSpeed: 3.2,
        opacity: 1,
        particleDensity: 1,
        labelEmphasis: 1.2,
        status,
      };
    case "busy":
      return {
        baseColor: TYPE_COLORS[resource.type],
        statusColor: STATUS_COLORS.busy,
        emissiveIntensity: 0.7,
        scale: 1.06,
        pulseSpeed: 1.6,
        opacity: 1,
        particleDensity: 0.7,
        labelEmphasis: 1.08,
        status,
      };
    default:
      return {
        baseColor: TYPE_COLORS[resource.type],
        statusColor: STATUS_COLORS.healthy,
        emissiveIntensity: 0.22 + utilization * 0.4,
        scale: 1 + utilization * 0.05,
        pulseSpeed: utilization > 0 ? 0.6 : 0,
        opacity: 1,
        particleDensity: clamp(utilization, 0.08, 0.45),
        labelEmphasis: 1,
        status,
      };
  }
}
