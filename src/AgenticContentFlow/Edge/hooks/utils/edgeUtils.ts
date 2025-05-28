import { Edge, Connection } from "@xyflow/react";
import { handleRegistry } from "../../../Handle/registry/handleTypeRegistry";
import { HandleTypeDefinition } from "../../../types/handleTypes";

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
 * Create an edge between two nodes with appropriate handles and type
 */
export const createEdge = (
  sourceId: string,
  targetId: string,
  sourceHandle: string,
  targetHandle: string,
  sourceNodeType?: string,
  targetNodeType?: string
): Edge => {
  // Determine edge type based on node types and handles if available
  let edgeType = 'default';
  if (sourceNodeType && targetNodeType) {
    edgeType = handleRegistry.getEdgeTypeForConnection(
      sourceNodeType,
      sourceHandle,
      targetNodeType,
      targetHandle
    );
  }

  return {
    id: `e-${sourceId}-${targetId}`,
    source: sourceId,
    target: targetId,
    sourceHandle,
    targetHandle,
    type: edgeType,
  };
};

/**
 * Get the appropriate handles for node type (legacy fallback)
 */
export const getHandlesForNodeType = (nodeType: string): { sourceHandle: string; targetHandle: string } => {
  // Try to get from handle registry first
  const handles = handleRegistry.getNodeHandles(nodeType);
  if (handles.length > 0) {
    const sourceHandle = handles.find((h: HandleTypeDefinition) => h.type === 'source' || h.type === 'both');
    const targetHandle = handles.find((h: HandleTypeDefinition) => h.type === 'target' || h.type === 'both');
    
    if (sourceHandle && targetHandle) {
      return {
        sourceHandle: sourceHandle.position,
        targetHandle: targetHandle.position
      };
    }
  }

  // Legacy fallback
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
 * Create a connection with appropriate target handle and validation
 */
export const createConnectionWithTargetHandle = (connection: Connection): Connection => {
  const targetHandle = getTargetHandleFromSource(connection.sourceHandle);
  
  return {
    ...connection,
    targetHandle
  };
};

/**
 * Validate if a connection is allowed between two nodes
 */
export const validateConnection = (
  sourceNodeType: string,
  sourceHandle: string,
  targetNodeType: string,
  targetHandle: string
): boolean => {
  const compatibility = handleRegistry.canConnect(
    sourceNodeType,
    sourceHandle,
    targetNodeType,
    targetHandle
  );
  return compatibility.isValid;
};

/**
 * Create a connection edge with appropriate handles and validation
 */
export const createConnectionEdge = (
  newNodeId: string,
  connectionState: any,
  newNodeType?: string
) => {
  const draggedHandle = connectionState.fromPosition;
  const fromNodeType = connectionState.fromNode?.type;

  // Determine whether the dragged handle should be source or target
  const isDraggedHandleSource = draggedHandle === 'right' || draggedHandle === 'bottom';

  // Determine handles for the new connection
  let sourceHandle: string;
  let targetHandle: string;
  let edgeType = 'default';

  if (isDraggedHandleSource) {
    sourceHandle = draggedHandle;
    targetHandle = draggedHandle === 'right' ? 'left' : 'top';
  } else {
    sourceHandle = draggedHandle === 'left' ? 'right' : 'bottom';
    targetHandle = draggedHandle;
  }

  // Get edge type from handle registry if node types are available
  if (fromNodeType && newNodeType) {
    const sourceNodeType = isDraggedHandleSource ? fromNodeType : newNodeType;
    const targetNodeType = isDraggedHandleSource ? newNodeType : fromNodeType;
    const srcHandle = isDraggedHandleSource ? sourceHandle : targetHandle;
    const tgtHandle = isDraggedHandleSource ? targetHandle : sourceHandle;
    
    edgeType = handleRegistry.getEdgeTypeForConnection(
      sourceNodeType,
      srcHandle,
      targetNodeType,
      tgtHandle
    );
  }

  // Create edge with correct source/target based on which handle was dragged
  const newEdge = {
    id: isDraggedHandleSource
      ? `e-${connectionState.fromNode.id}-${newNodeId}`
      : `e-${newNodeId}-${connectionState.fromNode.id}`,
    source: isDraggedHandleSource ? connectionState.fromNode.id : newNodeId,
    target: isDraggedHandleSource ? newNodeId : connectionState.fromNode.id,
    sourceHandle,
    targetHandle,
    type: edgeType,
  };
  return newEdge;
}