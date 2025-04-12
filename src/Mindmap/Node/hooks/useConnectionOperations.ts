import { Node, Edge, useReactFlow, Connection } from "@xyflow/react";
import { NodeData } from "../../types";
import { useCallback } from "react";
import { withErrorHandler } from "../../utils/withErrorHandler";
import { createNodeFromTemplate } from "../registry/nodeTypeRegistry";
import { useNodeStore } from "../store/useNodeStore";
import { useEdgeStore } from "../../stores";
import { useTrackableState, useTransaction } from "@jalez/react-state-history";

// type useConnectionOperationsProps = {};

export const useConnectionOperations = () => {
  const { addNodeToStore, nodeMap, updateNode, nodeParentMap, removeNode } =
    useNodeStore();
  const { edges, addEdgeToStore, setEdges, edgeMap } = useEdgeStore();
  const { screenToFlowPosition } = useReactFlow();
  const { withTransaction } = useTransaction();
  const reactFlowInstance = useReactFlow();
  const trackAddNodeToStore = useTrackableState(
    "useConnectionOperations/AddSourceNode",
    addNodeToStore,
    removeNode
  );

  const trackAddEdgeToStore = useTrackableState(
    "useConnectionOperations/AddEdgeToStore",
    addEdgeToStore,
    setEdges
  );

  const trackUpdateNodeToStore = useTrackableState(
    "useConnectionOperations/UpdateNodeToStore",
    updateNode
  );

  const addSourceNode = (childNode: Node<NodeData>) => {
    console.log("Adding parent node to child node", childNode);
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
        trackUpdateNodeToStore(
          updatedChildNode,
          realChildNode,
          `Update Child Node to ${newParentNode.id}`
        );
        trackAddNodeToStore(
          newParentNode,
          newParentNode.id,
          `Add Parent Node to ${childNode.id}`
        );
        trackAddEdgeToStore(
          newEdge,
          edges,
          `Add Edge from ${newParentNode.id} to ${realChildNode.id}`
        );
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

    // Find existing children of this parent
    //filter performance: O(n) for each node
    // sort performance: O(n log n) for each node
    // This is acceptable for a small number of nodes, but could be optimized for larger datasets
    // by using a more efficient data structure or algorithm: data strucutre like a map, where key is parentId and value is an array of children
    const existingChildren = nodeParentMap
      .get(eventNode.id)
      // ?.filter((node) => node.data.level === childLevel)
      // .filter((node) => node.data.parent === eventNode.id)
      ?.sort((a, b) => a.position.y - b.position.y) as Node<NodeData>[];

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
    };
    console.log("ADDING NEW CHILD NODE TO STORE", newChildNode);
    console.log("ADDING NEW EDGE TO STORE", newEdge);
    withTransaction(
      () => {
        trackAddNodeToStore(
          newChildNode,
          newChildNode.id,
          `Create target Node of ${eventNode.id}`
        );
        trackAddEdgeToStore(
          newEdge,
          edges,
          `Create Edge from ${eventNode.id} to ${newChildNode.id}`
        );
      },
      "addTargetNodeTransaction" // Transaction name
    );
  };

  const onConnect = useCallback(
    withErrorHandler("onConnect", (params: Connection) => {
      trackAddEdgeToStore(
        params,
        edges,
        `Add Edge from ${params.source} to ${params.target}`
      );
    }),
    [edgeMap, edges, trackAddEdgeToStore]
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
          console.log("Adjusted relative position:", position);
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

        // Create an edge from the source to the new node
        const newEdge = {
          id: `e-${connectionState.fromNode.id}-${newNodeId}`,
          source: connectionState.fromNode.id,
          target: newNodeId,
        };
        console.log("ON CONNECT END NEW NODE", newNode);
        console.log("ON CONNECT END NEW EDGE", newEdge);
        withTransaction(
          () => {
            trackAddNodeToStore(
              newNode,
              newNode.id,
              `Add New Node from ${connectionState.fromNode.id}`
            );
            trackAddEdgeToStore(
              newEdge,
              edges,
              `Add Edge from ${connectionState.fromNode.id} to ${newNodeId}`
            );
          },
          "onConnectEndTransaction" // Transaction name
        );
      }
    },
    [screenToFlowPosition, addNodeToStore, addEdgeToStore, nodeMap, edges]
  );

  return {
    addSourceNode,
    addTargetNode,
    onConnect,
    onConnectEnd,
  };
};
