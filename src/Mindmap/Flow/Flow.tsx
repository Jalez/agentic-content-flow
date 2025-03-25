import { MarkerType, ReactFlow, SelectionMode } from "@xyflow/react";
import { memo, useEffect, useMemo, useCallback } from "react";
import { useNodeState } from "./hooks/useNodeState";
import { useEdgeState } from "./hooks/useEdgeState";
import useNodeSelection from "./hooks/useNodeSelect";
import { useEdgeSelect } from "./hooks/useEdgeSelect";
import { VIEWPORT_CONSTRAINTS } from "../constants";
import { useConnectionOperations } from "../Node/hooks/useConnectionOperations";
import { useNodeTypeRegistry } from "../Node/registry/nodeTypeRegistry";
import { ensureNodeTypesRegistered } from "../Nodes/registerBasicNodeTypes";

import { useLayoutManager } from "../Layout/hooks/useLayoutManager";
import { useLayoutStore } from "../stores";

const defaultEdgeOptions = {
  zIndex: 1,
  type: "default",
  animated: true,
  markerEnd: { type: MarkerType.Arrow },
};

function Flow({ children }: { children?: React.ReactNode }) {
  const { edges, onEdgesChange, getVisibleEdges } = useEdgeState();
  const {
    displayedNodes,
    onNodesChange,
    onNodeDragStart,
    onNodeDragStop,
    getVisibleNodes,
    isDragging,
  } = useNodeState();
  const { onConnect, onConnectEnd } = useConnectionOperations();
  const {
    handleSelectionDragStart,
    DetermineNodeClickFunction,
    handleSelectionEnd,
  } = useNodeSelection({
    nodes: displayedNodes,
    isDragging,
  });
  const { DetermineEdgeClickFunction } = useEdgeSelect({
    nodes: displayedNodes,
    edges,
  });

  // Initialize the layout manager
  const { layoutInProgress } = useLayoutManager();
  const { autoLayout } = useLayoutStore((state) => state);

  // Ensure node types are registered on component mount
  useEffect(() => {
    ensureNodeTypesRegistered();
  }, []);

  // Use the improved node type registry hook
  const { nodeTypes } = useNodeTypeRegistry();

  // Re-enable memoization to prevent re-renders during panning
  const visibleNodes = useMemo(() => getVisibleNodes(), [getVisibleNodes]);
  const visibleEdges = useMemo(() => getVisibleEdges(), [getVisibleEdges]);

  // Memoize event handlers that don't need to be recreated on every render
  const handleSelectionDrag = useCallback(() => {
    // Remove console.log for performance
  }, []);

  const handleSelectionChange = useCallback((nodes) => {
    // Remove console.log for performance
  }, []);

  return (
    <ReactFlow
      nodeTypes={nodeTypes}
      defaultEdgeOptions={defaultEdgeOptions}
      nodes={visibleNodes}
      onNodesChange={onNodesChange}
      onNodeDragStart={onNodeDragStart}
      onNodeDragStop={onNodeDragStop}
      onNodeClick={DetermineNodeClickFunction}
      onNodeDoubleClick={DetermineNodeClickFunction}
      edges={visibleEdges}
      onEdgesChange={onEdgesChange}
      onEdgeClick={DetermineEdgeClickFunction}
      onEdgeDoubleClick={DetermineEdgeClickFunction}
      onConnect={onConnect}
      onConnectEnd={onConnectEnd}
      // Enable node functionality
      nodesFocusable={true}
      nodesConnectable={true}
      nodesDraggable={!layoutInProgress && !autoLayout}
      elementsSelectable={true}
      selectionMode={SelectionMode.Partial}
      selectNodesOnDrag={true}
      onSelectionStart={handleSelectionDragStart}
      onSelectionDrag={handleSelectionDrag}
      onSelectionChange={handleSelectionChange}
      onSelectionEnd={handleSelectionEnd}
      // Remove or comment out these debug logs that can cause lag
      // onDragStart={() => console.log("drag start")}
      // onDragEnd={() => console.log("drag end")}
      // onDragOverCapture={() => console.log("drag over")}
      // onDragEnter={() => console.log("drag enter")}
      // multiSelectionKeyCode="Shift"
      //Lets change the multiSelectionKeyCode to be "Control" instead of "Shift"
      // selectionKeyCode="Control"
      // multiSelectionKeyCode="Control"
      fitView
      zoomOnScroll={true}
      zoomOnPinch={true}
      minZoom={VIEWPORT_CONSTRAINTS.MIN_ZOOM}
      maxZoom={VIEWPORT_CONSTRAINTS.MAX_ZOOM}
      panOnDrag={!layoutInProgress}
      panOnScroll={false}
    >
      {children}
    </ReactFlow>
  );
}

export default memo(Flow);
