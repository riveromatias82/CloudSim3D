import type { Connection, InfrastructureModel } from "./types";

export function getOutgoingConnections(
  architecture: InfrastructureModel,
  resourceId: string,
): Connection[] {
  return architecture.connections.filter((connection) => connection.sourceId === resourceId);
}

export function getIncomingConnections(
  architecture: InfrastructureModel,
  resourceId: string,
): Connection[] {
  return architecture.connections.filter((connection) => connection.targetId === resourceId);
}

export function getConnectionWeight(connection: Connection): number {
  return connection.weight && connection.weight > 0 ? connection.weight : 1;
}

export function cloneConnection(
  connection: Connection,
  overrides: Partial<Connection> = {},
): Connection {
  return {
    ...connection,
    ...overrides,
    capacity: connection.capacity ? { ...connection.capacity } : undefined,
  };
}
