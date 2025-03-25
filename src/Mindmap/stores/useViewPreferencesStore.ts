/** @format */
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ViewPreferencesState {
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
  snapToGrid: boolean;
  setSnapToGrid: (snap: boolean) => void;
  showMiniMap: boolean;
  setShowMiniMap: (show: boolean) => void;
  touchMode: boolean;
  setTouchMode: (enabled: boolean) => void;
}

export const useViewPreferencesStore = create<ViewPreferencesState>()(
  persist(
    (set) => ({
      showGrid: true,
      setShowGrid: (show) => set({ showGrid: show }),
      snapToGrid: false,
      setSnapToGrid: (snap) => set({ snapToGrid: snap }),
      showMiniMap: true,
      setShowMiniMap: (show) => set({ showMiniMap: show }),
      touchMode: false,
      setTouchMode: (enabled) => set({ touchMode: enabled }),
    }),
    {
      name: "view-preferences-storage",
      partialize: (state) => ({
        showGrid: state.showGrid,
        snapToGrid: state.snapToGrid,
        showMiniMap: state.showMiniMap,
        touchMode: state.touchMode,
      }),
    }
  )
);
