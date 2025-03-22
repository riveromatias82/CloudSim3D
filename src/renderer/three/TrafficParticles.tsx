import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, InstancedMesh, Object3D } from "three";
import type { Connection } from "../../domain/infrastructure/types";
import type { Vec3 } from "../../domain/infrastructure/types";
import { useSimulationStore } from "../../store/simulation-store";
import { useUiStore } from "../../store/ui-store";
import { clamp } from "../../utils/math";
import { getConnectionMidpoint } from "./connection-path";

const MAX_PER_CONNECTION = 28;
const dummy = new Object3D();
const color = new Color("#a5f3fc");

interface TrafficParticlesProps {
  connections: Connection[];
  positions: Record<string, Vec3>;
}

function bezierPoint(
  from: Vec3,
  mid: [number, number, number],
  to: Vec3,
  t: number,
): [number, number, number] {
  const inv = 1 - t;
  return [
    inv * inv * from.x + 2 * inv * t * mid[0] + t * t * to.x,
    inv * inv * from.y + 2 * inv * t * mid[1] + t * t * to.y,
    inv * inv * from.z + 2 * inv * t * mid[2] + t * t * to.z,
  ];
}

export function TrafficParticles({ connections, positions }: TrafficParticlesProps) {
  const meshRef = useRef<InstancedMesh>(null);
  const progress = useRef<Float32Array>(new Float32Array(connections.length * MAX_PER_CONNECTION));
  const connectionCount = connections.length;
  const instanceCount = Math.max(1, connectionCount * MAX_PER_CONNECTION);

  const paths = useMemo(
    () =>
      connections.map((connection) => {
        const from = positions[connection.sourceId];
        const to = positions[connection.targetId];
        if (!from || !to) {
          return null;
        }
        return { connection, from, to, mid: getConnectionMidpoint(from, to) };
      }),
    [connections, positions],
  );

  useMemo(() => {
    progress.current = new Float32Array(instanceCount);
    for (let i = 0; i < instanceCount; i += 1) {
      progress.current[i] = Math.random();
    }
  }, [instanceCount]);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) {
      return;
    }
    const store = useSimulationStore.getState();
    const slot = useUiStore.getState().activeSlot;
    const state = slot === "b" && store.stateB ? store.stateB : store.stateA;
    const playing = store.isPlaying;

    for (let connectionIndex = 0; connectionIndex < paths.length; connectionIndex += 1) {
      const path = paths[connectionIndex];
      const connection = connections[connectionIndex];
      if (!path || !connection) {
        continue;
      }
      const rps = state.connections[connection.id]?.requestsPerSecond ?? 0;
      const activeCount = rps <= 0 ? 0 : Math.round(clamp(rps / 2800, 3, MAX_PER_CONNECTION));
      const speed = (playing ? 1 : 0.15) * (0.18 + clamp(rps / 80_000, 0, 1) * 0.7);

      for (let particleIndex = 0; particleIndex < MAX_PER_CONNECTION; particleIndex += 1) {
        const instanceIndex = connectionIndex * MAX_PER_CONNECTION + particleIndex;
        const current = progress.current[instanceIndex] ?? 0;
        const next = (current + delta * speed * (0.7 + (particleIndex % 5) * 0.08)) % 1;
        progress.current[instanceIndex] = next;

        if (particleIndex >= activeCount) {
          dummy.position.set(0, -50, 0);
          dummy.scale.setScalar(0);
        } else {
          const [x, y, z] = bezierPoint(path.from, path.mid, path.to, next);
          dummy.position.set(x, y, z);
          dummy.scale.setScalar(0.08 + clamp(rps / 120_000, 0, 1) * 0.06);
        }
        dummy.updateMatrix();
        mesh.setMatrixAt(instanceIndex, dummy.matrix);
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, instanceCount]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.9} />
    </instancedMesh>
  );
}
