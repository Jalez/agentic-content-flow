/** @format */
import { useCallback, useState, useRef } from "react";
import { Node, useReactFlow, useViewport } from "@xyflow/react";
import { NodeData } from "../../types";
import { useNodeStore } from "../../stores";
import { getPotentialParentId } from "./utils/getPotentialParents";
import {
  updateNodeExtentInLocalNodes
} from "./utils/dragUtils";
import { getDragResistance, dragStartTimes } from "./utils/getDragResistance";

// Define the root indicator string as a constant
const ROOT_INDICATOR = "no-parent";

/**
 * A custom hook for handling node dragging behavior in a mindmap.
 */
export const useNodeDrag = (trackUpdateNodes: (nodes: Node<NodeData>[], previousNodes: Node<NodeData>[]) => void) => {
  const updateNode = useNodeStore((state) => state.updateNode);
  const nodes = useNodeStore((state) => state.nodes);
  const nodeMap = useNodeStore((state) => state.nodeMap);
  const nodeParentMap = useNodeStore((state) => state.nodeParentMap);

  const { getIntersectingNodes, getNode } = useReactFlow();
  const { x, y, zoom } = useViewport();

  const [isDragging, setIsDragging] = useState(false);
  const [localNodes, setLocalNodes] = useState<Node<NodeData>[]>([]);
  const [currentParentCandidateId, setCurrentParentCandidateId] = useState<string | null>(null);
  const isDraggingRef = useRef(false);



  // Handle drag start
  const onNodeDragStart = useCallback((_: React.MouseEvent, __: Node<NodeData>, nodesToDrag: Node<NodeData>[]) => {
    console.log("DRAG STARTING", nodesToDrag);

    
    setIsDragging(true);
    isDraggingRef.current = true;
    // Create a map of the nodes to drag where the nodeId is the key
    const nodesToDragMap = new Map<string, Node<NodeData>>();
    nodesToDrag.forEach((node) => {
      node.selected = true;
      nodesToDragMap.set(node.id, node);
      //nodeMap.set(node.id, node);
    });

    const updatedNodes = nodes.map((n) => {

      return {
        ...n,
        selected: nodesToDragMap.has(n.id),
        data: {
          ...n.data,
          highlighted: false
        },
      };

    });

    setLocalNodes(updatedNodes);
  }, [nodes, updateNode]);

  /**
   * Helper function to update node highlighting
   */
  const updateNodeHighlight = useCallback((nodeId: string, highlighted: boolean) => {
    const node = nodeMap.get(nodeId);
    if (!node || !isDraggingRef.current) return null;
    const updatedNode = {
      ...node,
      data: {
        ...node.data,
        highlighted
      },
    } as Node<NodeData>;
    //updateNode(updatedNode);

    console.log("Updating node highlight:", nodeId, highlighted, node);
    setLocalNodes(prev =>
      prev.map(n => n.id === nodeId ? updatedNode : n)
    );

  }, [nodeMap, setLocalNodes, localNodes]);

  /**
   * Helper function to clear highlighting from current parent candidate
   */
  const clearCurrentParentHighlight = useCallback(() => {
    if (currentParentCandidateId) {
      updateNodeHighlight(currentParentCandidateId, false);
      setCurrentParentCandidateId(null);
    }
  }, [currentParentCandidateId, updateNodeHighlight]);

  // Handle drag in progress
  const onNodeDrag = useCallback(
    (event: React.MouseEvent, draggedNode: Node<NodeData>, _: Node<NodeData>[]) => {
      // Handle breaking free from parent
      const parentNode = nodeMap.get(draggedNode?.parentId || "");
      //console.log("node", draggedNode)
      if (parentNode) {
        console.log("Parent node found:", parentNode.id);
        // Get mouse position from event and transform to flow coordinates
        const mousePosition = {
          x: (event.clientX - x) / zoom,
          y: (event.clientY - y) / zoom
        };

        // Get the actual current node position from React Flow
        const currentNodeState = getNode(draggedNode.id) as Node<NodeData> | null;
        const nodeWithUpdatedPosition = currentNodeState || draggedNode;

        // Check if node should break free using our simplified resistance logic
        const { shouldBreakFree } = getDragResistance(
          nodeWithUpdatedPosition,
          mousePosition,
          parentNode
        );

        if (shouldBreakFree) {
          // Update local nodes for visual representation during drag
          setLocalNodes(prevNodes =>
            updateNodeExtentInLocalNodes(prevNodes, draggedNode.id, true)
          );
        }
      }


      // Handle parent candidate selection
      const intersectingNodes = getIntersectingNodes(draggedNode);

      // No intersecting nodes - we are suggesting it becomes a root node
      if (intersectingNodes.length === 0 || !draggedNode.id) {
        clearCurrentParentHighlight();
        setCurrentParentCandidateId(null);
        return;
      }

      const potentialParentId = getPotentialParentId(
        draggedNode,
        intersectingNodes,
        nodeParentMap,
        nodeMap,
        ROOT_INDICATOR
      );

      if (potentialParentId === ROOT_INDICATOR) {
        // If the potential parent is the root indicator, clear the current parent highlight
        clearCurrentParentHighlight();
        setCurrentParentCandidateId(null);
        return;
      }


      if (currentParentCandidateId === potentialParentId) return;
      clearCurrentParentHighlight();
      updateNodeHighlight(potentialParentId, true);
      setCurrentParentCandidateId(potentialParentId);
    },
    [
      getIntersectingNodes,
      nodeParentMap,
      nodeMap,
      currentParentCandidateId,
      updateNode,
      localNodes,
      x,
      y,
      zoom,
      getNode,
      clearCurrentParentHighlight,
      updateNodeHighlight
    ]
  );

  // Handle drag end
  const onNodeDragStop = useCallback((_: React.MouseEvent, node: Node<NodeData>) => {
    setIsDragging(false);
    isDraggingRef.current = false;
    console.log("STOPPING DRAGGING", node.id);

    // Reset drag start time for this node
    if (node.id) {
      dragStartTimes.delete(node.id);
    }

    const updatedLocalNodes = [...localNodes];

    // Update parent relationship if there's a candidate
    if (currentParentCandidateId) {
      // If the candidate is the root indicator, remove parentId

      updatedLocalNodes.forEach((localNode) => {
        if (localNode.id === currentParentCandidateId) {
          localNode.data.highlighted = false;
        }
        if (localNode.id === node.id) {
          console.log("Setting ", currentParentCandidateId, " as parentId for node:", localNode.id);
          localNode.parentId = currentParentCandidateId;


        }
      });
      setCurrentParentCandidateId(null);
    } else {
      // If no parent candidate is set, the node should become a root node
      updatedLocalNodes.forEach((localNode) => {
        if (localNode.id === node.id && localNode.parentId) {
          console.log("Setting node as root (no parent):", localNode.id);
          localNode.parentId = undefined;

        }
      });
    }

    console.log("Updated local nodes after drag stop:", updatedLocalNodes);
    // Commit changes to node state
    if (updatedLocalNodes.length > 0) {
      //setLocalNodes(updatedLocalNodes);
      // Update the nodes in the store
      trackUpdateNodes(updatedLocalNodes, nodes);
      setLocalNodes([]);
    }
  }, [localNodes, nodes, currentParentCandidateId]);

  return {
    isDragging,
    isDraggingRef,
    localNodes,
    setLocalNodes,
    onNodeDragStart,
    onNodeDragStop,
    onNodeDrag,
  };
};