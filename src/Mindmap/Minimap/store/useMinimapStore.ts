/** @format */
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface MinimapState {
  showMiniMap: boolean;
  setShowMiniMap: (show: boolean) => void;
}

export const useMinimapStore = create<MinimapState>()(
  persist(
    (set) => ({
      showMiniMap: true,
      setShowMiniMap: (show) => set({ showMiniMap: show }),
    }),
    {
      name: "view-mindmap-minimap-storage",
      partialize: (state) => ({
        showMiniMap: state.showMiniMap,
      }),
    }
  )
);
