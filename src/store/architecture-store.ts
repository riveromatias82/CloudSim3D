import { create } from "zustand";
import { cloneArchitecture } from "../domain/infrastructure/architecture";
import type { InfrastructureModel } from "../domain/infrastructure/types";
import { sampleArchitecture, sampleArchitectureWithoutCache } from "../data/sample-architecture";
import { jsonArchitectureImporter } from "../importers/json/json-importer";
import { createId } from "../utils/id";

export type ArchitectureSlot = "a" | "b";

interface ArchitectureStore {
  architectureA: InfrastructureModel;
  architectureB: InfrastructureModel | null;
  lastError: string | null;
  loadSample: (slot?: ArchitectureSlot) => void;
  loadCachelessSampleIntoB: () => void;
  importJson: (source: string, slot?: ArchitectureSlot) => boolean;
  duplicateAtoB: () => void;
  clearB: () => void;
  clearError: () => void;
}

export const useArchitectureStore = create<ArchitectureStore>((set, get) => ({
  architectureA: sampleArchitecture,
  architectureB: null,
  lastError: null,
  loadSample: (slot = "a") => {
    if (slot === "a") {
      set({ architectureA: sampleArchitecture, lastError: null });
      return;
    }
    set({ architectureB: sampleArchitecture, lastError: null });
  },
  loadCachelessSampleIntoB: () => {
    set({ architectureB: sampleArchitectureWithoutCache, lastError: null });
  },
  importJson: (source, slot = "a") => {
    const result = jsonArchitectureImporter.importSource(source);
    if (!result.ok || !result.model) {
      set({ lastError: result.message ?? "Unable to import architecture." });
      return false;
    }
    if (slot === "a") {
      set({ architectureA: result.model, lastError: null });
    } else {
      set({ architectureB: result.model, lastError: null });
    }
    return true;
  },
  duplicateAtoB: () => {
    const current = get().architectureA;
    set({
      architectureB: cloneArchitecture(current, {
        id: createId("arch"),
        name: `${current.name} (copy)`,
      }),
      lastError: null,
    });
  },
  clearB: () => set({ architectureB: null }),
  clearError: () => set({ lastError: null }),
}));
