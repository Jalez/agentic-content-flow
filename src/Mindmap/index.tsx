/** @format */
import {
  Background,
  BackgroundVariant,
  Edge,
  Node,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import { SelectProvider } from "./Select/contexts/SelectContext";
import { useTheme } from "@mui/material";
import { useCallback, useRef } from "react";
import { useNodeStore, useViewPreferencesStore } from "./stores";
import { useViewportManager } from "./Flow/hooks/useViewportManager";
import { GRID_SETTINGS, VIEWPORT_CONSTRAINTS } from "./constants";
import { FlowContainer } from "./Flow/FlowContainer";
import Flow from "./Flow/Flow";
import UnifiedControls from "./Controls";
import SelectLogic from "./Select/SelectLogic";
import Minimap from "./Minimap/Minimap";
import TestControlsRegistration from "./test/TestControlsRegistration";
import LayoutControlsRegistration from "./Layout/LayoutControlsRegistration";
import { ensureNodeTypesRegistered } from "./Nodes/registerBasicNodeTypes";

import "@xyflow/react/dist/style.css"; // Ensure to import the styles for React Flow
import ReactStateHistory from "./History/ReactStateHistory";
import { LayoutProvider } from "@jalez/react-flow-automated-layout";
import { useNodeHistoryState } from "./Node/hooks/useNodeState";
import { useEdgeState } from "./Edge/hooks/useEdgeState";

// Register node types before any rendering occurs
ensureNodeTypesRegistered();

export function MindmapContent() {
  const theme = useTheme();
  const flowWrapper = useRef<HTMLDivElement>(null);
  const { showGrid } = useViewPreferencesStore();
  const reactFlowInstance = useReactFlow();
  const { nodeMap, nodeParentMap } = useNodeStore();

  const {
    updateNodes,
  } = useNodeHistoryState();

  const { handleUpdateEdges } = useEdgeState();

  // Use custom hooks for functionality
  const { handleWheel } = useViewportManager(flowWrapper);

  // Viewport control functions
  const fitView = useCallback(() => {
    reactFlowInstance?.fitView({
      padding: VIEWPORT_CONSTRAINTS.FIT_VIEW_PADDING,
      includeHiddenNodes: false,
      duration: VIEWPORT_CONSTRAINTS.CENTER_ANIMATION_DURATION,
    });
  }, [reactFlowInstance]);

  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      flowWrapper.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, [flowWrapper]);
const testCallNodes = useCallback((nodes: Node[]) => {

  updateNodes(nodes);
}, [updateNodes, nodeMap, nodeParentMap])
  
const testCallEdges = useCallback((edges: Edge[]) => {
  console.log("testCallEdges:", edges);
  handleUpdateEdges(edges);
}, [handleUpdateEdges, nodeMap, nodeParentMap, updateNodes]);
  
  //console.log("Node Parent Map:", visibleNodeParentMap);
  //console.log("VISIBLE Node Map:", visibleNodeMap);
  return (
    <LayoutProvider
      initialDirection="DOWN"
      initialAutoLayout={true}
      initialPadding={100}
      initialSpacing={{ node: 50, layer: 50 }}
      initialParentResizingOptions={{
        padding: {
          horizontal: 120,
          vertical: 100,
        },
        minWidth: 150,
        minHeight: 150,
      }}
      //updateNodes={handleUpdateNodes}
      updateNodes={testCallNodes}
      updateEdges={testCallEdges}
      parentIdWithNodes={nodeParentMap}
      nodeIdWithNode={nodeMap}
    >
      <FlowContainer ref={flowWrapper} onWheel={handleWheel}>
        <Flow>
          <UnifiedControls
            onFitView={fitView}
            onToggleFullscreen={handleToggleFullscreen}
          />
          {showGrid && (
            <Background
              variant={BackgroundVariant.Lines}
              gap={GRID_SETTINGS.BACKGROUND_GAP}
              size={GRID_SETTINGS.BACKGROUND_SIZE}
              color={theme.palette.divider}
            />
          )}
          <SelectLogic />
          <Minimap />
          {/* Register available controls here */}
          <TestControlsRegistration />
          <LayoutControlsRegistration />
        </Flow>
      </FlowContainer>
    </LayoutProvider>
  );
}

const Mindmap = () => (
  <ReactFlowProvider>
    <SelectProvider>
      <ReactStateHistory>
        <MindmapContent />
      </ReactStateHistory>
    </SelectProvider>
  </ReactFlowProvider>
);

export default Mindmap;
