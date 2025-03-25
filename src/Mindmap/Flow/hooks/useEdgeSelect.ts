/** @format */
import { useCallback, useState } from "react";
import { Edge, Node, useReactFlow } from "@xyflow/react";
import { NodeData } from "../../types";
import { withErrorHandler } from "../../utils/withErrorHandler";

interface useEdgeSelectProps {
  nodes: Node<NodeData>[];
  edges: Edge[];
}

interface EdgeNavigationResult {
  DetermineEdgeClickFunction: (event: React.MouseEvent, edge: Edge) => void;
}

/**
 * Hook to manage edge navigation and related node selection
 */
export function useEdgeSelect({
  nodes,
  edges,
}: useEdgeSelectProps): EdgeNavigationResult {
  const { setNodes, setEdges, getNodes, fitView } = useReactFlow();
  const [isNavigating, setIsNavigating] = useState(false);
  const [selectedEdges, setSelectedEdges] = useState<Edge[]>([]);

  /**
   * Navigate to and select a node
   */
  const displayEdgeNodes = useCallback(
    (edgeTo: Node, edgeFrom: Node) => {
      setIsNavigating(true);
      setNodes((nds) =>
        nds.map((node) => ({
          ...node,
          selected: node.id === edgeTo.id || node.id === edgeFrom.id,
        }))
      );

      fitView({
        nodes: [edgeTo, edgeFrom],
        duration: 1000,
        padding: 0.1,
      });
      setIsNavigating(false);
    },
    [nodes, setNodes, fitView]
  );

  const handleEdgeClick = useCallback(
    withErrorHandler("handleEdgeDoubleClick", (edge: Edge) => {
      // Get current selected nodes to maintain their selection

      // Check if this edge is already selected
      const isAlreadySelected = selectedEdges.find(
        (e) => e.id === edge.id
      )?.selected;

      // Update edge selection based on multi-select mode and current selection state
      setSelectedEdges(
        edges.map((e) => {
          // If this is the clicked edge
          if (e.id === edge.id) {
            // Toggle selection if it's already selected
            if (isAlreadySelected) {
              return {
                ...e,
                selected: false,
              };
            }
            // Otherwise select it
            return {
              ...e,
              selected: true,
            };
          }
          return {
            ...e,
            selected: false,
          };
        })
      );

      const selectedNodes = getNodes().filter((node) => node.selected);

      // Restore node selection
      if (selectedNodes.length > 0) {
        setNodes((nds) =>
          nds.map((node) => ({
            ...node,
            selected: selectedNodes.some(
              (selectedNode) => selectedNode.id === node.id
            ),
          }))
        );
      }
    }),
    [isNavigating, edges, getNodes, setEdges, setNodes]
  );

  /**
   * Handle edge click with intelligent navigation
   */
  const handleEdgeDoubleClick = useCallback(
    withErrorHandler("handleEdgeDoubleClick", (edge: Edge) => {
      // Don't process clicks while navigating

      const sourceNode = nodes.find((n) => n.id === edge.source);
      const targetNode = nodes.find((n) => n.id === edge.target);

      if (!sourceNode || !targetNode) return;
      displayEdgeNodes(sourceNode, targetNode);
    }),
    [nodes, displayEdgeNodes]
  );

  const DetermineEdgeClickFunction = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      const isMultiSelect = event.ctrlKey || event.metaKey;
      // Handle other edges based on multi-select mode
      if (isMultiSelect) {
        // Keep other edges' selection state in multi-select mode
        return event;
      }
      if (isNavigating) return;
      event.stopPropagation();
      // If it's a double click, handle it with handleEdgeDoubleClick
      if (event.detail === 2) {
        handleEdgeDoubleClick(edge);
      } else {
        // Otherwise, handle it with handleEdgeClick
        handleEdgeClick(edge);
      }
    },
    [handleEdgeClick, handleEdgeDoubleClick]
  );

  return {
    DetermineEdgeClickFunction,
  };
}
