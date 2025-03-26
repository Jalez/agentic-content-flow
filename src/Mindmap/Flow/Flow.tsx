import { MarkerType, ReactFlow, SelectionMode } from "@xyflow/react";
import { memo, useEffect, useMemo, useCallback, useRef } from "react";
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
  const { onEdgesChange, getVisibleEdges } = useEdgeState();
  const {
    onNodesChange,
    onNodeDragStart,
    onNodeDragStop,
    getVisibleNodes,
    isDragging,
  } = useNodeState();

  // Add ref for tracking panning performance
  const isPanning = useRef(false);
  const lastPanTime = useRef(0);

  const { onConnect, onConnectEnd } = useConnectionOperations();
  const {
    handleSelectionDragStart,
    DetermineNodeClickFunction,
    handleSelectionEnd,
  } = useNodeSelection({
    nodes: getVisibleNodes(),
    isDragging,
  });
  const { DetermineEdgeClickFunction } = useEdgeSelect({
    nodes: getVisibleNodes(),
    edges: getVisibleEdges(),
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

  // Use memo for visible nodes and edges
  const visibleNodes = useMemo(() => getVisibleNodes(), [getVisibleNodes]);
  const visibleEdges = useMemo(() => getVisibleEdges(), [getVisibleEdges]);

  // Optimize pan start/end handling
  const handlePanStart = useCallback(() => {
    console.log("Pan started");
    isPanning.current = true;
    lastPanTime.current = Date.now();
  }, []);

  const handlePanEnd = useCallback(() => {
    isPanning.current = false;
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
      onSelectionEnd={handleSelectionEnd}
      selectionKeyCode="Control"
      multiSelectionKeyCode="Control"
      fitView
      zoomOnScroll={true}
      zoomOnPinch={true}
      minZoom={VIEWPORT_CONSTRAINTS.MIN_ZOOM}
      maxZoom={VIEWPORT_CONSTRAINTS.MAX_ZOOM}
      panOnDrag={!layoutInProgress}
      onMoveStart={handlePanStart}
      onMoveEnd={handlePanEnd}
      panOnScroll={false}
    >
      {children}
    </ReactFlow>
  );
}

export default memo(Flow);
