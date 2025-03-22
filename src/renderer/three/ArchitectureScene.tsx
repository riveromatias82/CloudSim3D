import { useMemo } from "react";
import type { InfrastructureModel } from "../../domain/infrastructure/types";
import type { SimulationState } from "../../domain/simulation/types";
import { ArchitectureLayoutEngine } from "../../domain/infrastructure/layout-engine";
import { CameraController } from "./CameraController";
import { ConnectionEdge } from "./ConnectionEdge";
import { ResourceNode } from "./ResourceNode";
import { SceneEnvironment } from "./SceneEnvironment";
import { TrafficParticles } from "./TrafficParticles";
import { useUiStore } from "../../store/ui-store";

const layoutEngine = new ArchitectureLayoutEngine();

interface ArchitectureSceneProps {
  architecture: InfrastructureModel;
  simulation: SimulationState;
}

export function ArchitectureScene({ architecture, simulation }: ArchitectureSceneProps) {
  const selectResource = useUiStore((state) => state.selectResource);
  const positions = useMemo(() => layoutEngine.layout(architecture), [architecture]);

  return (
    <group onPointerMissed={() => selectResource(null)}>
      <SceneEnvironment />
      <CameraController />
      {architecture.connections.map((connection) => {
        const from = positions[connection.sourceId];
        const to = positions[connection.targetId];
        if (!from || !to) {
          return null;
        }
        return (
          <ConnectionEdge
            key={connection.id}
            connection={connection}
            from={from}
            to={to}
            simulation={simulation.connections[connection.id]}
          />
        );
      })}
      {architecture.resources.map((resource) => {
        const position = positions[resource.id];
        if (!position) {
          return null;
        }
        return (
          <ResourceNode
            key={resource.id}
            resource={resource}
            position={[position.x, position.y, position.z]}
            simulation={simulation.resources[resource.id]}
          />
        );
      })}
      <TrafficParticles connections={architecture.connections} positions={positions} />
    </group>
  );
}
