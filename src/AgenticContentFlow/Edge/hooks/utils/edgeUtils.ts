import { Edge, Connection } from "@xyflow/react";

/**
 * Determine the appropriate target handle based on source handle
 */
export const getTargetHandleFromSource = (sourceHandle: string | null): string => {
  if (sourceHandle === "left") return "right";
  if (sourceHandle === "right") return "left";
  if (sourceHandle === "top") return "bottom";
  if (sourceHandle === "bottom") return "top";
  return "left"; // Default to left if no source handle
};

/**
 * Create an edge between two nodes with appropriate handles
 */
export const createEdge = (
  sourceId: string,
  targetId: string,
  sourceHandle: string,
  targetHandle: string
): Edge => {
  return {
    id: `e-${sourceId}-${targetId}`,
    source: sourceId,
    target: targetId,
    sourceHandle,
    targetHandle,
  };
};

/**
 * Get the appropriate handles for node type
 */
export const getHandlesForNodeType = (nodeType: string): { sourceHandle: string; targetHandle: string } => {
  if (nodeType === "datanode") {
    return {
      sourceHandle: "right",
      targetHandle: "left"
    };
  }
  
  // Default for other node types
  return {
    sourceHandle: "bottom",
    targetHandle: "top"
  };
};

/**
 * Create a connection with appropriate target handle
 */
export const createConnectionWithTargetHandle = (connection: Connection): Connection => {
  const targetHandle = getTargetHandleFromSource(connection.sourceHandle);
  
  return {
    ...connection,
    targetHandle
  };
};


/**
 * Create a connection edge with appropriate handles
 */
export const createConnectionEdge = (
  newNodeId: string,
  connectionState: any,
) => {
  const draggedHandle = connectionState.fromPosition;

  // Determine whether the dragged handle should be source or target
  const isDraggedHandleSource = draggedHandle === 'right' || draggedHandle === 'bottom';

  // Create edge with correct source/target based on which handle was dragged
  const newEdge = {
    id: isDraggedHandleSource
      ? `e-${connectionState.fromNode.id}-${newNodeId}`
      : `e-${newNodeId}-${connectionState.fromNode.id}`,
    source: isDraggedHandleSource ? connectionState.fromNode.id : newNodeId,
    target: isDraggedHandleSource ? newNodeId : connectionState.fromNode.id,
    sourceHandle: isDraggedHandleSource
      ? draggedHandle  // The dragged handle is the source
      : (draggedHandle === 'left' ? 'right' : 'bottom'),  // The corresponding handle on new node
    targetHandle: isDraggedHandleSource
      ? (draggedHandle === 'right' ? 'left' : 'top')  // The corresponding handle on new node
      : draggedHandle  // The dragged handle is the target
  };
  return newEdge;

}