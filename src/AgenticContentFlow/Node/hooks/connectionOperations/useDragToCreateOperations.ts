import { useReactFlow } from "@xyflow/react";
import { useCallback } from "react";
import { createNodeFromTemplate } from "../../registry/nodeTypeRegistry";
import { useNodeContext } from "../../store/useNodeContext";
import { useEdgeContext } from "../../../Edge/store/useEdgeContext";
import { getCumulativeParentOffset } from "../utils/positionUtils";
import { useInvisibleNodeOperations } from "../useInvisibleNodeOperations";

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
  const { 
    handleDragToCreateWithInvisibleNode,
    executeInvisibleNodeOperation 
  } = useInvisibleNodeOperations();

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

        // Handle invisible node management for horizontal connections
        executeInvisibleNodeOperation(() => {
          const result = handleDragToCreateWithInvisibleNode(
            newNode, 
            connectionState.fromNode, 
            newEdge
          );
          
          // Add the edge
          onEdgeAdd(newEdge);
          
          // If no invisible node was created, add the new node normally
          if (!result.newInvisibleNode) {
            addNode(newNode);
          }
          
          return result;
        }, "Drag-to-create with invisible node management");
      }
    },
    [screenToFlowPosition, addNode, onEdgeAdd, nodeMap, edges, handleDragToCreateWithInvisibleNode, executeInvisibleNodeOperation]
  );

  return {
    onConnectEnd,
  };
};