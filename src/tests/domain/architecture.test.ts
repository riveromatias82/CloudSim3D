import { describe, expect, it } from "vitest";
import {
  formatValidationIssues,
  validateInfrastructureModel,
} from "../../domain/infrastructure/architecture";
import { sampleArchitecture } from "../../data/sample-architecture";
import { isResourceType } from "../../domain/infrastructure/resource";

describe("infrastructure validation", () => {
  it("accepts the sample architecture", () => {
    const result = validateInfrastructureModel(sampleArchitecture);
    expect(result.ok).toBe(true);
  });

  it("requires architecture identity fields", () => {
    const result = validateInfrastructureModel({
      resources: sampleArchitecture.resources,
      connections: sampleArchitecture.connections,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((issue) => issue.path === "id")).toBe(true);
      expect(result.issues.some((issue) => issue.path === "name")).toBe(true);
    }
  });

  it("rejects unknown resource types", () => {
    const result = validateInfrastructureModel({
      ...sampleArchitecture,
      resources: [
        {
          id: "mystery",
          type: "kubernetes",
          name: "Mystery",
        },
      ],
      connections: [],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues[0]?.message).toContain("Unknown resource type");
    }
  });

  it("rejects duplicate resource ids", () => {
    const result = validateInfrastructureModel({
      ...sampleArchitecture,
      resources: [...sampleArchitecture.resources, { ...sampleArchitecture.resources[0]! }],
    });
    expect(result.ok).toBe(false);
  });

  it("rejects connections to missing resources", () => {
    const result = validateInfrastructureModel({
      ...sampleArchitecture,
      connections: [
        {
          id: "ecs-rds",
          sourceId: "ecs",
          targetId: "database-1",
        },
      ],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(formatValidationIssues(result.issues)).toContain('unknown resource "database-1"');
    }
  });

  it("rejects self-referencing connections", () => {
    const result = validateInfrastructureModel({
      ...sampleArchitecture,
      connections: [{ id: "loop", sourceId: "ecs", targetId: "ecs" }],
    });
    expect(result.ok).toBe(false);
  });

  it("identifies supported resource types", () => {
    expect(isResourceType("rds")).toBe(true);
    expect(isResourceType("eks")).toBe(false);
  });
});
