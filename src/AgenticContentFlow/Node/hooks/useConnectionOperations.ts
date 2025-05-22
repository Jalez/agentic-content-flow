import { Node, Edge, useReactFlow, Connection } from "@xyflow/react";
import { NodeData } from "../../types";
import { useCallback } from "react";
import { withErrorHandler } from "../../utils/withErrorHandler";
import { createNodeFromTemplate } from "../registry/nodeTypeRegistry";
import { useNodeContext } from "../store/useNodeContext";
import { useEdgeContext } from "../../Edge/store/useEdgeContext";
import { useTransaction } from "@jalez/react-state-history";

export const useConnectionOperations = () => {
  const { 
    addNode, 
    nodeMap, 
    updateNode, 
    nodeParentIdMapWithChildIdSet 
  } = useNodeContext();
  
  const { 
    edges, 
    onEdgeAdd, 
    edgeMap 
  } = useEdgeContext();
  
  const { screenToFlowPosition } = useReactFlow();
  const { withTransaction } = useTransaction();
  const reactFlowInstance = useReactFlow();

  const addSourceNode = (childNode: Node<NodeData>) => {
    const realChildNode = nodeMap.get(childNode.id);
    if (!realChildNode) {
      console.error("Child node not found in nodeMap");
      return;
    }
    const newNodeId = `node-${Date.now()}`;

    // Position directly relative to child, without viewport transformations
    // Place parent 300px to the left of child
    const newPosition = {
      x: realChildNode.position.x - 300,
      y: realChildNode.position.y,
    };

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

    const newEdge: Edge = {
      id: `e-${newParentNode.id}-${realChildNode.id}`,
      source: newParentNode.id,
      target: realChildNode.id,
      sourceHandle: "right", // Default to right for source nodes
      targetHandle: "left"  // Default to left for target nodes
    };

    const updatedChildNode = {
      ...realChildNode,
      data: {
        ...realChildNode.data,
        parent: newNodeId,
      },
    };

    // updateNode(updatedChildNode);
    withTransaction(
      () => {
        
        updateNode(updatedChildNode);
        addNode(newParentNode);
        onEdgeAdd(newEdge);
      },
      "addSourceNodeTransaction" // Transaction name
    );

    // Focus view on both nodes
    reactFlowInstance.fitView({
      nodes: [newParentNode, updatedChildNode],
      duration: 500,
      padding: 0.2,
    });
  };

  const addTargetNode = (eventNode: Node<NodeData>) => {
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

    // Calculate vertical position
    let newY = eventNode.position.y;
    const VERTICAL_SPACING = 50;

    if (existingChildren.length > 0) {
      // Find a gap between existing children
      let gap = null;
      for (let i = 0; i < existingChildren.length - 1; i++) {
        const currentY = existingChildren[i].position.y;
        const nextY = existingChildren[i + 1].position.y;
        const space = nextY - currentY;

        if (space >= VERTICAL_SPACING * 1.5) {
          gap = currentY + space / 2;
          break;
        }
      }

      if (gap !== null) {
        // Position in the middle of the found gap
        newY = gap;
      } else {
        // Position below the last child with spacing
        newY =
          existingChildren[existingChildren.length - 1].position.y +
          VERTICAL_SPACING;
      }
    }

    // Position directly relative to parent - always 300px to the right
    const newPosition = {
      x: eventNode.position.x + 450,
      y: newY,
    };

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

    const newEdge: Edge = {
      id: `e-${eventNode.id}-${newNodeId}`,
      source: eventNode.id,
      target: newNodeId,
      sourceHandle: eventNode.type === "datanode" ? "right" : "bottom", // Data nodes use right, others use bottom
      targetHandle: eventNode.type === "datanode" ? "left" : "top"     // Data nodes use left, others use top
    };
    withTransaction(
      () => {
        addNode(newChildNode);
        onEdgeAdd(newEdge);
      },
      "addTargetNodeTransaction" // Transaction name
    );
  };

  const onConnect = useCallback(
    withErrorHandler("onConnect", (params: Connection) => {
      // Determine appropriate target handle based on source handle
      const targetHandle = params.sourceHandle === "left" ? "right" 
        : params.sourceHandle === "right" ? "left"
        : params.sourceHandle === "top" ? "bottom"
        : params.sourceHandle === "bottom" ? "top"
        : "left"; // Default to left if no source handle
        
      const connection = {
        ...params,
        targetHandle
      };
      
      onEdgeAdd(connection);
    }),
    [edgeMap, edges, onEdgeAdd]
  );

  const getCumulativeParentOffset = (
    node: Node<NodeData>
  ): { x: number; y: number } => {
    // Start with zero offset
    let offset = { x: 0, y: 0 };

    // Walk up parent chain
    let currentNode = node;
    while (currentNode.parentId) {
      // Find parent node
      const eventNode = nodeMap.get(currentNode.parentId);
      if (!eventNode) break;

      // Add parent position to accumulated offset
      offset.x += eventNode.position.x;
      offset.y += eventNode.position.y;

      // Move up the chain
      currentNode = eventNode;
    }

    return offset;
  };
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
            connectionState.fromNode
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

        // Add the new node

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
          "onConnectEndTransaction" // Transaction name
        );
      }
    },
    [screenToFlowPosition, addNode, onEdgeAdd, nodeMap, edges]
  );

  return {
    addSourceNode,
    addTargetNode,
    onConnect,
    onConnectEnd,
  };
};
