import { sampleArchitecture } from "../data/sample-architecture";
import { getDefaultScenario } from "../data/sample-scenarios";
import { compareArchitectures, type ComparisonResult } from "../domain/simulation/comparison";
import type { InfrastructureModel } from "../domain/infrastructure/types";
import { createIdleSimulationState, simulationEngine } from "../domain/simulation/simulation-engine";
import { getScenarioDuration } from "../domain/simulation/scenarios";
import type { SimulationMetrics, SimulationScenario, SimulationState } from "../domain/simulation/types";
import { create } from "zustand";

export const SIMULATION_SPEEDS = [0.5, 1, 2, 5, 10] as const;
export type SimulationSpeed = (typeof SIMULATION_SPEEDS)[number];

export interface MetricSample {
  time: number;
  throughput: number;
  averageLatencyMs: number;
  p95LatencyMs: number;
  errorRate: number;
}

interface SimulationStore {
  scenario: SimulationScenario;
  isPlaying: boolean;
  speed: SimulationSpeed;
  currentTime: number;
  stateA: SimulationState;
  stateB: SimulationState | null;
  comparison: ComparisonResult | null;
  historyA: MetricSample[];
  historyB: MetricSample[];
  setScenario: (scenario: SimulationScenario) => void;
  play: () => void;
  pause: () => void;
  restart: (architectureA: InfrastructureModel, architectureB: InfrastructureModel | null) => void;
  seek: (time: number, architectureA: InfrastructureModel, architectureB: InfrastructureModel | null) => void;
  setSpeed: (speed: SimulationSpeed) => void;
  tick: (
    realDeltaSeconds: number,
    architectureA: InfrastructureModel,
    architectureB: InfrastructureModel | null,
  ) => void;
  syncArchitectures: (architectureA: InfrastructureModel, architectureB: InfrastructureModel | null) => void;
}

const HISTORY_LIMIT = 90;

function evaluate(
  architecture: InfrastructureModel,
  scenario: SimulationScenario,
  currentTime: number,
): SimulationState {
  return simulationEngine.step({
    architecture,
    scenario,
    currentTime,
    deltaTime: 0,
  });
}

function pushHistory(history: MetricSample[], time: number, metrics: SimulationMetrics): MetricSample[] {
  const next = [...history, { time, ...metrics }];
  return next.length > HISTORY_LIMIT ? next.slice(next.length - HISTORY_LIMIT) : next;
}

function evaluatePair(
  architectureA: InfrastructureModel,
  architectureB: InfrastructureModel | null,
  scenario: SimulationScenario,
  currentTime: number,
  historyA: MetricSample[],
  historyB: MetricSample[],
  recordHistory: boolean,
): Pick<SimulationStore, "stateA" | "stateB" | "comparison" | "historyA" | "historyB"> {
  const stateA = evaluate(architectureA, scenario, currentTime);
  const stateB = architectureB ? evaluate(architectureB, scenario, currentTime) : null;
  const comparison = architectureB
    ? compareArchitectures(architectureA, architectureB, scenario, currentTime)
    : null;

  return {
    stateA,
    stateB,
    comparison,
    historyA: recordHistory ? pushHistory(historyA, currentTime, stateA.metrics) : historyA,
    historyB: recordHistory && stateB ? pushHistory(historyB, currentTime, stateB.metrics) : architectureB ? historyB : [],
  };
}

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  scenario: getDefaultScenario(),
  isPlaying: false,
  speed: 1,
  currentTime: 0,
  stateA: createIdleSimulationState(sampleArchitecture),
  stateB: null,
  comparison: null,
  historyA: [],
  historyB: [],
  setScenario: (scenario) => {
    set({ scenario, currentTime: 0, isPlaying: false, historyA: [], historyB: [] });
  },
  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  restart: (architectureA, architectureB) => {
    const { scenario } = get();
    set({
      currentTime: 0,
      isPlaying: false,
      ...evaluatePair(architectureA, architectureB, scenario, 0, [], [], false),
    });
  },
  seek: (time, architectureA, architectureB) => {
    const { scenario } = get();
    const duration = getScenarioDuration(scenario);
    const currentTime = Math.min(duration, Math.max(0, time));
    set({
      currentTime,
      ...evaluatePair(architectureA, architectureB, scenario, currentTime, [], [], false),
      historyA: [],
      historyB: [],
    });
  },
  setSpeed: (speed) => set({ speed }),
  tick: (realDeltaSeconds, architectureA, architectureB) => {
    const { isPlaying, speed, currentTime, scenario, historyA, historyB } = get();
    if (!isPlaying) {
      return;
    }
    const duration = getScenarioDuration(scenario);
    const nextTime = Math.min(duration, currentTime + realDeltaSeconds * speed);
    set({
      currentTime: nextTime,
      isPlaying: nextTime < duration,
      ...evaluatePair(architectureA, architectureB, scenario, nextTime, historyA, historyB, true),
    });
  },
  syncArchitectures: (architectureA, architectureB) => {
    const { scenario, currentTime, historyA, historyB } = get();
    set(evaluatePair(architectureA, architectureB, scenario, currentTime, historyA, historyB, false));
  },
}));
