import { Connection, Edge } from "@xyflow/react";
import { useCallback } from "react";
import { withErrorHandler } from "../../../utils/withErrorHandler";
import { useEdgeContext } from "../../../Edge/store/useEdgeContext";
import { useNodeContext } from "../../store/useNodeContext";
import { createConnectionWithTargetHandle } from "../../../Edge/hooks/utils/edgeUtils";
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

      const newEdge: Edge = {
        id: `e-${connection.source}-${connection.target}`,
        source: connection.source!,
        target: connection.target!,
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle,
      };

      const sourceNode = nodeMap.get(newEdge.source);
      const targetNode = nodeMap.get(newEdge.target);

      if (!sourceNode || !targetNode) {
        return;
      }


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