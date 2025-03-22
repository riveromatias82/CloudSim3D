import { getEntryResourceIds, getResourceMap } from "../infrastructure/architecture";
import { getConnectionWeight } from "../infrastructure/connection";
import { getResourceBaseLatencyMs, getResourceCapacityRps } from "../infrastructure/resource";
import type { Connection, InfrastructureModel, Resource } from "../infrastructure/types";
import { weightedAverage } from "../../utils/math";
import {
  BOTTLENECK_UTILIZATION,
  type Bottleneck,
  type ConnectionSimulationState,
  type ResourceSimulationState,
  type SimulationInput,
  type SimulationMetrics,
  type SimulationState,
} from "./types";
import {
  calculateErrorRate,
  calculateLatencyMs,
  calculateOutgoingRps,
  calculateUtilization,
  estimateP95LatencyMs,
  statusFromUtilization,
} from "./formulas";
import { getFailedResourceIds, getOfferedLoadRps, getScenarioEntryResourceId } from "./scenarios";

interface GraphEdge {
  connection: Connection;
  weight: number;
}

function buildGraph(architecture: InfrastructureModel): {
  outgoing: Map<string, GraphEdge[]>;
  incoming: Map<string, string[]>;
  order: string[];
} {
  const outgoing = new Map<string, GraphEdge[]>();
  const incoming = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  for (const resource of architecture.resources) {
    outgoing.set(resource.id, []);
    incoming.set(resource.id, []);
    inDegree.set(resource.id, 0);
  }

  for (const connection of architecture.connections) {
    const edge: GraphEdge = { connection, weight: getConnectionWeight(connection) };
    outgoing.get(connection.sourceId)?.push(edge);
    incoming.get(connection.targetId)?.push(connection.sourceId);
    inDegree.set(connection.targetId, (inDegree.get(connection.targetId) ?? 0) + 1);
  }

  const order: string[] = [];
  const queue = architecture.resources
    .filter((resource) => (inDegree.get(resource.id) ?? 0) === 0)
    .map((resource) => resource.id);

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      break;
    }
    order.push(current);
    for (const edge of outgoing.get(current) ?? []) {
      const nextDegree = (inDegree.get(edge.connection.targetId) ?? 1) - 1;
      inDegree.set(edge.connection.targetId, nextDegree);
      if (nextDegree === 0) {
        queue.push(edge.connection.targetId);
      }
    }
  }

  for (const resource of architecture.resources) {
    if (!order.includes(resource.id)) {
      order.push(resource.id);
    }
  }

  return { outgoing, incoming, order };
}

function detectBottlenecks(
  architecture: InfrastructureModel,
  resources: Record<string, ResourceSimulationState>,
): Bottleneck[] {
  return architecture.resources
    .map((resource) => resources[resource.id])
    .filter((state): state is ResourceSimulationState => Boolean(state))
    .filter((state) => state.status !== "failed" && state.utilization >= BOTTLENECK_UTILIZATION)
    .sort((a, b) => b.utilization - a.utilization)
    .map((state) => {
      const reasons: string[] = [];
      if (state.utilization >= 1) {
        reasons.push("Offered load exceeds simulated capacity");
      } else {
        reasons.push("High utilization");
      }
      if (state.latencyMs >= 80) {
        reasons.push("High latency contribution");
      }
      if (state.errorRate > 0) {
        reasons.push("Elevated simulated error rate");
      }
      return {
        resourceId: state.resourceId,
        utilization: state.utilization,
        reason: reasons.join(". "),
      };
    });
}

function estimatePathLatency(
  leafId: string,
  resources: Record<string, ResourceSimulationState>,
  incoming: Map<string, string[]>,
): number {
  const visited = new Set<string>();
  const walk = (id: string): number => {
    if (visited.has(id)) {
      return resources[id]?.latencyMs ?? 0;
    }
    visited.add(id);
    const parents = incoming.get(id) ?? [];
    const parentLatency =
      parents.length === 0 ? 0 : Math.max(...parents.map((parentId) => walk(parentId)));
    return parentLatency + (resources[id]?.latencyMs ?? 0);
  };
  return walk(leafId);
}

function computeMetrics(
  architecture: InfrastructureModel,
  resources: Record<string, ResourceSimulationState>,
  offeredLoadRps: number,
  outgoing: Map<string, GraphEdge[]>,
  incoming: Map<string, string[]>,
): SimulationMetrics {
  const leafIds = architecture.resources
    .filter((resource) => (outgoing.get(resource.id) ?? []).length === 0)
    .map((resource) => resource.id);

  const throughput = leafIds.reduce((sum, id) => {
    const state = resources[id];
    return sum + (state?.outgoingRequestsPerSecond ?? 0);
  }, 0);

  const pathLatencies = leafIds
    .map((leafId) => {
      const state = resources[leafId];
      if (!state || state.status === "failed") {
        return null;
      }
      return {
        value: estimatePathLatency(leafId, resources, incoming),
        weight: Math.max(state.incomingRequestsPerSecond, 0.0001),
      };
    })
    .filter((item): item is { value: number; weight: number } => item !== null);

  const averageLatencyMs = pathLatencies.length > 0 ? weightedAverage(pathLatencies) : 0;
  const peakUtilization = Math.max(
    0,
    ...architecture.resources.map((resource) => resources[resource.id]?.utilization ?? 0),
  );
  const errorRate = offeredLoadRps <= 0 ? 0 : Math.max(0, offeredLoadRps - throughput) / offeredLoadRps;

  return {
    throughput,
    offeredLoadRps,
    averageLatencyMs,
    p95LatencyMs: estimateP95LatencyMs(averageLatencyMs, peakUtilization),
    errorRate,
  };
}

