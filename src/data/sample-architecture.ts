import type { InfrastructureModel } from "../domain/infrastructure/types";

export const sampleArchitecture: InfrastructureModel = {
  id: "demo-architecture",
  name: "E-commerce Platform",
  metadata: {
    provider: "aws",
    region: "us-east-1",
  },
  resources: [
    {
      id: "cloudfront",
      type: "cloudfront",
      name: "CloudFront",
      capacity: { requestsPerSecond: 200000 },
      latency: { baseMs: 5 },
      cost: { hourly: 0.48 },
    },
    {
      id: "alb",
      type: "alb",
      name: "ALB",
      capacity: { requestsPerSecond: 100000 },
      latency: { baseMs: 10 },
      cost: { hourly: 0.027 },
    },
    {
      id: "ecs",
      type: "ecs",
      name: "ECS",
      capacity: { requestsPerSecond: 50000 },
      latency: { baseMs: 20 },
      cost: { hourly: 0.16 },
    },
    {
      id: "redis",
      type: "redis",
      name: "Redis",
      capacity: { requestsPerSecond: 80000 },
      latency: { baseMs: 3 },
      cost: { hourly: 0.09 },
    },
    {
      id: "rds",
      type: "rds",
      name: "RDS",
      capacity: { requestsPerSecond: 20000 },
      latency: { baseMs: 30 },
      cost: { hourly: 0.22 },
    },
  ],
  connections: [
    { id: "cloudfront-alb", sourceId: "cloudfront", targetId: "alb" },
    { id: "alb-ecs", sourceId: "alb", targetId: "ecs" },
    { id: "ecs-redis", sourceId: "ecs", targetId: "redis", weight: 1 },
    { id: "ecs-rds", sourceId: "ecs", targetId: "rds", weight: 1 },
  ],
};

export const sampleArchitectureWithoutCache: InfrastructureModel = {
  id: "demo-architecture-b",
  name: "E-commerce Platform (no cache)",
  metadata: {
    provider: "aws",
    region: "us-east-1",
  },
  resources: [
    {
      id: "cloudfront",
      type: "cloudfront",
      name: "CloudFront",
      capacity: { requestsPerSecond: 200000 },
      latency: { baseMs: 5 },
      cost: { hourly: 0.48 },
    },
    {
      id: "alb",
      type: "alb",
      name: "ALB",
      capacity: { requestsPerSecond: 100000 },
      latency: { baseMs: 10 },
      cost: { hourly: 0.027 },
    },
    {
      id: "ecs",
      type: "ecs",
      name: "ECS",
      capacity: { requestsPerSecond: 50000 },
      latency: { baseMs: 20 },
      cost: { hourly: 0.16 },
    },
    {
      id: "rds",
      type: "rds",
      name: "RDS",
      capacity: { requestsPerSecond: 20000 },
      latency: { baseMs: 30 },
      cost: { hourly: 0.22 },
    },
  ],
  connections: [
    { id: "cloudfront-alb", sourceId: "cloudfront", targetId: "alb" },
    { id: "alb-ecs", sourceId: "alb", targetId: "ecs" },
    { id: "ecs-rds", sourceId: "ecs", targetId: "rds" },
  ],
};
