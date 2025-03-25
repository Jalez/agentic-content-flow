/** @format */
import { Edge, Node } from "@xyflow/react";
import { calculateLayout } from "./elkLayout";
import { adjustParentChildPositions } from "./hierarchyLayout";
import { adjustContainerEdgeHandles } from "./edgeLayout";
import { arrangeFloatingNodesInPattern } from "./freeNodeLayout";
import {
  stringifyNumericOptions,
  LAYOUT_CONSTANTS,
} from "../utils/layoutUtils";

/**
 * Apply a layout to nodes and edges considering handle positions
 */
export const applyLayout = async (
  nodes: Node[],
  edges: Edge[],
  options: Record<string, any>
): Promise<{ nodes: Node[]; edges: Edge[] }> => {
  // Add container-specific options
  const containerOptions = stringifyNumericOptions({
    ...options,
    "elk.hierarchyHandling": "INCLUDE_CHILDREN",
    "elk.padding": `[left=${LAYOUT_CONSTANTS.CONTAINER_PADDING.HORIZONTAL}, top=${LAYOUT_CONSTANTS.CONTAINER_PADDING.VERTICAL}, right=${LAYOUT_CONSTANTS.CONTAINER_PADDING.HORIZONTAL}, bottom=${LAYOUT_CONSTANTS.CONTAINER_PADDING.VERTICAL}]`,
    "elk.aspectRatio": 1.5,
    "elk.partitioning.activate": true,
    "elk.layered.considerModelOrder.strategy": "NODES_AND_EDGES",
    "elk.contentAlignment": "V_TOP H_CENTER",
    "elk.layered.spacing.baseValue": 60,
    "elk.mrtree.spacing.levelDistance":
      options["elk.algorithm"] === "mrtree"
        ? options["elk.layered.spacing.nodeNodeBetweenLayers"] || 150
        : undefined,
    "elk.spacing.individual": 30,
    "elk.separateConnectedComponents": true,
    "elk.spacing.componentComponent": 80,
    "elk.layered.avoidOverlap": "true",
  });

  // First calculate the basic layout with hierarchy support
  const { nodes: layoutedNodes, edges: layoutedEdges } = await calculateLayout(
    nodes,
    edges,
    containerOptions
  );

  // Get information about parent-child relationships
  const hasParentChildRelations = nodes.some((node) => node.parentId);

  // Adjust parent-child relationships if needed
  const adjustedNodes = hasParentChildRelations
    ? adjustParentChildPositions(layoutedNodes)
    : layoutedNodes;

  // Identify free-floating and container nodes
  const containerNodes = adjustedNodes.filter((node) =>
    adjustedNodes.some((n) => n.parentId === node.id)
  );
  const containerNodeIds = new Set(containerNodes.map((n) => n.id));
  const freeNodes = adjustedNodes.filter(
    (node) => !node.parentId && !containerNodeIds.has(node.id)
  );

  // Apply special layout to free nodes if needed
  const finalNodes =
    freeNodes.length > 0
      ? arrangeFloatingNodesInPattern(
          adjustedNodes,
          freeNodes,
          containerNodes,
          options["elk.direction"],
          options["elk.algorithm"]
        )
      : adjustedNodes;

  // Normalize width and height for NodeResizer
  const normalizedNodes = finalNodes.map((node) => {
    const width = node.width || (node.style?.width as number) || 150;
    const height = node.height || (node.style?.height as number) || 50;

    return {
      ...node,
      width,
      height,
      style: {
        ...node.style,
        width,
        height,
      },
    };
  });

  // Fix edges between containers by adjusting handle positions
  const finalEdges = adjustContainerEdgeHandles(
    normalizedNodes,
    layoutedEdges,
    options["elk.direction"] || "DOWN"
  );

  return {
    nodes: normalizedNodes,
    edges: finalEdges,
  };
};
