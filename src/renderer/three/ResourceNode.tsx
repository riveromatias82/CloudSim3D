import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard, Text } from "@react-three/drei";
import type { Group } from "three";
import type { Resource } from "../../domain/infrastructure/types";
import type { ResourceSimulationState } from "../../domain/simulation/types";
import { getResourceVisualState } from "../visuals/resource-visual-state";
import { useUiStore } from "../../store/ui-store";
import { formatPercent } from "../../utils/format";

interface ResourceNodeProps {
  resource: Resource;
  position: [number, number, number];
  simulation?: ResourceSimulationState;
}

export function ResourceNode({ resource, position, simulation }: ResourceNodeProps) {
  const groupRef = useRef<Group>(null);
  const selected = useUiStore((state) => state.selectedResourceId === resource.id);
  const selectResource = useUiStore((state) => state.selectResource);
  const visual = useMemo(
    () => getResourceVisualState(resource, simulation),
    [resource, simulation],
  );

  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (!group) {
      return;
    }
    const pulse =
      visual.pulseSpeed > 0 ? 1 + Math.sin(clock.elapsedTime * visual.pulseSpeed) * 0.035 : 1;
    group.scale.setScalar(visual.scale * pulse * (selected ? 1.08 : 1));
  });

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={(event) => {
        event.stopPropagation();
        selectResource(resource.id);
      }}
    >
      <mesh rotation={resource.type === "redis" ? [0, 0, Math.PI / 2] : [0, 0, 0]}>
        <ResourceGeometry type={resource.type} />
        <meshStandardMaterial
          color={visual.baseColor}
          emissive={visual.baseColor}
          emissiveIntensity={visual.emissiveIntensity}
          roughness={0.28}
          metalness={0.45}
          transparent
          opacity={visual.opacity}
        />
      </mesh>
      {selected ? (
        <mesh>
          <torusGeometry args={[1.35, 0.045, 8, 48]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.9} />
        </mesh>
      ) : null}
      <Billboard position={[0, 1.45, 0]}>
        <Text
          fontSize={0.28 * visual.labelEmphasis}
          color="#e2e8f0"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.012}
          outlineColor="#020617"
        >
          {resource.name}
        </Text>
      </Billboard>
      <Billboard position={[0, -1.35, 0]}>
        <Text fontSize={0.2} color={visual.statusColor} anchorX="center" outlineWidth={0.01} outlineColor="#020617">
          {simulation ? `${formatPercent(simulation.utilization)} · ${simulation.status}` : resource.type}
        </Text>
      </Billboard>
    </group>
  );
}

function ResourceGeometry({ type }: { type: Resource["type"] }) {
  switch (type) {
    case "cloudfront":
      return <octahedronGeometry args={[0.95, 0]} />;
    case "alb":
      return <boxGeometry args={[1.7, 0.42, 1.15]} />;
    case "ecs":
      return <icosahedronGeometry args={[0.85, 0]} />;
    case "lambda":
      return <boxGeometry args={[0.55, 1.35, 0.55]} />;
    case "sqs":
      return <boxGeometry args={[1.55, 0.38, 0.95]} />;
    case "redis":
      return <cylinderGeometry args={[0.42, 0.42, 1.25, 24]} />;
    case "rds":
      return <cylinderGeometry args={[0.72, 0.72, 1.05, 28]} />;
    case "dynamodb":
      return <boxGeometry args={[1.2, 0.7, 1.2]} />;
    default: {
      const exhaustive: never = type;
      return exhaustive;
    }
  }
}
