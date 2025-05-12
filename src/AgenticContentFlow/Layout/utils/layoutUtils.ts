/** @format */
import { LayoutDirection } from "@jalez/react-flow-automated-layout";
import { Position } from "@xyflow/react";
import { Edge, Node } from "@xyflow/react";

export const LAYOUT_CONSTANTS = {
  NODE_DEFAULT_WIDTH: 180,
  NODE_DEFAULT_HEIGHT: 40,
  CONTAINER_HEADER_HEIGHT: 40, // Height of the header section in container nodes
  CONTAINER_PADDING: 20, // Padding inside container nodes
  HEADER_HEIGHT: 48,
  HEADER_SPACING: 5, // Reduced from 10 to 5

} as const;

export interface CustomElkNodeData {
  data: any;
  parentId?: string;
  extent?: any;
  style?: any;
  targetPosition: Position;
  sourcePosition: Position;
  type?: string;
}

export interface CustomElkEdgeData {
  sourceHandle?: string;
  targetHandle?: string;
  style?: any;
  animated?: boolean;
  label?: string;
}

/**
 * Get the target position based on the layout direction
 */
export function getTargetPosition(direction?: string): Position {
  switch (direction) {
    case "RIGHT":
      return Position.Left;
    case "LEFT":
      return Position.Right;
    case "UP":
      return Position.Bottom;
    case "DOWN":
    default:
      return Position.Top;
  }
}

/**
 * Get the source position based on the layout direction
 */
export function getSourcePosition(direction?: string): Position {
  switch (direction) {
    case "RIGHT":
      return Position.Right;
    case "LEFT":
      return Position.Left;
    case "UP":
      return Position.Top;
    case "DOWN":
    default:
      return Position.Bottom;
  }
}

/**
 * Get a unique mapping key for a set of layout settings
 */
export const getLayoutCacheKey = (
  direction: LayoutDirection,
  algorithm: string,
  nodes: Node[],
  edges: Edge[]
): string => {
  const hierarchySignature = nodes
    .filter((node) => node.parentId)
    .map((node) => `${node.id}:${node.parentId}`)
    .join("|");

  return `${direction}_${algorithm}_${nodes.length}_${edges.length}_${hierarchySignature}`;
};

export const stringifyNumericOptions = (
  opts: Record<string, any>
): Record<string, any> => {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(opts)) {
    result[key] = typeof value === "number" ? String(value) : value;
  }
  return result;
};

/**
 * Get adjusted vertical position for container content
 * This ensures content is placed below the header
 */
export const getContentStartY = (parentY: number): number => {
  return parentY + LAYOUT_CONSTANTS.HEADER_HEIGHT;
};

/**
 * Adjust node position to account for container header
 * Returns the node with adjusted position if needed
 */
export const adjustNodePositionForHeader = (
  node: Node,
  parentY?: number
): Node => {
  if (parentY === undefined) return node;

  const minY = getContentStartY(parentY) + LAYOUT_CONSTANTS.HEADER_SPACING;
  if (node.position.y < minY) {
    return {
      ...node,
      position: {
        ...node.position,
        y: minY,
      },
    };
  }
  return node;
};
