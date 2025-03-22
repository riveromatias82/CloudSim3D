import { describe, expect, it } from "vitest";
import { jsonArchitectureImporter } from "../../importers/json/json-importer";
import { sampleArchitecture } from "../../data/sample-architecture";

describe("JSON importer", () => {
  it("imports valid JSON", () => {
    const result = jsonArchitectureImporter.importSource(JSON.stringify(sampleArchitecture));
    expect(result.ok).toBe(true);
    expect(result.model?.id).toBe("demo-architecture");
    expect(result.model?.resources).toHaveLength(5);
  });

  it("rejects invalid JSON", () => {
    const result = jsonArchitectureImporter.importSource("{ not json");
    expect(result.ok).toBe(false);
    expect(result.message).toContain("not valid JSON");
  });

  it("rejects unknown resource types", () => {
    const result = jsonArchitectureImporter.importSource(
      JSON.stringify({
        id: "bad",
        name: "Bad",
        resources: [{ id: "x", type: "eks", name: "EKS" }],
        connections: [],
      }),
    );
    expect(result.ok).toBe(false);
    expect(result.message).toContain("Unknown resource type");
  });

  it("rejects connections to missing resources", () => {
    const result = jsonArchitectureImporter.importSource(
      JSON.stringify({
        id: "bad",
        name: "Bad",
        resources: [{ id: "ecs", type: "ecs", name: "ECS" }],
        connections: [{ id: "ecs-rds", sourceId: "ecs", targetId: "database-1" }],
      }),
    );
    expect(result.ok).toBe(false);
    expect(result.message).toContain('unknown resource "database-1"');
  });

  it("rejects invalid connection payloads", () => {
    const result = jsonArchitectureImporter.importSource(
      JSON.stringify({
        id: "bad",
        name: "Bad",
        resources: [{ id: "ecs", type: "ecs", name: "ECS" }],
        connections: [{ id: "broken", sourceId: "ecs" }],
      }),
    );
    expect(result.ok).toBe(false);
    expect(result.message).toContain("targetId");
  });
});
