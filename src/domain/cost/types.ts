export interface CostResult {
  currentEstimatedCostPerHour: number;
  projectedCostPerDay: number;
  projectedCostPerMonth: number;
  breakdown: Array<{ resourceId: string; hourly: number }>;
}

export interface CostProvider {
  estimate(architecture: import("../infrastructure/types").InfrastructureModel): CostResult;
}
