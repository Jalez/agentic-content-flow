/** @format */
import { useCallback, useEffect, useState } from "react";
import { Node, useReactFlow } from "@xyflow/react";
import { NodeData } from "../../types";
import { useNodeContext } from "../store/useNodeContext";
import { useSelect } from "../../Select/contexts/SelectContext";

interface UseNodeSelectionProps {
  nodes: Node<NodeData>[];
  isDragging: boolean;
}

/**
 * Custom hook for handling node selection in a mindmap
 */
const useNodeSelection = ({ nodes, isDragging }: UseNodeSelectionProps) => {
  const { fitView, getNodes } = useReactFlow();
  const { updateNodes, nodeMap, nodeParentIdMapWithChildIdSet } = useNodeContext();
  
  const [previousSelectionBox, setPreviousSelectionBox] =
    useState<DOMRect | null>(null);

  const { selectedNodes } = useSelect();

  useEffect(() => {
  }, [selectedNodes]);
  const changeParentSelectState = useCallback(
    (parentId: string, selected: boolean) => {
      const nodesToUpdate: Node<NodeData>[] = [];
      nodeParentIdMapWithChildIdSet.get(parentId)?.forEach((childId) => {
        const node = nodeMap.get(childId);
        if (node) {
          nodesToUpdate.push({
            ...node,
            selected: selected,
          });
        }
      })
      updateNodes(nodesToUpdate);
      
    },
    [nodeMap, nodeParentIdMapWithChildIdSet, updateNodes]
  );

  const handleSelectionDragStart = useCallback(
    (_: React.MouseEvent) => {
      //Set all nodeParents selectable properties to false
      nodeParentIdMapWithChildIdSet.forEach((_, parentId) => {
        changeParentSelectState(parentId, false);
      });

    },
    [changeParentSelectState, nodeParentIdMapWithChildIdSet]
  );

  /**
   * Handle node selection with touch/click
   */
  const handleNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      // If we're dragging, don't process the click
      if (isDragging) return;

      // Create a new array of nodes with updated selection states
      const updatedNodes = nodes.map((n) => ({
        ...n,
        selected: event.shiftKey
          ? // If shift is held, toggle selection only for clicked node
            n.id === node.id
            ? !n.selected
            : n.selected
          : // Otherwise, select only the clicked node
            n.id === node.id,
      }));

      // Update nodes through the store
      updateNodes(updatedNodes);
    },
    [nodes, isDragging, updateNodes]
  );

  /**
   * Get the currently selected node
   */
  const getSelectedNode = useCallback(() => {
    return nodes.find((node) => node.selected);
  }, [nodes]);

  const handleNodeDoubleClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      // Get all child nodes recursively
      const getAllChildNodes = (nodeId: string): Node[] => {
        const children = nodes.filter((n) => n.data.parent === nodeId);
        return [
          ...children,
          ...children.flatMap((child) => getAllChildNodes(child.id)),
        ];
      };

      // Get all children of the double-clicked node
      const childNodes = getAllChildNodes(node.id);

      // Include the clicked node and all its children in the viewport
      fitView({
        nodes: [node, ...childNodes],
        duration: 800,
        padding: 0.1,
      });
    },
    [nodes, fitView]
  );

  const DetermineNodeClickFunction = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.stopPropagation();

      //If its a right button click, ignore it
      if (event.button === 2) return;

      // If it's a double click, handle it with handleNodeDoubleClick
      if (event.detail === 2) {
        handleNodeDoubleClick(event, node);
      } else {
        // Otherwise, handle it with handleNodeClick
        handleNodeClick(event, node);
      }
    },
    [handleNodeClick, handleNodeDoubleClick]
  );

  // Handler for when selection operation ends (selection rect is released)
  const handleSelectionEnd = useCallback(() => {
    //Let all node parents selectable properties to true
    nodeParentIdMapWithChildIdSet.forEach((_, parentId) => {
      changeParentSelectState(parentId, true);
    });

    // Get currently selected nodes
    const selectedNodes = getNodes().filter((node) => node.selected);

    // Check if we have a multi-selection (shift+drag)
    if (selectedNodes.length > 1) {
      // Filter out container nodes
      const nonContainerNodes = selectedNodes.filter(
        (node) => !(node.type === "coursenode" || node.type === "modulenode")
      );

      // Update selection to exclude container nodes
      if (nonContainerNodes.length !== selectedNodes.length) {
        updateNodes(
          getNodes().map((node) => ({
            ...node,
            selected: nonContainerNodes.some((n) => n.id === node.id),
          }))
        );
      }
    }

    // Reset selection box state when selection ends
    setPreviousSelectionBox(null);
  }, [getNodes, nodeParentIdMapWithChildIdSet, changeParentSelectState, updateNodes]);

  return {
    handleNodeClick,
    handleSelectionDragStart,
    DetermineNodeClickFunction,
    getSelectedNode,
    isDragging,
    handleNodeDoubleClick,
    handleSelectionEnd,
    previousSelectionBox,
    setPreviousSelectionBox,
  };
};

export default useNodeSelection;
