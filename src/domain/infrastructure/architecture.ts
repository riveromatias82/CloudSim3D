import { cloneConnection } from "./connection";
import { cloneResource } from "./resource";
import type { InfrastructureModel, Resource, ValidationIssue, ValidationResult } from "./types";
import { isResourceType } from "./resource";

const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]*$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function addIssue(issues: ValidationIssue[], path: string, message: string): void {
  issues.push({ path, message });
}

function validateFinitePositive(value: unknown, path: string, issues: ValidationIssue[]): void {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    addIssue(issues, path, "Must be a finite number greater than 0.");
  }
}

function validateFiniteNonNegative(value: unknown, path: string, issues: ValidationIssue[]): void {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    addIssue(issues, path, "Must be a finite number greater than or equal to 0.");
  }
}

export function validateInfrastructureModel(input: unknown): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!isRecord(input)) {
    return {
      ok: false,
      issues: [{ path: "", message: "Architecture must be a JSON object." }],
    };
  }

  if (typeof input.id !== "string" || input.id.trim().length === 0) {
    addIssue(issues, "id", "Architecture id is required.");
  } else if (!ID_PATTERN.test(input.id)) {
    addIssue(issues, "id", "Architecture id must be alphanumeric and may include _ or -.");
  }

  if (typeof input.name !== "string" || input.name.trim().length === 0) {
    addIssue(issues, "name", "Architecture name is required.");
  }

  if (input.metadata !== undefined) {
    if (!isRecord(input.metadata)) {
      addIssue(issues, "metadata", "Metadata must be an object.");
    } else {
      if (input.metadata.provider !== undefined && typeof input.metadata.provider !== "string") {
        addIssue(issues, "metadata.provider", "Provider must be a string.");
      }
      if (input.metadata.region !== undefined && typeof input.metadata.region !== "string") {
        addIssue(issues, "metadata.region", "Region must be a string.");
      }
    }
  }

  if (!Array.isArray(input.resources)) {
    addIssue(issues, "resources", "Resources must be an array.");
    return { ok: false, issues };
  }

  if (!Array.isArray(input.connections)) {
    addIssue(issues, "connections", "Connections must be an array.");
    return { ok: false, issues };
  }

  const resourceIds = new Set<string>();
  input.resources.forEach((resource, index) => {
    validateResource(resource, `resources[${index}]`, resourceIds, issues);
  });

  if (input.resources.length === 0) {
    addIssue(issues, "resources", "Architecture must contain at least one resource.");
  }

  const connectionIds = new Set<string>();
  input.connections.forEach((connection, index) => {
    validateConnection(connection, `connections[${index}]`, resourceIds, connectionIds, issues);
  });

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  return {
    ok: true,
    value: structuredClone(input) as unknown as InfrastructureModel,
  };
}

function validateResource(
  resource: unknown,
  path: string,
  resourceIds: Set<string>,
  issues: ValidationIssue[],
): void {
  if (!isRecord(resource)) {
    addIssue(issues, path, "Resource must be an object.");
    return;
  }

  if (typeof resource.id !== "string" || resource.id.trim().length === 0) {
    addIssue(issues, `${path}.id`, "Resource id is required.");
  } else if (!ID_PATTERN.test(resource.id)) {
    addIssue(issues, `${path}.id`, "Resource id must be alphanumeric and may include _ or -.");
  } else if (resourceIds.has(resource.id)) {
    addIssue(issues, `${path}.id`, `Duplicate resource id "${resource.id}".`);
  } else {
    resourceIds.add(resource.id);
  }

  if (!isResourceType(resource.type)) {
    addIssue(
      issues,
      `${path}.type`,
      `Unknown resource type "${String(resource.type)}". Supported types: cloudfront, alb, ecs, lambda, sqs, redis, rds, dynamodb.`,
    );
  }

  if (typeof resource.name !== "string" || resource.name.trim().length === 0) {
    addIssue(issues, `${path}.name`, "Resource name is required.");
  }

  if (resource.position !== undefined) {
    if (!isRecord(resource.position)) {
      addIssue(issues, `${path}.position`, "Position must be an object with x, y, z.");
    } else {
      for (const axis of ["x", "y", "z"] as const) {
        if (typeof resource.position[axis] !== "number" || !Number.isFinite(resource.position[axis])) {
          addIssue(issues, `${path}.position.${axis}`, "Position coordinates must be finite numbers.");
        }
      }
    }
  }

  if (resource.capacity !== undefined) {
    if (!isRecord(resource.capacity)) {
      addIssue(issues, `${path}.capacity`, "Capacity must be an object.");
    } else {
      if (resource.capacity.requestsPerSecond !== undefined) {
        validateFinitePositive(
          resource.capacity.requestsPerSecond,
          `${path}.capacity.requestsPerSecond`,
          issues,
        );
      }
      if (resource.capacity.concurrentRequests !== undefined) {
        validateFinitePositive(
          resource.capacity.concurrentRequests,
          `${path}.capacity.concurrentRequests`,
          issues,
        );
      }
    }
  }

  if (resource.latency !== undefined) {
    if (!isRecord(resource.latency) || resource.latency.baseMs === undefined) {
      addIssue(issues, `${path}.latency`, "Latency must include baseMs.");
    } else {
      validateFiniteNonNegative(resource.latency.baseMs, `${path}.latency.baseMs`, issues);
    }
  }

  if (resource.cost !== undefined) {
    if (!isRecord(resource.cost) || resource.cost.hourly === undefined) {
      addIssue(issues, `${path}.cost`, "Cost must include hourly.");
    } else {
      validateFiniteNonNegative(resource.cost.hourly, `${path}.cost.hourly`, issues);
    }
  }
}

