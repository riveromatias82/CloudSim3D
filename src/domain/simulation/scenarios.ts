import type { SimulationScenario } from "./types";

export function getScenarioDuration(scenario: SimulationScenario): number {
  return scenario.durationSeconds;
}

export function getOfferedLoadRps(scenario: SimulationScenario, currentTime: number): number {
  const t = Math.max(0, currentTime);

  switch (scenario.type) {
    case "traffic-spike": {
      if (t >= scenario.rampUpSeconds) {
        return scenario.peakRps;
      }
      const progress = scenario.rampUpSeconds === 0 ? 1 : t / scenario.rampUpSeconds;
      return scenario.baselineRps + (scenario.peakRps - scenario.baselineRps) * progress;
    }
    case "resource-failure":
      return scenario.baselineRps;
    case "sustained-growth": {
      const intervals = Math.floor(t / scenario.growthIntervalSeconds);
      return scenario.initialRps * (1 + scenario.growthRate) ** intervals;
    }
    default: {
      const exhaustive: never = scenario;
      return exhaustive;
    }
  }
}

export function getFailedResourceIds(
  scenario: SimulationScenario,
  currentTime: number,
): ReadonlySet<string> {
  if (scenario.type !== "resource-failure") {
    return new Set();
  }
  if (currentTime < scenario.failureTimeSeconds) {
    return new Set();
  }
  return new Set([scenario.failureResourceId]);
}

export function getScenarioEntryResourceId(scenario: SimulationScenario): string | undefined {
  return scenario.entryResourceId;
}
