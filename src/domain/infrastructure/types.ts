export const RESOURCE_TYPES = [
  "cloudfront",
  "alb",
  "ecs",
  "lambda",
  "sqs",
  "redis",
  "rds",
  "dynamodb",
] as const;

export type ResourceType = (typeof RESOURCE_TYPES)[number];

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface ResourceCapacity {
  requestsPerSecond?: number;
  concurrentRequests?: number;
}

export interface ResourceLatency {
  baseMs: number;
}

export interface ResourceCost {
  hourly: number;
}

export interface Resource {
  id: string;
  type: ResourceType;
  name: string;
  position?: Vec3;
  capacity?: ResourceCapacity;
  latency?: ResourceLatency;
  cost?: ResourceCost;
  metadata?: Record<string, unknown>;
}

export interface ConnectionCapacity {
  requestsPerSecond?: number;
}

export interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  capacity?: ConnectionCapacity;
  latencyMs?: number;
  weight?: number;
}

export interface ArchitectureMetadata {
  provider?: string;
  region?: string;
}

export interface InfrastructureModel {
  id: string;
  name: string;
  resources: Resource[];
  connections: Connection[];
  metadata?: ArchitectureMetadata;
}

export interface ValidationIssue {
  path: string;
  message: string;
}

export type ValidationResult =
  | { ok: true; value: InfrastructureModel }
  | { ok: false; issues: ValidationIssue[] };
