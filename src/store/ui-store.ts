import { create } from "zustand";
import type { ArchitectureSlot } from "./architecture-store";

interface UiStore {
  selectedResourceId: string | null;
  activeSlot: ArchitectureSlot;
  comparisonOpen: boolean;
  cameraResetToken: number;
  importTarget: ArchitectureSlot;
  selectResource: (resourceId: string | null) => void;
  setActiveSlot: (slot: ArchitectureSlot) => void;
  setComparisonOpen: (open: boolean) => void;
  setImportTarget: (slot: ArchitectureSlot) => void;
  resetCamera: () => void;
}

export const useUiStore = create<UiStore>((set) => ({
  selectedResourceId: null,
  activeSlot: "a",
  comparisonOpen: false,
  cameraResetToken: 0,
  importTarget: "a",
  selectResource: (resourceId) => set({ selectedResourceId: resourceId }),
  setActiveSlot: (slot) => set({ activeSlot: slot, selectedResourceId: null }),
  setComparisonOpen: (open) => set({ comparisonOpen: open }),
  setImportTarget: (slot) => set({ importTarget: slot }),
  resetCamera: () => set((state) => ({ cameraResetToken: state.cameraResetToken + 1 })),
}));
