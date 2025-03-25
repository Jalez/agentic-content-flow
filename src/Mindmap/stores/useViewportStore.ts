/** @format */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Viewport } from "@xyflow/react";

export interface ViewportStoreState {
  viewport: Viewport;
  setViewport: (viewport: Viewport) => void;
  layoutType: "default" | "horizontal" | "vertical" | "radial";
  setLayoutType: (
    type: "default" | "horizontal" | "vertical" | "radial"
  ) => void;
}

export const useViewportStore = create<ViewportStoreState>()(
  persist(
    (set) => ({
      viewport: { x: 0, y: 0, zoom: 1 },
      setViewport: (viewport) => set({ viewport }),
      layoutType: "default",
      setLayoutType: (layoutType) => set({ layoutType }),
    }),
    {
      name: "viewport-storage",
      partialize: (state) => ({
        viewport: state.viewport,
        layoutType: state.layoutType,
      }),
    }
  )
);
