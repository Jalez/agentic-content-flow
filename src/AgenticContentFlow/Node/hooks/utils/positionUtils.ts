import { Node } from "@xyflow/react";
import { NodeData } from "../../../types";

/**
 * Calculate the cumulative offset from all parent nodes in a hierarchy
 */
export const getCumulativeParentOffset = (
  node: Node<NodeData>,
  nodeMap: Map<string, Node<NodeData>>
): { x: number; y: number } => {
  // Start with zero offset
  let offset = { x: 0, y: 0 };

  // Walk up parent chain
  let currentNode = node;
  while (currentNode.parentId) {
    // Find parent node
    const eventNode = nodeMap.get(currentNode.parentId);
    if (!eventNode) break;

    // Add parent position to accumulated offset
    offset.x += eventNode.position.x;
    offset.y += eventNode.position.y;

    // Move up the chain
    currentNode = eventNode;
  }

  return offset;
};

/**
 * Calculate the position for a new source node (parent)
 */
export const calculateSourceNodePosition = (
  childNode: Node<NodeData>
): { x: number; y: number } => {
  return {
    x: childNode.position.x - 300,
    y: childNode.position.y,
  };
};

/**
 * Calculate the position for a new target node (child) considering existing children
 */
export const calculateTargetNodePosition = (
  parentNode: Node<NodeData>,
  existingChildren: Node<NodeData>[]
): { x: number; y: number } => {
  const VERTICAL_SPACING = 50;
  let newY = parentNode.position.y;

  if (existingChildren.length > 0) {
    // Sort children by Y position
    const sortedChildren = existingChildren.sort((a, b) => a.position.y - b.position.y);
    
    // Find a gap between existing children
    let gap = null;
    for (let i = 0; i < sortedChildren.length - 1; i++) {
      const currentY = sortedChildren[i].position.y;
      const nextY = sortedChildren[i + 1].position.y;
      const space = nextY - currentY;

      if (space >= VERTICAL_SPACING * 1.5) {
        gap = currentY + space / 2;
        break;
      }
    }

    if (gap !== null) {
      // Position in the middle of the found gap
      newY = gap;
    } else {
      // Position below the last child with spacing
      newY = sortedChildren[sortedChildren.length - 1].position.y + VERTICAL_SPACING;
    }
  }

  return {
    x: parentNode.position.x + 450,
    y: newY,
  };
};