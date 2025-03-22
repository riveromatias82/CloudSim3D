import { RESOURCE_TYPES, type Resource, type ResourceType } from "./types";

export const DEFAULT_CAPACITY_RPS: Record<ResourceType, number> = {
  cloudfront: 200_000,
  alb: 100_000,
  ecs: 50_000,
  lambda: 20_000,
  sqs: 80_000,
  redis: 80_000,
  rds: 20_000,
  dynamodb: 40_000,
};

export const DEFAULT_BASE_LATENCY_MS: Record<ResourceType, number> = {
  cloudfront: 5,
  alb: 10,
  ecs: 20,
  lambda: 15,
  sqs: 8,
  redis: 3,
  rds: 30,
  dynamodb: 8,
};

export function isResourceType(value: unknown): value is ResourceType {
  return typeof value === "string" && (RESOURCE_TYPES as readonly string[]).includes(value);
}

export function getResourceCapacityRps(resource: Resource): number {
  return resource.capacity?.requestsPerSecond ?? DEFAULT_CAPACITY_RPS[resource.type];
}

export function getResourceBaseLatencyMs(resource: Resource): number {
  return resource.latency?.baseMs ?? DEFAULT_BASE_LATENCY_MS[resource.type];
}

export function cloneResource(resource: Resource, overrides: Partial<Resource> = {}): Resource {
  return {
    ...resource,
    ...overrides,
    capacity: resource.capacity ? { ...resource.capacity } : undefined,
    latency: resource.latency ? { ...resource.latency } : undefined,
    cost: resource.cost ? { ...resource.cost } : undefined,
    position: resource.position ? { ...resource.position } : undefined,
    metadata: resource.metadata ? { ...resource.metadata } : undefined,
  };
}
