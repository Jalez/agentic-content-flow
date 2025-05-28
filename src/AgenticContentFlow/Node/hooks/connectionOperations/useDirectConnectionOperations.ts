import { Connection } from "@xyflow/react";
import { useCallback } from "react";
import { withErrorHandler } from "../../../utils/withErrorHandler";
import { useEdgeContext } from "../../../Edge/store/useEdgeContext";
import { useNodeContext } from "../../store/useNodeContext";
import { createConnectionWithTargetHandle, validateConnection, createEdge } from "../../../Edge/hooks/utils/edgeUtils";
import { useTransaction } from "@jalez/react-state-history";
import { handleContainerization } from "../utils/nodeUtils";

export const useDirectConnectionOperations = () => {
  const {
    edges,
    onEdgeAdd,
    edgeMap
  } = useEdgeContext();

  const { withTransaction } = useTransaction();
  const { nodeMap, addNode, updateNodes, nodeParentIdMapWithChildIdSet } = useNodeContext();


  const onConnect = useCallback(
    withErrorHandler("onConnect", (params: Connection) => {
      const connection = createConnectionWithTargetHandle(params);

      const sourceNode = nodeMap.get(connection.source!);
      const targetNode = nodeMap.get(connection.target!);

      if (!sourceNode || !targetNode) {
        console.warn("Source or target node not found for connection");
        return;
      }

      // Validate connection using handle registry
      const isValidConnection = validateConnection(
        sourceNode.type || '',
        connection.sourceHandle || '',
        targetNode.type || '',
        connection.targetHandle || ''
      );

      if (!isValidConnection) {
        console.warn(`Invalid connection between ${sourceNode.type} and ${targetNode.type}`);
        return;
      }

      // Create edge with proper type based on node types and handles
      const newEdge = createEdge(
        connection.source!,
        connection.target!,
        connection.sourceHandle || '',
        connection.targetHandle || '',
        sourceNode.type,
        targetNode.type
      );

      withTransaction(() => {
        const {
          containerToAdd,
          updatedFromNode,
          updatedToNode,
          updatedToNodeSiblings
        } = handleContainerization(
          sourceNode,
          targetNode,
          newEdge,
          nodeMap,
          nodeParentIdMapWithChildIdSet
        );
        newEdge && onEdgeAdd(newEdge);
        const updatedNodes = []
        updatedFromNode && updatedNodes.push(updatedFromNode);
        updatedToNode && updatedNodes.push(updatedToNode);
        updatedToNodeSiblings && updatedNodes.push(...updatedToNodeSiblings);
        containerToAdd && addNode(containerToAdd);
        updateNodes(updatedNodes);

      }, "Direct connection with invisible node management");
    }),
    [edgeMap, edges, onEdgeAdd, nodeMap]
  );

  return {
    onConnect,
  };
};