import { describe, expect, it } from "vitest";
import {
  calculateErrorRate,
  calculateLatencyMs,
  calculateOutgoingRps,
  calculateUtilization,
  statusFromUtilization,
} from "../../domain/simulation/formulas";

describe("simulation formulas", () => {
  it("calculates utilization as incoming over capacity", () => {
    expect(calculateUtilization(5000, 10000)).toBe(0.5);
    expect(calculateUtilization(20000, 20000)).toBe(1);
    expect(calculateUtilization(0, 10000)).toBe(0);
  });

  it("maps utilization bands to status", () => {
    expect(statusFromUtilization(0.4, false)).toBe("healthy");
    expect(statusFromUtilization(0.7, false)).toBe("busy");
    expect(statusFromUtilization(0.9, false)).toBe("saturated");
    expect(statusFromUtilization(1.4, false)).toBe("saturated");
    expect(statusFromUtilization(0.1, true)).toBe("failed");
  });

  it("increases latency as utilization grows", () => {
    const low = calculateLatencyMs(20, 0.2, false);
    const busy = calculateLatencyMs(20, 0.75, false);
    const saturated = calculateLatencyMs(20, 1.1, false);
    expect(busy).toBeGreaterThan(low);
    expect(saturated).toBeGreaterThan(busy);
  });

  it("keeps error rate at zero until the saturation band", () => {
    expect(calculateErrorRate(0.5, false)).toBe(0);
    expect(calculateErrorRate(0.84, false)).toBe(0);
    expect(calculateErrorRate(0.925, false)).toBeGreaterThan(0);
    expect(calculateErrorRate(1.5, false)).toBeGreaterThan(calculateErrorRate(1, false));
    expect(calculateErrorRate(0, true)).toBe(1);
  });

  it("reduces outgoing traffic by the error rate", () => {
    expect(calculateOutgoingRps(1000, 0.1)).toBe(900);
    expect(calculateOutgoingRps(1000, 1)).toBe(0);
  });
});
