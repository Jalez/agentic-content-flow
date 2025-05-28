import { Node, useReactFlow } from "@xyflow/react";
import { NodeData } from "../../../types";
import { useCallback } from "react";
import { withErrorHandler } from "../../../utils/withErrorHandler";
import { createNodeFromTemplate } from "../../registry/nodeTypeRegistry";
import { useNodeContext } from "../../store/useNodeContext";
import { useEdgeContext } from "../../../Edge/store/useEdgeContext";
import { useTransaction } from "@jalez/react-state-history";
import { calculateSourceNodePosition } from "../utils/positionUtils";
import { createEdge } from "../../../Edge/hooks/utils/edgeUtils";

export const useSourceNodeOperations = () => {
  const { 
    addNode, 
    nodeMap, 
    updateNode
  } = useNodeContext();
  
  const { 
    onEdgeAdd
  } = useEdgeContext();
  
  const { withTransaction } = useTransaction();
  const reactFlowInstance = useReactFlow();

  const addSourceNode = useCallback(
    withErrorHandler("addSourceNode", (childNode: Node<NodeData>) => {
      const realChildNode = nodeMap.get(childNode.id);
      if (!realChildNode) {
        console.error("Child node not found in nodeMap");
        return;
      }
      
      const newNodeId = `node-${Date.now()}`;
      const newPosition = calculateSourceNodePosition(realChildNode);

      // Use the node registry to create a source node
      const newParentNode = createNodeFromTemplate(realChildNode.type as string, {
        id: newNodeId,
        position: newPosition,
        nodeLevel: realChildNode.data.nodeLevel,
        subject: realChildNode.data.subject,
      });

      if (!newParentNode) {
        console.error("Failed to create parent node: node type not registered");
        return;
      }

      const newEdge = createEdge(
        newParentNode.id,
        realChildNode.id,
        "right", // Default to right for source nodes
        "left"   // Default to left for target nodes
      );

      const updatedChildNode = {
        ...realChildNode,
        data: {
          ...realChildNode.data,
          parent: newNodeId,
        },
      };

      withTransaction(
        () => {
          updateNode(updatedChildNode);
          addNode(newParentNode);
          onEdgeAdd(newEdge);
        },
        "addSourceNodeTransaction"
      );

      // Focus view on both nodes
      reactFlowInstance.fitView({
        nodes: [newParentNode, updatedChildNode],
        duration: 500,
        padding: 0.2,
      });
    }),
    [addNode, nodeMap, updateNode, onEdgeAdd, withTransaction, reactFlowInstance]
  );

  return {
    addSourceNode,
  };
};