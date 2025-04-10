import { Node } from "@xyflow/react";

export interface NodeStyleHelperOptions {
  nodeLevel?: "basic" | "intermediate" | "advanced";
  isCourse?: boolean;
  isSelected?: boolean;
}

/**
 * Helper functions for node styling
 */
export const NodeStyleHelper = {
  /**
   * Get the appropriate color for a node based on its level and type
   */
  getNodeColor: (options: NodeStyleHelperOptions): string => {
    const { nodeLevel, isCourse } = options;
    
    if (isCourse) {
      return "primary.main";
    }
    
    const level = nodeLevel || "intermediate";
    switch (level) {
      case "basic":
        return "#1976d2"; // blue
      case "intermediate":
        return "#9c27b0"; // purple
      case "advanced":
        return "#dc004e"; // red
      default:
        return "#1976d2"; // default blue
    }
  },
  
  /**
   * Get container styles for a node
   */
  getContainerStyles: (node: Node | undefined, options: NodeStyleHelperOptions) => {
    const { isCourse, isSelected } = options;
    
    return {
      width: node?.style?.width,
      height: node?.style?.height,
      backgroundColor: "background.default",
      display: "flex",
      flexDirection: "column",
      userSelect: "none",
      transition: "width 0.2s ease, height 0.2s ease",
      ...(isCourse && {
        border: "0.5em solid",
        borderColor: isSelected ? "primary.main" : "divider",
      }),
    };
  }
};

export default NodeStyleHelper;