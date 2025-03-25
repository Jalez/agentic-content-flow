/** @format */
import { Node } from "@xyflow/react";
import {
  LAYOUT_CONSTANTS,
  adjustNodePositionForHeader,
} from "../utils/layoutUtils";

/**
 * Adjust parent-child relationships in the layout
 * This ensures containers fully encompass their children
 */
export const adjustParentChildPositions = (nodes: Node[]): Node[] => {
  const nodeMap = new Map<string, Node>();
  nodes.forEach((node) => nodeMap.set(node.id, node));

  const parentNodes = nodes.filter((node) =>
    nodes.some((n) => n.parentId === node.id)
  );

  console.log("Parent Nodes:", parentNodes);
  const adjustedNodes = [...nodes];
  const processedNodes = new Set<string>();

  // Create depth map for bottom-up processing
  const nodeDepthMap = new Map<string, number>();

  const computeDepth = (nodeId: string): number => {
    if (nodeDepthMap.has(nodeId)) {
      return nodeDepthMap.get(nodeId)!;
    }

    const children = nodes.filter((n) => n.parentId === nodeId);
    if (children.length === 0) {
      nodeDepthMap.set(nodeId, 0);
      return 0;
    }

    const maxChildDepth = Math.max(
      ...children.map((child) => computeDepth(child.id))
    );
    const depth = maxChildDepth + 1;
    nodeDepthMap.set(nodeId, depth);
    return depth;
  };

  // Compute depths for all parent nodes
  parentNodes.forEach((node) => {
    computeDepth(node.id);
  });

  console.log("Node Depth Map:", nodeDepthMap);

  // Sort parent nodes by depth (deepest children first)
  const sortedParentNodes = [...parentNodes].sort((a, b) => {
    return (nodeDepthMap.get(a.id) || 0) - (nodeDepthMap.get(b.id) || 0);
  });

  // Process each parent node
  sortedParentNodes.forEach((parentNode) => {
    if (processedNodes.has(parentNode.id)) return;

    const children = nodes.filter((n) => n.parentId === parentNode.id);

    if (children.length > 0) {
      // First adjust children positions to account for header
      children.forEach((child) => {
        const childIndex = adjustedNodes.findIndex((n) => n.id === child.id);
        if (childIndex !== -1) {
          adjustedNodes[childIndex] = adjustNodePositionForHeader(
            adjustedNodes[childIndex],
            parentNode.position.y
          );
        }
      });

      // Then calculate container bounds including header space
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      children.forEach((child) => {
        const childIndex = adjustedNodes.findIndex((n) => n.id === child.id);
        const adjustedChild = adjustedNodes[childIndex];

        const x = adjustedChild.position.x;
        const y = adjustedChild.position.y;
        const width =
          adjustedChild.width || LAYOUT_CONSTANTS.NODE_DEFAULT_WIDTH;
        const height =
          adjustedChild.height || LAYOUT_CONSTANTS.NODE_DEFAULT_HEIGHT;

        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x + width);
        maxY = Math.max(maxY, y + height);
      });

      minX -= LAYOUT_CONSTANTS.CONTAINER_PADDING.HORIZONTAL;
      // Account for header in the top padding
      minY =
        Math.min(minY, parentNode.position.y + LAYOUT_CONSTANTS.HEADER_HEIGHT) -
        LAYOUT_CONSTANTS.CONTAINER_PADDING.VERTICAL;
      maxX += LAYOUT_CONSTANTS.CONTAINER_PADDING.HORIZONTAL;
      maxY += LAYOUT_CONSTANTS.CONTAINER_PADDING.VERTICAL;

      const parentIndex = adjustedNodes.findIndex(
        (n) => n.id === parentNode.id
      );

      if (parentIndex !== -1) {
        const updatedWidth = maxX - minX;
        const updatedHeight = maxY - minY;

        adjustedNodes[parentIndex] = {
          ...adjustedNodes[parentIndex],
          position: { x: minX, y: minY },
          width: updatedWidth,
          height: updatedHeight,
          style: {
            ...adjustedNodes[parentIndex].style,
            width: updatedWidth,
            height: updatedHeight,
          },
        };
      }

      processedNodes.add(parentNode.id);
    }
  });

  return adjustedNodes;
};
