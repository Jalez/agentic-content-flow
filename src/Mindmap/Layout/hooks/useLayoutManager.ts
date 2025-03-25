/** @format */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Edge, Node, useReactFlow } from "@xyflow/react";
import { useNodeStore, useEdgeStore } from "../../stores";
import { useLayoutStore } from "../store/useLayoutStore";
import { getLayoutCacheKey } from "../layoutUtils";
import { getSourcePosition, getTargetPosition } from "../utils/layoutUtils";

/**
 * Custom hook for managing layout operations
 * Provides functions for applying layouts and handles automatic layout
 */
export const useLayoutManager = () => {
  const { nodes, setNodes } = useNodeStore();
  const { edges, setEdges } = useEdgeStore();
  const { fitView } = useReactFlow();
  const [oldNodesSize, setOldNodesSize] = useState<Number>(0);
  const {
    direction,
    algorithm,
    autoLayout,
    layoutInProgress,
    setLayoutInProgress,
    getElkOptions,
  } = useLayoutStore();

  const sourcePosition = useMemo(
    () => getSourcePosition(direction),
    [direction]
  );
  const targetPosition = useMemo(
    () => getTargetPosition(direction),
    [direction]
  );
  // Map layout direction to handle positions

  // Single ref to track if layout is being applied
  const isApplyingLayoutRef = useRef(false);

  // Ref to track if handle positions are being updated
  const isUpdatingHandlesRef = useRef(false);

  // Layout cache to prevent unnecessary recalculations
  const layoutCacheRef = useRef<Map<string, { nodes: Node[]; edges: Edge[] }>>(
    new Map()
  );

  // Track container nodes separately from leaf nodes
  const getContainerNodeIds = useCallback(() => {
    // A node is a container if it has at least one child node
    return new Set(
      nodes
        .filter((node) => nodes.some((n) => n.parentId === node.id))
        .map((node) => node.id)
    );
  }, [nodes]);

  /**
   * Fit all nodes in the view with proper padding for containers
   */
  const fitAllNodes = useCallback(() => {
    fitView({
      padding: 0.2,
      duration: 800,
      includeHiddenNodes: false,
    });
  }, [fitView]);

  /**
   * Update handle positions for all nodes based on current layout direction
   * This version prevents infinite update loops
   */
  const updateHandlePositions = useCallback(() => {
    // Exit early if we're already updating handles to prevent infinite loops
    if (isUpdatingHandlesRef.current) {
      return;
    }

    // Set flag to prevent re-entry
    isUpdatingHandlesRef.current = true;

    try {
      // Check if handle positions actually need to be updated
      const needsUpdate = nodes.some(
        (node) =>
          node.sourcePosition !== sourcePosition ||
          node.targetPosition !== targetPosition
      );

      // Only update if necessary
      if (needsUpdate) {
        setNodes(
          nodes.map((node) => ({
            ...node,
            sourcePosition,
            targetPosition,
          }))
        );
      }
    } finally {
      // Clear flag after a short delay to allow state to settle
      setTimeout(() => {
        isUpdatingHandlesRef.current = false;
      }, 50);
    }
  }, [nodes, setNodes, sourcePosition, targetPosition]);

  /**
   * Apply a layout to the current nodes and edges
   */
  const applyCurrentLayout = useCallback(async () => {
    // Skip if already in progress or no nodes
    if (layoutInProgress || isApplyingLayoutRef.current || nodes.length === 0) {
      return;
    }

    try {
      // Set flags to prevent concurrent layout operations
      setLayoutInProgress(true);
      isApplyingLayoutRef.current = true;

      // Get handle positions based on current direction
      const sourcePosition = getSourcePosition(direction);
      const targetPosition = getTargetPosition(direction);

      // Ensure all nodes have correct handle positions before layout
      const nodesWithHandles = nodes.map((node) => ({
        ...node,
        sourcePosition,
        targetPosition,
      }));

      // Generate cache key and check cache
      const cacheKey = getLayoutCacheKey(
        direction,
        algorithm,
        nodesWithHandles,
        edges
      );
      let result: { nodes: Node[]; edges: Edge[] };

      if (layoutCacheRef.current.has(cacheKey)) {
        // Use cached layout result
        result = layoutCacheRef.current.get(cacheKey)!;
      } else {
        // Get current selected node IDs to preserve selection
        const selectedNodeIds = new Set(
          nodes.filter((node) => node.selected).map((node) => node.id)
        );

        // Get container node IDs
        const containerNodeIds = getContainerNodeIds();

        // Calculate new layout
        // result = await applyLayout(nodesWithHandles, edges, getElkOptions());

        // // Restore selection states and ensure containers maintain proper dimensions
        // result.nodes = result.nodes.map((node) => ({
        //   ...node,
        //   selected: selectedNodeIds.has(node.id) ? true : node.selected,
        //   // Ensure container nodes have their dimensions preserved in style
        //   style: containerNodeIds.has(node.id)
        //     ? {
        //         ...node.style,
        //         width: node.width,
        //         height: node.height,
        //       }
        //     : node.style,
        // }));

        // // Cache the result
        // layoutCacheRef.current.set(cacheKey, result);
      }

      // // Apply the layout
      // setNodes(result.nodes);
      // setEdges(result.edges);

      // Fit nodes into view after applying layout
      // setTimeout(() => {
      //   fitAllNodes();
      // }, 100);
    } catch (error) {
      console.error("Error applying layout:", error);
    } finally {
      // Clear flags
      setLayoutInProgress(false);
      isApplyingLayoutRef.current = false;
    }
  }, [
    nodes,
    edges,
    sourcePosition,
    targetPosition,
    algorithm,
    layoutInProgress,
    setLayoutInProgress,
    setNodes,
    setEdges,
    getElkOptions,
    fitAllNodes,
    getContainerNodeIds,
  ]);

  // Auto-layout effect for initial layout and when nodes are added/removed
  useEffect(() => {
    if (oldNodesSize === nodes.length) return;

    if (autoLayout) {
      applyCurrentLayout();
    }

    setOldNodesSize(nodes.length);
  }, [autoLayout, nodes.length, applyCurrentLayout]);

  // Update handle positions when direction changes
  // This effect is now more careful to avoid infinite loops
  useEffect(() => {
    // We use a flag in a ref to ensure we don't trigger updates within updates
    if (!isUpdatingHandlesRef.current) {
      updateHandlePositions();

      // If auto-layout is enabled, apply layout after handle positions update
      if (autoLayout) {
        // Delay to ensure handle update completes first
        setTimeout(() => {
          applyCurrentLayout();
        }, 100);
      }
    }
  }, [direction]); // Only depend on direction changes

  /**
   * Clear the layout cache
   */
  const clearLayoutCache = useCallback(() => {
    layoutCacheRef.current.clear();
  }, []);

  return {
    sourcePosition,
    targetPosition,
    applyLayout: applyCurrentLayout,
    fitAllNodes,
    layoutInProgress,
    clearLayoutCache,
    updateHandlePositions,
    getContainerNodeIds,
  };
};
