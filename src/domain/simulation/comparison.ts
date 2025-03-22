import type { InfrastructureModel } from "../infrastructure/types";
import { defaultCostEngine } from "../cost/cost-engine";
import type { CostResult } from "../cost/types";
import { stepSimulation } from "./simulation-engine";
import type { SimulationMetrics, SimulationScenario, SimulationState } from "./types";

export interface ArchitectureRunResult {
  architectureId: string;
  architectureName: string;
  metrics: SimulationMetrics;
  cost: CostResult;
  bottlenecks: SimulationState["bottlenecks"];
  state: SimulationState;
}

export interface ComparisonResult {
  scenario: SimulationScenario;
  currentTime: number;
  architectureA: ArchitectureRunResult;
  architectureB: ArchitectureRunResult;
}

export function runArchitectureScenario(
  architecture: InfrastructureModel,
  scenario: SimulationScenario,
  currentTime: number,
): ArchitectureRunResult {
  const state = stepSimulation({
    architecture,
    scenario,
    currentTime,
    deltaTime: 0,
  });

  return {
    architectureId: architecture.id,
    architectureName: architecture.name,
    metrics: state.metrics,
    cost: defaultCostEngine.estimate(architecture),
    bottlenecks: state.bottlenecks,
    state,
  };
}

export function compareArchitectures(
  architectureA: InfrastructureModel,
  architectureB: InfrastructureModel,
  scenario: SimulationScenario,
  currentTime: number,
): ComparisonResult {
  return {
    scenario,
    currentTime,
    architectureA: runArchitectureScenario(architectureA, scenario, currentTime),
    architectureB: runArchitectureScenario(architectureB, scenario, currentTime),
  };
}
