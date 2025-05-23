import { useReactFlow } from "@xyflow/react";
import { useCallback } from "react";
import { createNodeFromTemplate } from "../../registry/nodeTypeRegistry";
import { useNodeContext } from "../../store/useNodeContext";
import { useEdgeContext } from "../../../Edge/store/useEdgeContext";
import { useTransaction } from "@jalez/react-state-history";
import { getCumulativeParentOffset } from "../utils/positionUtils";

export const useDragToCreateOperations = () => {
  const { 
    addNode, 
    nodeMap
  } = useNodeContext();
  
  const { 
    edges, 
    onEdgeAdd
  } = useEdgeContext();
  
  const { screenToFlowPosition } = useReactFlow();
  const { withTransaction } = useTransaction();

  const onConnectEnd = useCallback(
    (event: MouseEvent | TouchEvent, connectionState: any) => {
      // Create a new node when dragging from a source node to the pane
      // This happens when connectionState.fromNode exists but there's no valid connection
      if (connectionState.fromNode && !connectionState.toNode) {
        // Get cursor position
        const { clientX, clientY } =
          "changedTouches" in event ? event.changedTouches[0] : event;

        // Generate unique ID for the new node
        const newNodeId = `node-${Date.now()}`;

        // Calculate flow position from screen position
        const globalPosition = screenToFlowPosition({ x: clientX, y: clientY });

        let position = globalPosition;

        // If there's a source parent, adjust by subtracting the chain's cumulative offset.
        if (connectionState.fromNode) {
          const cumulativeOffset = getCumulativeParentOffset(
            connectionState.fromNode,
            nodeMap
          );
          position = {
            x: globalPosition.x - cumulativeOffset.x,
            y: globalPosition.y - cumulativeOffset.y,
          };
        }

        // Use the node registry to create a new node
        const newNode = createNodeFromTemplate(connectionState.fromNode.type, {
          id: newNodeId,
          position,
          eventNode: connectionState.fromNode,
          details: "Add details about this concept",
        });

        if (!newNode) {
          console.error(
            "Failed to create new node on connect end: node type not registered"
          );
          return;
        }

        // The edge should connect from the specific handle being dragged
        // to the appropriate corresponding handle on the new node
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

        withTransaction(
          () => {
            addNode(newNode);
            onEdgeAdd(newEdge);
          },
          "onConnectEndTransaction"
        );
      }
    },
    [screenToFlowPosition, addNode, onEdgeAdd, nodeMap, edges]
  );

  return {
    onConnectEnd,
  };
};