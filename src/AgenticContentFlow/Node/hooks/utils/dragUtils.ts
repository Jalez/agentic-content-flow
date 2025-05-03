import { Node } from "@xyflow/react";
import { NodeData } from "../../../types";

/**
 * Constants for drag behavior
 */
export const DRAG_CONSTANTS = {
  ESCAPE_MARGIN: 10 // How much of the node needs to be outside before breaking free
};

/**
 * Simple check if a node is trying to escape its parent container
 * Returns true if the node is positioned such that a significant portion
 * is outside the parent container.
 */
export const isNodeTryingToEscape = (
  node: Node<NodeData>,
  parentNode?: Node<NodeData>
): boolean => {
  // No parent means always free to move
  if (!parentNode) {
    return true;
  }
  
  // Get dimensions
  const nodeWidth = node.width || node.measured?.width || 0;
  const nodeHeight = node.height || node.measured?.height || 0;
  const parentWidth = parentNode.width || parentNode.measured?.width || 0;
  const parentHeight = parentNode.height || parentNode.measured?.height || 0;
  
  // Calculate edges of the node and parent
  const nodeLeft = node.position.x;
  const nodeRight = node.position.x + nodeWidth;
  const nodeTop = node.position.y;
  const nodeBottom = node.position.y + nodeHeight;
  
  const parentLeft = parentNode.position.x;
  const parentRight = parentNode.position.x + parentWidth;
  const parentTop = parentNode.position.y;
  const parentBottom = parentNode.position.y + parentHeight;
  
  // Check if the node is significantly outside the parent container
  const outsideLeft = nodeLeft < parentLeft - DRAG_CONSTANTS.ESCAPE_MARGIN;
  const outsideRight = nodeRight > parentRight + DRAG_CONSTANTS.ESCAPE_MARGIN;
  const outsideTop = nodeTop < parentTop - DRAG_CONSTANTS.ESCAPE_MARGIN;
  const outsideBottom = nodeBottom > parentBottom + DRAG_CONSTANTS.ESCAPE_MARGIN;
  
  return outsideLeft || outsideRight || outsideTop || outsideBottom;
};

/**
 * Check if a node has infinite extent
 */
export const hasInfiniteExtent = (node?: Node<NodeData>): boolean => {
  if (!node || !Array.isArray(node.extent)) return false;
  
  return (
    node.extent[0]?.[0] === -Infinity &&
    node.extent[0]?.[1] === -Infinity &&
    node.extent[1]?.[0] === Infinity &&
    node.extent[1]?.[1] === Infinity
  );
};

/**
 * Updates the extent in localNodes during drag
 */
export const updateNodeExtentInLocalNodes = (
  localNodes: Node<NodeData>[],
  nodeId: string,
  setInfiniteExtent: boolean
): Node<NodeData>[] => {
  return localNodes.map(localNode => {
    if (localNode.id === nodeId) {
      return {
        ...localNode,
        extent: setInfiniteExtent ? 
          [[-Infinity, -Infinity], [Infinity, Infinity]] : 
          localNode.extent
      };
    }
    return localNode;
  });
};