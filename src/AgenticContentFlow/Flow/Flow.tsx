import { Edge, MarkerType, Node, ReactFlow, SelectionMode, useOnSelectionChange } from "@xyflow/react";
import { memo, useEffect, useCallback, useRef, useMemo } from "react";
import useNodeSelection from "../Node/hooks/useNodeSelect";
import { useEdgeSelect } from "../Edge/hooks/useEdgeSelect";
import { VIEWPORT_CONSTRAINTS } from "../constants";
import { useConnectionOperations } from "../Node/hooks/useConnectionOperations";
import { useNodeTypeRegistry } from "../Node/registry/nodeTypeRegistry";
import { useSelect } from "../Select/contexts/SelectContext";
import { useNodeContext } from "../Node/store/useNodeContext";
import { useEdgeContext } from "../Edge/store/useEdgeContext";
// Import the grid controls registration
import GridControlsRegistration from "./controls/GridControlsRegistration";
import { useLayoutContext } from "@jalez/react-flow-automated-layout";
import { useTransaction } from "@jalez/react-state-history";
import { useEdgeTypeRegistry } from "../Edge/registry/edgeTypeRegistry";
import { ensureEdgeTypesRegistered } from "../Edges/registerBasicEdgeTypes";
import NodeConfigPanel from "../Config/NodeConfigPanel";


const defaultEdgeOptions = {
  zIndex: 10000, //WARNING: THIS NEEDS TO BE HIGHER THAN THE Z-INDEX OF THE NODE OVERLAY
  type: "default",
  //animated: true,
  markerEnd: { type: MarkerType.Arrow },
};

function Flow({ children }: { children?: React.ReactNode }) {
  const { applyLayout, autoLayout } = useLayoutContext();
  const { visibleEdges, onEdgesChange, onEdgeRemove } = useEdgeContext();
  const selectedNodesRef = useRef<any[]>([]);
  const selectedEdgesRef = useRef<any[]>([]);

  const { nodeTypes } = useNodeTypeRegistry();
  const { edgeTypes } = useEdgeTypeRegistry();

  // Ensure both node and edge types are registered on component mount
  useEffect(() => {
    ensureEdgeTypesRegistered();
  }, []);

  const memoizedNodeTypes = useMemo(() => nodeTypes, [nodeTypes]);
  const memoizedEdgeTypes = useMemo(() => edgeTypes, [edgeTypes]);

    const onChange = useCallback(
      ({ nodes, edges }: { nodes: Node[]; edges: Edge[] }) => {
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
    removeNodes,
  } = useNodeContext();

  useEffect(() => {
    // Apply layout when nodes change
    if (isNewState) {
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
  const { clearSelection } = useSelect();

  const handleDelete = (_source: string) => {
    if (isDeleting.current) {
      console.warn("Deletion already in progress. Ignoring this request.");
      return;
    }

    const hasSelectedNodes = selectedNodesRef.current.length > 0;
    const hasSelectedEdges = selectedEdgesRef.current.length > 0;

    if (hasSelectedNodes || hasSelectedEdges) {
      withTransaction(() => {
        // The edges connected to the selected nodes should also be deleted
        const connectedEdges = visibleEdges.filter(edge =>
          selectedNodesRef.current.some(node => node.id === edge.source || node.id === edge.target)
        );
        if (hasSelectedNodes) {
          removeNodes(selectedNodesRef.current);
          selectedNodesRef.current = [];  
        }
        
        if (hasSelectedEdges || connectedEdges.length > 0) {
          const alledgesToDelete = [...selectedEdgesRef.current, ...connectedEdges];
          onEdgeRemove(alledgesToDelete);
          selectedEdgesRef.current = [];
        }
      }, "Delete selection");
    }
  };
  const handleClearSelection = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  // Ensure node types are registered on component mount
  useEffect(() => {
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
          edgeTypes={memoizedEdgeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          nodes={filteredNodes}
          onNodesDelete={() => handleDelete("removeNodes")}
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
          //multiSelectionKeyCode="Control"
          fitView
          zoomOnScroll={true}
          zoomOnPinch={true}
          minZoom={VIEWPORT_CONSTRAINTS.MIN_ZOOM}
          maxZoom={VIEWPORT_CONSTRAINTS.MAX_ZOOM}
          onMoveStart={handlePanStart}
          onMoveEnd={handlePanEnd}
          panOnScroll={false}

          onPaneClick={handleClearSelection}
        >
          {children}
          {/* Add any additional components or overlays here */}
        </ReactFlow>
        
        {/* Node Configuration Panel */}
        <NodeConfigPanel />
      </>
  );
}

export default memo(Flow);
