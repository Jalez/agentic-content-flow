import { Connection, Edge } from "@xyflow/react";
import { useCallback } from "react";
import { withErrorHandler } from "../../../utils/withErrorHandler";
import { useEdgeContext } from "../../../Edge/store/useEdgeContext";
import { useNodeContext } from "../../store/useNodeContext";
import { createConnectionWithTargetHandle } from "../utils/edgeUtils";
import { useInvisibleNodeOperations } from "../useInvisibleNodeOperations";

export const useDirectConnectionOperations = () => {
  const { 
    edges, 
    onEdgeAdd, 
    edgeMap 
  } = useEdgeContext();

  const { nodeMap } = useNodeContext();
  const { 
    handleConnectionWithInvisibleNode, 
    executeInvisibleNodeOperation 
  } = useInvisibleNodeOperations();

  const onConnect = useCallback(
    withErrorHandler("onConnect", (params: Connection) => {
      const connection = createConnectionWithTargetHandle(params);
      
      // Convert connection to edge format for invisible node operations
      const edge: Edge = {
        id: `e-${connection.source}-${connection.target}`,
        source: connection.source!,
        target: connection.target!,
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle,
      };
      
      // Get the source and target nodes
      const sourceNode = nodeMap.get(edge.source);
      const targetNode = nodeMap.get(edge.target);
      
      if (!sourceNode || !targetNode) {
        // Fallback to original behavior if nodes not found
        onEdgeAdd(connection);
        return;
      }

      // Handle invisible node management for horizontal connections
      executeInvisibleNodeOperation(() => {
        const result = handleConnectionWithInvisibleNode(edge, sourceNode, targetNode);
        
        // Add the edge regardless of invisible node operations
        onEdgeAdd(connection);
        
        return result;
      }, "Direct connection with invisible node management");
    }),
    [edgeMap, edges, onEdgeAdd, nodeMap, handleConnectionWithInvisibleNode, executeInvisibleNodeOperation]
  );

  return {
    onConnect,
  };
};