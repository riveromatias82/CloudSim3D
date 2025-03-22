import { clamp } from "../../utils/math";
import {
  BUSY_UTILIZATION_MAX,
  HEALTHY_UTILIZATION_MAX,
  SATURATED_UTILIZATION_MAX,
  type ResourceHealthStatus,
} from "./types";

export function calculateUtilization(incomingRps: number, capacityRps: number): number {
  if (capacityRps <= 0) {
    return incomingRps > 0 ? Number.POSITIVE_INFINITY : 0;
  }
  return Math.max(0, incomingRps) / capacityRps;
}

export function statusFromUtilization(
  utilization: number,
  failed: boolean,
): ResourceHealthStatus {
  if (failed) {
    return "failed";
  }
  if (utilization >= BUSY_UTILIZATION_MAX) {
    return "saturated";
  }
  if (utilization >= HEALTHY_UTILIZATION_MAX) {
    return "busy";
  }
  return "healthy";
}

export function calculateLatencyMs(baseMs: number, utilization: number, failed: boolean): number {
  if (failed) {
    return 0;
  }

  const pressure = Math.max(0, utilization);
  const linear = 0.35 * pressure;
  const busyKnee = 4 * Math.pow(Math.max(0, pressure - HEALTHY_UTILIZATION_MAX), 2);
  const overload = 12 * Math.pow(Math.max(0, pressure - SATURATED_UTILIZATION_MAX), 2);
  return baseMs * (1 + linear + busyKnee + overload);
}

export function calculateErrorRate(utilization: number, failed: boolean): number {
  if (failed) {
    return 1;
  }
  if (utilization <= BUSY_UTILIZATION_MAX) {
    return 0;
  }
  if (utilization <= SATURATED_UTILIZATION_MAX) {
    return ((utilization - BUSY_UTILIZATION_MAX) / (SATURATED_UTILIZATION_MAX - BUSY_UTILIZATION_MAX)) * 0.08;
  }
  return clamp(0.08 + (utilization - SATURATED_UTILIZATION_MAX) * 0.55, 0, 1);
}

export function calculateOutgoingRps(incomingRps: number, errorRate: number): number {
  return Math.max(0, incomingRps) * (1 - clamp(errorRate, 0, 1));
}

export function estimateP95LatencyMs(averageLatencyMs: number, peakUtilization: number): number {
  const spread = 0.18 + 0.9 * clamp(peakUtilization, 0, 2);
  return averageLatencyMs * (1 + spread);
}
