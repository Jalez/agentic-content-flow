import { Edge, MarkerType, Node, ReactFlow, SelectionMode, useOnSelectionChange } from "@xyflow/react";
import { memo, useEffect, useCallback, useRef, useMemo } from "react";
import useNodeSelection from "../Node/hooks/useNodeSelect";
import { useEdgeSelect } from "../Edge/hooks/useEdgeSelect";
import { VIEWPORT_CONSTRAINTS } from "../constants";
import { useConnectionOperations } from "../Node/hooks/useConnectionOperations";
import { useNodeTypeRegistry } from "../Node/registry/nodeTypeRegistry";
import { ensureNodeTypesRegistered } from "../Nodes/registerBasicNodeTypes";
import { useSelect } from "../Select/contexts/SelectContext";
import { useNodeContext } from "../Node/store/useNodeContext";
import { useEdgeContext } from "../Edge/store/useEdgeContext";
// Import the grid controls registration
import GridControlsRegistration from "./controls/GridControlsRegistration";
import { useLayoutContext } from "@jalez/react-flow-automated-layout";
import { useTransaction } from "@jalez/react-state-history";


const defaultEdgeOptions = {
  zIndex: 1,
  type: "default",
  animated: true,
  markerEnd: { type: MarkerType.Arrow },
};

function Flow({ children }: { children?: React.ReactNode }) {
  const { applyLayout, autoLayout } = useLayoutContext();
  const { visibleEdges, onEdgesChange, onEdgeRemove } = useEdgeContext();
  const selectedNodesRef = useRef<any[]>([]);
  const selectedEdgesRef = useRef<any[]>([]);


    const onChange = useCallback(
      ({ nodes, edges }: { nodes: Node[]; edges: Edge[] }) => {
        console.log("FLOW SELECT CONTEXT", nodes, edges);
        selectedNodesRef.current = nodes;
        selectedEdgesRef.current = edges;
      },
      []
    );
  
    useOnSelectionChange({
      onChange,
    });
  const {
    nodes,
    localNodes,
    isNewState,
    changeStateAge,
    onNodesChange,
    onNodeDragStart,
    onNodeDrag,
    onNodeDragStop,
    isDragging,
    onNodesDelete,
  } = useNodeContext();

  useEffect(() => {
    // Apply layout when nodes change
    if (isNewState) {
      console.log("Applying layout due to new state");
      autoLayout && applyLayout();
      changeStateAge(false);
    }
  }, [isNewState]);

  // Add ref for tracking panning performance
  const isPanning = useRef(false);
  const lastPanTime = useRef(0);
  const isDeleting = useRef(false);
  const { withTransaction } = useTransaction();

  

  
  const { onConnect, onConnectEnd } = useConnectionOperations();
  const {
    handleSelectionDragStart,
    DetermineNodeClickFunction,
    handleSelectionEnd,
  } = useNodeSelection({
    nodes,
    isDragging,
  });
  const { DetermineEdgeClickFunction } = useEdgeSelect({
    nodes,
    edges: visibleEdges,
  });

  // Add this to get clearSelection
  const { clearSelection, selectedEdges, selectedNodes } = useSelect();

  const handleDelete = (source: string) => {
    console.log("handleDelete called from:", source);
    if (isDeleting.current) {
      console.warn("Deletion already in progress. Ignoring this request.");
      return;
    }

    const hasSelectedNodes = selectedNodesRef.current.length > 0;
    const hasSelectedEdges = selectedEdgesRef.current.length > 0;

    if (hasSelectedNodes || hasSelectedEdges) {
      withTransaction(() => {
        console.log("Starting deletion transaction", hasSelectedNodes, hasSelectedEdges);
        if (hasSelectedNodes) {
          console.log("Deleting selected nodes:", selectedNodesRef.current);
          onNodesDelete(selectedNodesRef.current);
          selectedNodesRef.current = [];
        }
        if (hasSelectedEdges) {
          console.log("Deleting selected edges:", selectedEdgesRef.current);
          onEdgeRemove(selectedEdgesRef.current);
          selectedEdgesRef.current = [];
        }
        console.log("Deletion completed");
      }, "Delete selection");
    }
  };
  const handleClearSelection = useCallback(() => {
    clearSelection();
  }, [clearSelection]);
  const { nodeTypes } = useNodeTypeRegistry();
  const memoizedNodeTypes = useMemo(() => nodeTypes, [nodeTypes]);

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


const filteredNodes = useMemo(() => {
  const sourceNodes = isDragging ? localNodes : nodes;
  return sourceNodes.filter(node => !node.hidden);
}, [nodes, localNodes, isDragging]);

  return (
    <>
      {/* Register the grid controls */}
      <GridControlsRegistration />
      
      <ReactFlow
        nodeTypes={memoizedNodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        nodes={filteredNodes}
        onNodesDelete={() => handleDelete("onNodesDelete")}
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
        onEdgesDelete={() => handleDelete("onEdgesDelete")}
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
        {/* Add any additional components or overlays here */}
      </ReactFlow>
    </>
  );
}

export default memo(Flow);
