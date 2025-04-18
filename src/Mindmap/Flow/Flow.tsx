import { MarkerType, ReactFlow, SelectionMode } from "@xyflow/react";
import { memo, useEffect, useCallback, useRef } from "react";
import { useNodeState } from "../Node/hooks/useNodeState";
import { useEdgeState } from "../Edge/hooks/useEdgeState";
import useNodeSelection from "../Node/hooks/useNodeSelect";
import { useEdgeSelect } from "../Edge/hooks/useEdgeSelect";
import { VIEWPORT_CONSTRAINTS } from "../constants";
import { useConnectionOperations } from "../Node/hooks/useConnectionOperations";
import { useNodeTypeRegistry } from "../Node/registry/nodeTypeRegistry";
import { ensureNodeTypesRegistered } from "../Nodes/registerBasicNodeTypes";
import { useSelect } from "../Select/contexts/SelectContext";

const defaultEdgeOptions = {
  zIndex: 1,
  type: "default",
  animated: true,
  markerEnd: { type: MarkerType.Arrow },
};

function Flow({ children }: { children?: React.ReactNode }) {
  const { visibleEdges, onEdgesChange } = useEdgeState();
  const {
    displayedNodes,
    onNodesChange,
    onNodeDragStart,
    onNodeDrag,
    onNodeDragStop,
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
    nodes: displayedNodes,
    isDragging,
  });
  const { DetermineEdgeClickFunction } = useEdgeSelect({
    nodes: displayedNodes,
    edges: visibleEdges,
  });

  // Add this to get clearSelection
  const { clearSelection } = useSelect();
  const handleClearSelection = useCallback(() => {
    clearSelection();
  }
  , [clearSelection]);
  const { nodeTypes } = useNodeTypeRegistry();

  // Ensure node types are registered on component mount
  useEffect(() => {
    ensureNodeTypesRegistered();
  }, []);

  // Use the improved node type registry hook

  // Optimize pan start/end handling
  const handlePanStart = useCallback(() => {
    isPanning.current = true;
    lastPanTime.current = Date.now();
  }, []);

  const handlePanEnd = useCallback(() => {
    isPanning.current = false;
  }, []);

const findSelectedFromNodes = () => {  
  
  const selectedNodes = displayedNodes.filter((node) => node.selected);
}
findSelectedFromNodes();

  return (
    <ReactFlow
      nodeTypes={nodeTypes}
      defaultEdgeOptions={defaultEdgeOptions}
      nodes={displayedNodes}
      onNodesChange={onNodesChange}
      onNodeDragStart={onNodeDragStart}
      onNodeDrag={onNodeDrag}
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
      onMoveStart={handlePanStart}
      onMoveEnd={handlePanEnd}
      panOnScroll={false}
      // Add this handler:
      onPaneClick={handleClearSelection}
    >
      {children}
    </ReactFlow>
  );
}

export default memo(Flow);