export function createIdleSimulationState(
  architecture: InfrastructureModel,
  currentTime = 0,
): SimulationState {
  const resources: Record<string, ResourceSimulationState> = {};
  const connections: Record<string, ConnectionSimulationState> = {};

  for (const resource of architecture.resources) {
    resources[resource.id] = {
      resourceId: resource.id,
      incomingRequestsPerSecond: 0,
      outgoingRequestsPerSecond: 0,
      utilization: 0,
      latencyMs: getResourceBaseLatencyMs(resource),
      errorRate: 0,
      status: "healthy",
    };
  }

  for (const connection of architecture.connections) {
    connections[connection.id] = {
      connectionId: connection.id,
      requestsPerSecond: 0,
      utilization: 0,
      latencyMs: connection.latencyMs ?? 1,
    };
  }

  return {
    currentTime,
    resources,
    connections,
    metrics: {
      throughput: 0,
      offeredLoadRps: 0,
      averageLatencyMs: 0,
      p95LatencyMs: 0,
      errorRate: 0,
    },
    bottlenecks: [],
  };
}

export function stepSimulation(input: SimulationInput): SimulationState {
  const { architecture, scenario, currentTime } = input;
  if (architecture.resources.length === 0) {
    return createIdleSimulationState(architecture, currentTime);
  }

  const resourceMap = getResourceMap(architecture);
  const failedIds = getFailedResourceIds(scenario, currentTime);
  const offeredLoadRps = getOfferedLoadRps(scenario, currentTime);
  const { outgoing, incoming, order } = buildGraph(architecture);
  const incomingRps = new Map<string, number>();
  const resources: Record<string, ResourceSimulationState> = {};
  const connections: Record<string, ConnectionSimulationState> = {};

  for (const resource of architecture.resources) {
    incomingRps.set(resource.id, 0);
  }

  const configuredEntry = getScenarioEntryResourceId(scenario);
  const entryIds = (configuredEntry ? [configuredEntry] : getEntryResourceIds(architecture)).filter((id) =>
    resourceMap.has(id),
  );
  const perEntry = entryIds.length === 0 ? 0 : offeredLoadRps / entryIds.length;
  for (const entryId of entryIds) {
    incomingRps.set(entryId, perEntry);
  }

  for (const resourceId of order) {
    const resource = resourceMap.get(resourceId);
    if (!resource) {
      continue;
    }

    const state = simulateResource(resource, incomingRps.get(resourceId) ?? 0, failedIds.has(resourceId));
    const edges = outgoing.get(resourceId) ?? [];
    const totalWeight = edges.reduce((sum, edge) => sum + edge.weight, 0);
    const failedShare = edges.reduce((sum, edge) => {
      return failedIds.has(edge.connection.targetId)
        ? sum + (totalWeight === 0 ? 0 : edge.weight / totalWeight)
        : sum;
    }, 0);

    if (failedShare > 0 && state.status !== "failed") {
      state.errorRate = 1 - (1 - state.errorRate) * (1 - failedShare);
      state.outgoingRequestsPerSecond = calculateOutgoingRps(state.incomingRequestsPerSecond, state.errorRate);
      state.latencyMs += 120 * failedShare;
    }

    resources[resourceId] = state;

    for (const edge of edges) {
      const share = totalWeight === 0 ? 0 : edge.weight / totalWeight;
      const intended = state.outgoingRequestsPerSecond * share;
      incomingRps.set(
        edge.connection.targetId,
        (incomingRps.get(edge.connection.targetId) ?? 0) + intended,
      );

      const capacity = edge.connection.capacity?.requestsPerSecond;
      connections[edge.connection.id] = {
        connectionId: edge.connection.id,
        requestsPerSecond: intended,
        utilization: capacity ? intended / capacity : 0,
        latencyMs: edge.connection.latencyMs ?? 1,
      };
    }
  }

  for (const connection of architecture.connections) {
    if (!connections[connection.id]) {
      connections[connection.id] = {
        connectionId: connection.id,
        requestsPerSecond: 0,
        utilization: 0,
        latencyMs: connection.latencyMs ?? 1,
      };
    }
  }

  return {
    currentTime,
    resources,
    connections,
    metrics: computeMetrics(architecture, resources, offeredLoadRps, outgoing, incoming),
    bottlenecks: detectBottlenecks(architecture, resources),
  };
}

function simulateResource(
  resource: Resource,
  incomingRequestsPerSecond: number,
  failed: boolean,
): ResourceSimulationState {
  const capacity = getResourceCapacityRps(resource);
  const utilization = failed ? 0 : calculateUtilization(incomingRequestsPerSecond, capacity);
  const errorRate = calculateErrorRate(utilization, failed);
  const latencyMs = calculateLatencyMs(getResourceBaseLatencyMs(resource), utilization, failed);

  return {
    resourceId: resource.id,
    incomingRequestsPerSecond,
    outgoingRequestsPerSecond: failed ? 0 : calculateOutgoingRps(incomingRequestsPerSecond, errorRate),
    utilization,
    latencyMs,
    errorRate,
    status: statusFromUtilization(utilization, failed),
  };
}

export class SimulationEngine {
  step(input: SimulationInput): SimulationState {
    return stepSimulation(input);
  }
}

export const simulationEngine = new SimulationEngine();
