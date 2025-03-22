export type ResourceHealthStatus = "healthy" | "busy" | "saturated" | "failed";

export interface ResourceSimulationState {
  resourceId: string;
  incomingRequestsPerSecond: number;
  outgoingRequestsPerSecond: number;
  utilization: number;
  latencyMs: number;
  errorRate: number;
  status: ResourceHealthStatus;
}

export interface ConnectionSimulationState {
  connectionId: string;
  requestsPerSecond: number;
  utilization: number;
  latencyMs: number;
}

export interface SimulationMetrics {
  throughput: number;
  offeredLoadRps: number;
  averageLatencyMs: number;
  p95LatencyMs: number;
  errorRate: number;
}

export interface Bottleneck {
  resourceId: string;
  utilization: number;
  reason: string;
}

export interface SimulationState {
  currentTime: number;
  resources: Record<string, ResourceSimulationState>;
  connections: Record<string, ConnectionSimulationState>;
  metrics: SimulationMetrics;
  bottlenecks: Bottleneck[];
}

export interface TrafficSpikeScenario {
  type: "traffic-spike";
  name: string;
  baselineRps: number;
  peakRps: number;
  rampUpSeconds: number;
  durationSeconds: number;
  entryResourceId?: string;
}

export interface ResourceFailureScenario {
  type: "resource-failure";
  name: string;
  baselineRps: number;
  failureResourceId: string;
  failureTimeSeconds: number;
  durationSeconds: number;
  entryResourceId?: string;
}

export interface SustainedGrowthScenario {
  type: "sustained-growth";
  name: string;
  initialRps: number;
  growthRate: number;
  growthIntervalSeconds: number;
  durationSeconds: number;
  entryResourceId?: string;
}

export type SimulationScenario =
  | TrafficSpikeScenario
  | ResourceFailureScenario
  | SustainedGrowthScenario;

export interface SimulationInput {
  architecture: import("../infrastructure/types").InfrastructureModel;
  scenario: SimulationScenario;
  deltaTime: number;
  currentTime: number;
}

export const HEALTHY_UTILIZATION_MAX = 0.6;
export const BUSY_UTILIZATION_MAX = 0.85;
export const SATURATED_UTILIZATION_MAX = 1;
export const BOTTLENECK_UTILIZATION = 0.85;
