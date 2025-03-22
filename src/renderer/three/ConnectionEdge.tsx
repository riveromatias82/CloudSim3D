import { QuadraticBezierLine } from "@react-three/drei";
import { useMemo } from "react";
import type { Connection } from "../../domain/infrastructure/types";
import type { ConnectionSimulationState } from "../../domain/simulation/types";
import type { Vec3 } from "../../domain/infrastructure/types";
import { clamp } from "../../utils/math";
import { getConnectionMidpoint } from "./connection-path";

interface ConnectionEdgeProps {
  connection: Connection;
  from: Vec3;
  to: Vec3;
  simulation?: ConnectionSimulationState;
}

export function ConnectionEdge({ connection, from, to, simulation }: ConnectionEdgeProps) {
  const rps = simulation?.requestsPerSecond ?? 0;
  const intensity = clamp(rps / 60_000, 0.18, 1);
  const mid = useMemo(() => getConnectionMidpoint(from, to), [from, to]);

  return (
    <group>
      <QuadraticBezierLine
        start={[from.x, from.y, from.z]}
        end={[to.x, to.y, to.z]}
        mid={mid}
        color="#67e8f9"
        lineWidth={1.4 + intensity * 2.4}
        transparent
        opacity={0.25 + intensity * 0.55}
      />
      <QuadraticBezierLine
        start={[from.x, from.y, from.z]}
        end={[to.x, to.y, to.z]}
        mid={mid}
        color="#22d3ee"
        lineWidth={0.6}
        dashed
        dashScale={12 + (connection.id.length % 5)}
        gapSize={0.4}
        transparent
        opacity={0.35}
      />
    </group>
  );
}

