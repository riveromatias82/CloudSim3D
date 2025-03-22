import type { Vec3 } from "../../domain/infrastructure/types";

export function getConnectionMidpoint(from: Vec3, to: Vec3): [number, number, number] {
  return [
    (from.x + to.x) / 2 + (to.z - from.z) * 0.08,
    (from.y + to.y) / 2 + 0.8,
    (from.z + to.z) / 2 + (from.x - to.x) * 0.08,
  ];
}