function validateConnection(
  connection: unknown,
  path: string,
  resourceIds: Set<string>,
  connectionIds: Set<string>,
  issues: ValidationIssue[],
): void {
  if (!isRecord(connection)) {
    addIssue(issues, path, "Connection must be an object.");
    return;
  }

  if (typeof connection.id !== "string" || connection.id.trim().length === 0) {
    addIssue(issues, `${path}.id`, "Connection id is required.");
  } else if (connectionIds.has(connection.id)) {
    addIssue(issues, `${path}.id`, `Duplicate connection id "${connection.id}".`);
  } else {
    connectionIds.add(connection.id);
  }

  if (typeof connection.sourceId !== "string" || connection.sourceId.trim().length === 0) {
    addIssue(issues, `${path}.sourceId`, "Connection sourceId is required.");
  } else if (!resourceIds.has(connection.sourceId)) {
    addIssue(
      issues,
      `${path}.sourceId`,
      `Connection "${String(connection.id)}" references unknown resource "${connection.sourceId}".`,
    );
  }

  if (typeof connection.targetId !== "string" || connection.targetId.trim().length === 0) {
    addIssue(issues, `${path}.targetId`, "Connection targetId is required.");
  } else if (!resourceIds.has(connection.targetId)) {
    addIssue(
      issues,
      `${path}.targetId`,
      `Connection "${String(connection.id)}" references unknown resource "${connection.targetId}".`,
    );
  }

  if (
    typeof connection.sourceId === "string" &&
    typeof connection.targetId === "string" &&
    connection.sourceId === connection.targetId
  ) {
    addIssue(issues, `${path}.targetId`, "A connection cannot reference the same resource as source and target.");
  }

  if (connection.capacity !== undefined) {
    if (!isRecord(connection.capacity)) {
      addIssue(issues, `${path}.capacity`, "Connection capacity must be an object.");
    } else if (connection.capacity.requestsPerSecond !== undefined) {
      validateFinitePositive(
        connection.capacity.requestsPerSecond,
        `${path}.capacity.requestsPerSecond`,
        issues,
      );
    }
  }

  if (connection.latencyMs !== undefined) {
    validateFiniteNonNegative(connection.latencyMs, `${path}.latencyMs`, issues);
  }

  if (connection.weight !== undefined) {
    validateFinitePositive(connection.weight, `${path}.weight`, issues);
  }
}

export function getResourceMap(architecture: InfrastructureModel): Map<string, Resource> {
  return new Map(architecture.resources.map((resource) => [resource.id, resource]));
}

export function getEntryResourceIds(architecture: InfrastructureModel): string[] {
  const targeted = new Set(architecture.connections.map((connection) => connection.targetId));
  return architecture.resources
    .filter((resource) => !targeted.has(resource.id))
    .map((resource) => resource.id);
}

export function cloneArchitecture(
  architecture: InfrastructureModel,
  overrides: Partial<Pick<InfrastructureModel, "id" | "name">> = {},
): InfrastructureModel {
  return {
    id: overrides.id ?? architecture.id,
    name: overrides.name ?? architecture.name,
    metadata: architecture.metadata ? { ...architecture.metadata } : undefined,
    resources: architecture.resources.map((resource) => cloneResource(resource)),
    connections: architecture.connections.map((connection) => cloneConnection(connection)),
  };
}

export function formatValidationIssues(issues: ValidationIssue[]): string {
  return issues.map((issue) => (issue.path ? `${issue.path}: ${issue.message}` : issue.message)).join("\n");
}
