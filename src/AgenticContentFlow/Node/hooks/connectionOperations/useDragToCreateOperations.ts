import { Node, useReactFlow } from "@xyflow/react";
import { useCallback } from "react";
import { useNodeContext } from "../../store/useNodeContext";
import { useEdgeContext } from "../../../Edge/store/useEdgeContext";
import { getCumulativeParentOffset } from "../utils/positionUtils";
import { createConnectionNode, handleContainerization } from "../utils/nodeUtils";
import { useTransaction } from "@jalez/react-state-history";
import { createConnectionEdge } from "@/AgenticContentFlow/Edge/hooks/utils/edgeUtils";
import { NodeData } from "@/AgenticContentFlow/types";

export const useDragToCreateOperations = () => {
  const {
    addNode,
    nodeMap,
    updateNode,
    updateNodes,
    nodeParentIdMapWithChildIdSet 
  } = useNodeContext();

  const {
    edges,
    onEdgeAdd
  } = useEdgeContext();

  const { screenToFlowPosition } = useReactFlow();;

  const { withTransaction } = useTransaction();


  const onConnectEnd = useCallback(
    (event: MouseEvent | TouchEvent, connectionState: any) => {
      // Create a new node when dragging from a source node to the pane
      // This happens when connectionState.fromNode exists but there's no valid connection
      if (connectionState.fromNode && !connectionState.toNode) {
        const { fromNode } = connectionState;

        const position = calculateNewNodeStartPosition(
          fromNode,
          event
        );
        const newNodeId = `node-${Date.now()}`;
        
        // Use the node registry to create a new node
        const newToNode = createConnectionNode(
          fromNode,
          newNodeId,
          position,
        );

        if (!newToNode) {
          console.error("Failed to create new node on connect end: node type not registered");
          return;
        }

        // The edge should connect from the specific handle being dragged
        // to the appropriate corresponding handle on the new node
        // Pass the new node type to get the correct edge type
        const newEdge = createConnectionEdge(newNodeId, connectionState, newToNode.type);

        // Handle invisible node management for horizontal connections
        withTransaction(() => {

          const { updatedToNode, updatedFromNode, containerToAdd, updatedToNodeSiblings } = handleContainerization(
            newToNode,
            fromNode,
            newEdge,
            nodeMap,
            nodeParentIdMapWithChildIdSet
          );

          onEdgeAdd(newEdge);
          containerToAdd && addNode(containerToAdd);
          updatedToNode && addNode(updatedToNode);
          updatedToNodeSiblings && updateNodes(updatedToNodeSiblings);

          if (
            updatedFromNode && JSON.stringify(updatedFromNode) !== JSON.stringify(fromNode)) {
            updateNode(updatedFromNode);
          }

        }, "onConnectEndTransaction");
      }
    },
    [screenToFlowPosition, addNode, onEdgeAdd, nodeMap, edges, updateNode, updateNodes, nodeParentIdMapWithChildIdSet, withTransaction]
  );

  const calculateNewNodeStartPosition = useCallback(
    (oldNode: Node<NodeData>, event: MouseEvent | TouchEvent) => {

      // Get cursor position
      const { clientX, clientY } =
        "changedTouches" in event ? event.changedTouches[0] : event;

      // Calculate flow position from screen position
      const globalPosition = screenToFlowPosition({ x: clientX, y: clientY });

      let position = globalPosition;

      // If there's a source parent, adjust by subtracting the chain's cumulative offset.
      if (oldNode) {
        const cumulativeOffset = getCumulativeParentOffset(
          oldNode,
          nodeMap
        );
        position = {
          x: globalPosition.x - cumulativeOffset.x,
          y: globalPosition.y - cumulativeOffset.y,
        };
      }

      return position;
    },
    [screenToFlowPosition, nodeMap]
  );
  return {
    onConnectEnd,
  };
};



