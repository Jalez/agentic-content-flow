/** @format */
import { create } from "zustand";
import { persist } from "zustand/middleware";

// Layout types we support
export type LayoutDirection = "DOWN" | "RIGHT" | "LEFT" | "UP";
export type LayoutAlgorithm = "layered" | "mrtree";

export interface LayoutStoreState {
  // Layout settings
  direction: LayoutDirection;
  algorithm: LayoutAlgorithm;
  autoLayout: boolean;
  layoutInProgress: boolean;
  padding: number;
  nodeSpacing: number;
  layerSpacing: number;

  // Actions
  setDirection: (direction: LayoutDirection) => void;
  setAlgorithm: (algorithm: LayoutAlgorithm) => void;
  setAutoLayout: (auto: boolean) => void;
  setLayoutInProgress: (inProgress: boolean) => void;
  setPadding: (padding: number) => void;
  setNodeSpacing: (spacing: number) => void;
  setLayerSpacing: (spacing: number) => void;

  // Helpers for getting full options
  getElkOptions: () => Record<string, any>;
}

/**
 * Store for managing layout settings and state
 */
export const useLayoutStore = create<LayoutStoreState>()(
  persist(
    (set, get) => ({
      direction: "DOWN", // Default direction is downward
      algorithm: "layered", // Default algorithm
      autoLayout: true, // Default to automatic layout
      layoutInProgress: false,
      padding: 50,
      nodeSpacing: 150, // Increased from 80 to 150
      layerSpacing: 180, // Increased from 100 to 180

      // Actions for updating layout settings
      setDirection: (direction) => set({ direction }),
      setAlgorithm: (algorithm) => set({ algorithm }),
      setAutoLayout: (autoLayout) => set({ autoLayout }),
      setLayoutInProgress: (layoutInProgress) => set({ layoutInProgress }),
      setPadding: (padding) => set({ padding }),
      setNodeSpacing: (nodeSpacing) => set({ nodeSpacing }),
      setLayerSpacing: (layerSpacing) => set({ layerSpacing }),

      // Helper to generate ELK options based on current settings
      getElkOptions: () => {
        const { direction, algorithm, nodeSpacing, layerSpacing } = get();

        // Base options
        const options: Record<string, any> = {
          "elk.algorithm": algorithm,
          // "elk.padding": get().padding,
          "elk.spacing.nodeNode": nodeSpacing,
          "elk.direction": direction,
        };

        // Algorithm-specific options
        switch (algorithm) {
          case "layered":
            options["elk.layered.spacing.nodeNodeBetweenLayers"] = layerSpacing;
            break;
          case "mrtree":
            // options["elk.mrtree.spacing.nodeNode"] = nodeSpacing;
            break;
        }

        return options;
      },
    }),
    {
      name: "layout-settings-storage",
      partialize: (state) => ({
        direction: state.direction,
        algorithm: state.algorithm,
        autoLayout: state.autoLayout,
        padding: state.padding,
        nodeSpacing: state.nodeSpacing,
        layerSpacing: state.layerSpacing,
      }),
    }
  )
);
