import { Node } from "@xyflow/react";
import { NodeData } from "../../../types";
import { useCallback } from "react";
import { withErrorHandler } from "../../../utils/withErrorHandler";
import { createNodeFromTemplate } from "../../registry/nodeTypeRegistry";
import { useNodeContext } from "../../store/useNodeContext";
import { useEdgeContext } from "../../../Edge/store/useEdgeContext";
import { useTransaction } from "@jalez/react-state-history";
import { calculateTargetNodePosition } from "../utils/positionUtils";
import { createEdge, getHandlesForNodeType } from "../../../Edge/hooks/utils/edgeUtils";

export const useTargetNodeOperations = () => {
  const { 
    addNode, 
    nodeMap, 
    nodeParentIdMapWithChildIdSet 
  } = useNodeContext();
  
  const { 
    onEdgeAdd
  } = useEdgeContext();
  
  const { withTransaction } = useTransaction();

  const addTargetNode = useCallback(
    withErrorHandler("addTargetNode", (eventNode: Node<NodeData>) => {
      const newNodeId = `node-${Date.now()}`;

      // Find existing children of this parent using the more efficient Set structure
      const childIdSet = nodeParentIdMapWithChildIdSet.get(eventNode.id);
      
      // Get all child nodes from the nodeMap using the IDs in the Set
      const childNodes: Node<NodeData>[] = [];
      if (childIdSet) {
        childIdSet.forEach(childId => {
          const childNode = nodeMap.get(childId);
          if (childNode) {
            childNodes.push(childNode);
          }
        });
      }
      
      // Sort child nodes by Y position (only if there are children)
      const existingChildren = childNodes.sort((a, b) => a.position.y - b.position.y);

      // Calculate position considering existing children
      const newPosition = calculateTargetNodePosition(eventNode, existingChildren);

      // Use the node registry to create a child node
      const newChildNode = createNodeFromTemplate(eventNode.type as string, {
        id: newNodeId,
        position: newPosition,
        eventNode,
        label: "New Concept",
        details: "Add details about this concept",
      });

      if (!newChildNode) {
        console.error("Failed to create child node: node type not registered");
        return;
      }

      // **Make sure to assign the parent relationship explicitly**
      newChildNode.parentId = eventNode.id;
      newChildNode.data.parent = eventNode.id; // if your logic depends on this

      // Get appropriate handles for the node type
      const { sourceHandle, targetHandle } = getHandlesForNodeType(eventNode.type as string);

      const newEdge = createEdge(
        eventNode.id,
        newNodeId,
        sourceHandle,
        targetHandle
      );

      withTransaction(
        () => {
          addNode(newChildNode);
          onEdgeAdd(newEdge);
        },
        "addTargetNodeTransaction"
      );
    }),
    [addNode, nodeMap, nodeParentIdMapWithChildIdSet, onEdgeAdd, withTransaction]
  );

  return {
    addTargetNode,
  };
};