/** @format */
import { useCallback, useState, useRef } from "react";
import { Node, useReactFlow, useViewport } from "@xyflow/react";
import { NodeData } from "../../types";
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
export const useNodeDrag = (
  trackUpdateNodes: (nodes: Node<NodeData>[], previousNodes: Node<NodeData>[], description: string) => void,
  nodes: Node<NodeData>[],
  nodeMap: Map<string, Node<NodeData>>,
  nodeParentIdMapWithChildIdSet: Map<string, Set<string>>,
  updateNode?: (node: Node<NodeData>) => void
) => {
  const { getIntersectingNodes, getNode } = useReactFlow();
  const { x, y, zoom } = useViewport();

  const [isDragging, setIsDragging] = useState(false);
  const [localNodes, setLocalNodes] = useState<Node<NodeData>[]>([]);
  const [currentParentCandidateId, setCurrentParentCandidateId] = useState<string | null>(null);
  const isDraggingRef = useRef(false);

  // Handle drag start
  const onNodeDragStart = useCallback((_: React.MouseEvent, __: Node<NodeData>, nodesToDrag: Node<NodeData>[]) => {
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
    (event: React.MouseEvent, draggedNode: Node<NodeData>, draggedNodes: Node<NodeData>[]) => {
      // Handle breaking free from parent for all dragged nodes
      const mousePosition = {
        x: (event.clientX - x) / zoom,
        y: (event.clientY - y) / zoom
      };
      draggedNodes.forEach((dn) => {
        const parent = nodeMap.get(dn.parentId || "");
        if (!parent) return;
        const currentState = (getNode(dn.id) as Node<NodeData>) || dn;
        const { shouldBreakFree } = getDragResistance(
          currentState,
          mousePosition,
          parent
        );
        if (shouldBreakFree) {
          setLocalNodes(prev =>
            updateNodeExtentInLocalNodes(prev, dn.id, true)
          );
        }
      });

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
        nodeParentIdMapWithChildIdSet,
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
      nodeParentIdMapWithChildIdSet,
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
  const onNodeDragStop = useCallback((_: React.MouseEvent, draggedNode: Node<NodeData>, draggedNodes: Node<NodeData>[]) => {
    setIsDragging(false);
    isDraggingRef.current = false;

    // Reset drag start times for all dragged nodes
    draggedNodes.forEach(dn => {
      if (dn.id) dragStartTimes.delete(dn.id);
    });

    const updatedLocalNodes = draggedNodes;

    const intersectingNodes = getIntersectingNodes(draggedNode);

    const potentialParentId = getPotentialParentId(
      draggedNode,
      intersectingNodes,
      nodeParentIdMapWithChildIdSet,
      nodeMap,
      ROOT_INDICATOR
    );


    // Update parent relationships for all dragged nodes
    if (potentialParentId && potentialParentId !== ROOT_INDICATOR) {
      // Clear highlight on the candidate
      updatedLocalNodes.forEach(localNode => {
        if (localNode.id === potentialParentId) {
          localNode.data.highlighted = false;
        }
        // Assign new parent to each dragged node
        if (draggedNodes.some(dn => dn.id === localNode.id)) {
          localNode.parentId = potentialParentId;
          localNode.extent = "parent";
        }
      });
      setCurrentParentCandidateId(null);
    } else {
      // If no parent candidate, make each dragged node a root
      updatedLocalNodes.forEach(localNode => {
        if (draggedNodes.some(dn => dn.id === localNode.id) && localNode.parentId) {
          localNode.parentId = undefined;
          delete localNode.extent;
        }
      });
    }

    // Commit changes to node state
    if (updatedLocalNodes.length > 0) {
      //setLocalNodes(updatedLocalNodes);
      // Update the nodes in the store
      trackUpdateNodes(updatedLocalNodes, nodes, "Update nodes on drag stop");
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