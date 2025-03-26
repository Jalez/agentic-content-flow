/** @format */
import { useCallback, useState, useRef, useMemo } from "react";
import { NodeChange, applyNodeChanges, Node } from "@xyflow/react";
import { NodeData } from "../../types";
import { useNodeStore } from "../../stores";

export const useNodeState = () => {
  const nodes = useNodeStore((state) => state.nodes);
  const setNodes = useNodeStore((state) => state.setNodes);
  const updateNodes = useNodeStore((state) => state.updateNodes);
  const [isDragging, setIsDragging] = useState(false);

  // Local state for tracking node positions during drag
  const [localNodes, setLocalNodes] = useState<Node<NodeData>[]>([]);
  const isDraggingRef = useRef(false);

  // Remove unnecessary console.log calls for better performance
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // return;
      if (
        changes.some((change) => change.type === "position") &&
        isDraggingRef.current
      ) {
        // During dragging, only update the local nodes state without touching the store
        setLocalNodes(
          (prev) =>
            applyNodeChanges(
              changes,
              prev.length > 0 ? prev : nodes
            ) as Node<NodeData>[]
        );
      } else if (!isDraggingRef.current) {
        // For non-dragging changes, update the store normally
        const updatedNodes = applyNodeChanges(
          changes,
          nodes
        ) as Node<NodeData>[];

        // Remove console.log for better performance
        updateNodes(updatedNodes);
      }
    },
    [nodes, updateNodes]
  );

  const onNodeDragStart = useCallback(() => {
    setIsDragging(true);
    isDraggingRef.current = true;
    // Initialize local nodes state with current nodes when drag starts
    setLocalNodes(nodes);
  }, [nodes]);

  const onNodeDragStop = useCallback(() => {
    setIsDragging(false);
    isDraggingRef.current = false;

    // Only update the store when dragging is complete
    if (localNodes.length > 0) {
      // Remove console.log for better performance
      updateNodes(localNodes);
      // Clear local nodes to avoid stale state
      setLocalNodes([]);
    }
  }, [localNodes, updateNodes]);

  const handleNodeEdit = useCallback(
    (nodeId: string, label: string, details: string) => {
      console.log("Node edit triggered");
      // Remove console.log for better performance
      const updatedNodes = nodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                label,
                details,
              },
            }
          : node
      );
      updateNodes(updatedNodes);
    },
    [nodes, updateNodes]
  );

  const getVisibleNodes = useCallback(() => {
    // Remove console.log for better performance
    // Return local nodes during drag, otherwise return store nodes
    return isDraggingRef.current && localNodes.length > 0 ? localNodes : nodes;
  }, [nodes, localNodes]);

  // Memoize the displayed nodes to prevent unnecessary recalculations
  const displayedNodes = useMemo(() => getVisibleNodes(), [getVisibleNodes]);

  return {
    displayedNodes,
    nodes: displayedNodes, // Return the same memoized value
    setNodes,
    onNodesChange,
    handleNodeEdit,
    getVisibleNodes,
    isDragging,
    onNodeDragStop,
    onNodeDragStart,
  };
};
