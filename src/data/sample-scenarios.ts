import type { ResourceFailureScenario, SimulationScenario } from "../domain/simulation/types";

export const trafficSpikeScenario: SimulationScenario = {
  type: "traffic-spike",
  name: "Traffic Spike",
  baselineRps: 10_000,
  peakRps: 100_000,
  rampUpSeconds: 10,
  durationSeconds: 60,
};

export const resourceFailureScenario: ResourceFailureScenario = {
  type: "resource-failure",
  name: "Resource Failure",
  baselineRps: 18_000,
  failureResourceId: "rds",
  failureTimeSeconds: 20,
  durationSeconds: 60,
};

export const sustainedGrowthScenario: SimulationScenario = {
  type: "sustained-growth",
  name: "Sustained Growth",
  initialRps: 10_000,
  growthRate: 0.05,
  growthIntervalSeconds: 10,
  durationSeconds: 120,
};

export const sampleScenarios: SimulationScenario[] = [
  trafficSpikeScenario,
  resourceFailureScenario,
  sustainedGrowthScenario,
];

export function getDefaultScenario(): SimulationScenario {
  return trafficSpikeScenario;
}

export function createFailureScenario(resourceId: string): SimulationScenario {
  return {
    ...resourceFailureScenario,
    failureResourceId: resourceId,
  };
}
