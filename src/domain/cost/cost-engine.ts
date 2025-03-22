import type { ResourceType } from "../infrastructure/types";
import type { InfrastructureModel } from "../infrastructure/types";
import type { CostProvider, CostResult } from "./types";

export const DEMO_HOURLY_RATES: Record<ResourceType, number> = {
  cloudfront: 0.48,
  alb: 0.027,
  ecs: 0.16,
  lambda: 0.04,
  sqs: 0.018,
  redis: 0.09,
  rds: 0.22,
  dynamodb: 0.11,
};

export class MockCostEngine implements CostProvider {
  estimate(architecture: InfrastructureModel): CostResult {
    const breakdown = architecture.resources.map((resource) => ({
      resourceId: resource.id,
      hourly: resource.cost?.hourly ?? DEMO_HOURLY_RATES[resource.type],
    }));

    const currentEstimatedCostPerHour = breakdown.reduce((sum, item) => sum + item.hourly, 0);

    return {
      currentEstimatedCostPerHour,
      projectedCostPerDay: currentEstimatedCostPerHour * 24,
      projectedCostPerMonth: currentEstimatedCostPerHour * 730,
      breakdown,
    };
  }
}

export const defaultCostEngine = new MockCostEngine();
