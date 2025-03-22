import { describe, expect, it } from "vitest";
import { sampleArchitecture } from "../../data/sample-architecture";
import {
  resourceFailureScenario,
  sustainedGrowthScenario,
  trafficSpikeScenario,
} from "../../data/sample-scenarios";
import { getFailedResourceIds, getOfferedLoadRps } from "../../domain/simulation/scenarios";
import { stepSimulation } from "../../domain/simulation/simulation-engine";
import { BOTTLENECK_UTILIZATION } from "../../domain/simulation/types";

function run(scenario: typeof trafficSpikeScenario, time: number) {
  return stepSimulation({
    architecture: sampleArchitecture,
    scenario,
    currentTime: time,
    deltaTime: 1,
  });
}

describe("traffic spike scenario", () => {
  it("ramps from baseline to peak", () => {
    expect(getOfferedLoadRps(trafficSpikeScenario, 0)).toBe(10_000);
    expect(getOfferedLoadRps(trafficSpikeScenario, 5)).toBe(55_000);
    expect(getOfferedLoadRps(trafficSpikeScenario, 10)).toBe(100_000);
    expect(getOfferedLoadRps(trafficSpikeScenario, 40)).toBe(100_000);
  });

  it("propagates traffic through the graph", () => {
    const state = run(trafficSpikeScenario, 0);
    expect(state.resources.cloudfront?.incomingRequestsPerSecond).toBe(10_000);
    expect(state.resources.alb?.incomingRequestsPerSecond).toBeGreaterThan(0);
    expect(state.resources.ecs?.incomingRequestsPerSecond).toBeGreaterThan(0);
    expect(state.connections["cloudfront-alb"]?.requestsPerSecond).toBeGreaterThan(0);
  });

  it("saturates RDS as traffic reaches the peak", () => {
    const early = run(trafficSpikeScenario, 0);
    const peak = run(trafficSpikeScenario, 20);
    expect(peak.resources.ecs?.utilization ?? 0).toBeGreaterThan(early.resources.ecs?.utilization ?? 0);
    expect(peak.resources.rds?.utilization ?? 0).toBeGreaterThanOrEqual(BOTTLENECK_UTILIZATION);
    expect(peak.metrics.averageLatencyMs).toBeGreaterThan(early.metrics.averageLatencyMs);
    expect(peak.metrics.p95LatencyMs).toBeGreaterThan(peak.metrics.averageLatencyMs);
    expect(peak.metrics.errorRate).toBeGreaterThan(early.metrics.errorRate);
    expect(peak.bottlenecks.some((item) => item.resourceId === "rds")).toBe(true);
  });
});

describe("resource failure scenario", () => {
  it("marks the selected resource failed after the failure time", () => {
    expect(getFailedResourceIds(resourceFailureScenario, 19).has("rds")).toBe(false);
    expect(getFailedResourceIds(resourceFailureScenario, 20).has("rds")).toBe(true);

    const before = run(resourceFailureScenario, 19);
    const after = run(resourceFailureScenario, 20);

    expect(before.resources.rds?.status).not.toBe("failed");
    expect(after.resources.rds?.status).toBe("failed");
    expect(after.resources.rds?.errorRate).toBe(1);
    expect(after.resources.rds?.outgoingRequestsPerSecond).toBe(0);
    expect(after.metrics.errorRate).toBeGreaterThan(before.metrics.errorRate);
    expect(after.metrics.throughput).toBeLessThan(before.metrics.throughput);
    expect(after.resources.ecs?.errorRate ?? 0).toBeGreaterThan(before.resources.ecs?.errorRate ?? 0);
  });
});

describe("sustained growth scenario", () => {
  it("grows five percent every ten seconds", () => {
    expect(getOfferedLoadRps(sustainedGrowthScenario, 0)).toBe(10_000);
    expect(getOfferedLoadRps(sustainedGrowthScenario, 10)).toBeCloseTo(10_500);
    expect(getOfferedLoadRps(sustainedGrowthScenario, 20)).toBeCloseTo(11_025);
  });

  it("progressively increases utilization", () => {
    const start = run(sustainedGrowthScenario, 0);
    const later = run(sustainedGrowthScenario, 110);
    expect(later.metrics.offeredLoadRps).toBeGreaterThan(start.metrics.offeredLoadRps);
    expect(later.resources.rds?.utilization ?? 0).toBeGreaterThan(start.resources.rds?.utilization ?? 0);
  });
});

describe("bottleneck detection", () => {
  it("flags resources at or above 85% utilization", () => {
    const state = run(trafficSpikeScenario, 25);
    for (const bottleneck of state.bottlenecks) {
      expect(bottleneck.utilization).toBeGreaterThanOrEqual(0.85);
      expect(bottleneck.reason.length).toBeGreaterThan(0);
    }
    expect(state.bottlenecks.length).toBeGreaterThan(0);
  });
});
