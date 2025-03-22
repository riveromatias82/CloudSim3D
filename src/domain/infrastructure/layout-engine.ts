import type { InfrastructureModel, Vec3 } from "./types";
import { getEntryResourceIds } from "./architecture";

export interface LayoutOptions {
  layerSpacing?: number;
  nodeSpacing?: number;
  depthOffset?: number;
}

export type ArchitectureLayout = Record<string, Vec3>;

const DEFAULT_OPTIONS: Required<LayoutOptions> = {
  layerSpacing: 3.6,
  nodeSpacing: 4.2,
  depthOffset: 0.45,
};

export class ArchitectureLayoutEngine {
  layout(architecture: InfrastructureModel, options: LayoutOptions = {}): ArchitectureLayout {
    const config = { ...DEFAULT_OPTIONS, ...options };
    const layers = this.buildLayers(architecture);
    const positions: ArchitectureLayout = {};

    layers.forEach((layer, layerIndex) => {
      const width = Math.max(0, layer.length - 1) * config.nodeSpacing;
      layer.forEach((resourceId, index) => {
        const resource = architecture.resources.find((item) => item.id === resourceId);
        if (resource?.position) {
          positions[resourceId] = { ...resource.position };
          return;
        }

        positions[resourceId] = {
          x: index * config.nodeSpacing - width / 2,
          y: -layerIndex * config.layerSpacing,
          z: layerIndex % 2 === 0 ? 0 : config.depthOffset,
        };
      });
    });

    return positions;
  }

  private buildLayers(architecture: InfrastructureModel): string[][] {
    const outgoing = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    for (const resource of architecture.resources) {
      outgoing.set(resource.id, []);
      inDegree.set(resource.id, 0);
    }

    for (const connection of architecture.connections) {
      outgoing.get(connection.sourceId)?.push(connection.targetId);
      inDegree.set(connection.targetId, (inDegree.get(connection.targetId) ?? 0) + 1);
    }

    const layers: string[][] = [];
    const remaining = new Set(architecture.resources.map((resource) => resource.id));
    let current = getEntryResourceIds(architecture).filter((id) => remaining.has(id));

    if (current.length === 0) {
      current = architecture.resources.map((resource) => resource.id);
    }

    while (current.length > 0) {
      layers.push(current);
      current.forEach((id) => remaining.delete(id));

      const nextIds = new Set<string>();
      for (const id of current) {
        for (const targetId of outgoing.get(id) ?? []) {
          if (!remaining.has(targetId)) {
            continue;
          }
          const nextDegree = (inDegree.get(targetId) ?? 1) - 1;
          inDegree.set(targetId, nextDegree);
          if (nextDegree <= 0) {
            nextIds.add(targetId);
          }
        }
      }
      current = [...nextIds];
    }

    if (remaining.size > 0) {
      layers.push([...remaining]);
    }

    return layers;
  }
}
