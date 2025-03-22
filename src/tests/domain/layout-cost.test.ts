import { describe, expect, it } from "vitest";
import { ArchitectureLayoutEngine } from "../../domain/infrastructure/layout-engine";
import { sampleArchitecture } from "../../data/sample-architecture";
import { MockCostEngine } from "../../domain/cost/cost-engine";
import { compareArchitectures } from "../../domain/simulation/comparison";
import { sampleArchitectureWithoutCache } from "../../data/sample-architecture";
import { trafficSpikeScenario } from "../../data/sample-scenarios";

describe("layout engine", () => {
  it("assigns positions without mutating the model", () => {
    const snapshot = JSON.stringify(sampleArchitecture);
    const layout = new ArchitectureLayoutEngine().layout(sampleArchitecture);
    expect(Object.keys(layout)).toHaveLength(sampleArchitecture.resources.length);
    expect(layout.cloudfront?.y).toBeGreaterThan(layout.alb?.y ?? 0);
    expect(layout.redis?.x).not.toBe(layout.rds?.x);
    expect(JSON.stringify(sampleArchitecture)).toBe(snapshot);
  });
});

describe("cost engine", () => {
  it("projects demo pricing independently of simulation", () => {
    const cost = new MockCostEngine().estimate(sampleArchitecture);
    expect(cost.currentEstimatedCostPerHour).toBeGreaterThan(0);
    expect(cost.projectedCostPerDay).toBeCloseTo(cost.currentEstimatedCostPerHour * 24);
    expect(cost.projectedCostPerMonth).toBeCloseTo(cost.currentEstimatedCostPerHour * 730);
  });
});

describe("architecture comparison", () => {
  it("runs the same scenario against two architectures", () => {
    const comparison = compareArchitectures(
      sampleArchitecture,
      sampleArchitectureWithoutCache,
      trafficSpikeScenario,
      30,
    );
    expect(comparison.architectureA.metrics.throughput).toBeGreaterThan(0);
    expect(comparison.architectureB.metrics.throughput).toBeGreaterThan(0);
    expect(comparison.architectureA.cost.currentEstimatedCostPerHour).toBeGreaterThan(
      comparison.architectureB.cost.currentEstimatedCostPerHour,
    );
  });
});
