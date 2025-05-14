/** @format */
import {
  Background,
  Edge,
  Node,
  ReactFlowProvider,
} from "@xyflow/react";
import { SelectProvider } from "./Select/contexts/SelectContext";
import { useCallback, useRef } from "react";
import { useNodeStore, useViewPreferencesStore } from "./stores";
import { useViewportManager } from "./Flow/hooks/useViewportManager";
import { GRID_SETTINGS } from "./constants";
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

export function AgenticContentFlowContent() {
  const flowWrapper = useRef<HTMLDivElement>(null);
  const { showGrid, gridVariant } = useViewPreferencesStore();
  const { nodeMap, nodeParentIdMapWithChildIdSet } = useNodeStore();

  const {
    updateNodes,
  } = useNodeHistoryState();

  const { handleUpdateEdges } = useEdgeState();

  // Use custom hooks for functionality
  const { handleWheel } = useViewportManager(flowWrapper);

  
  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      flowWrapper.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, [flowWrapper]);
  const testCallNodes = useCallback((nodes: Node[]) => {
    updateNodes(nodes);
  }, [updateNodes])

  const testCallEdges = useCallback((edges: Edge[]) => {
    handleUpdateEdges(edges);
  }, [handleUpdateEdges]);

  return (
    <LayoutProvider
      initialDirection="DOWN"
      initialAutoLayout={true}
      initialPadding={20}
      initialSpacing={{ node: 80, layer: 80 }}
      initialParentResizingOptions={{
        padding: {
          horizontal: 50,
          vertical: 50,
        },
        minWidth: 100,
        minHeight: 100,
      }}
      initialNodeDimensions={{
        width: 300,
        height: 200,
      }}
      updateNodes={testCallNodes}
      updateEdges={testCallEdges}
      nodeParentIdMapWithChildIdSet={nodeParentIdMapWithChildIdSet}
      nodeIdWithNode={nodeMap}
    >
      <FlowContainer ref={flowWrapper} onWheel={handleWheel}>
        <Flow>
          <UnifiedControls
            onToggleFullscreen={handleToggleFullscreen}
          />
          {showGrid && (
            <Background
              variant={gridVariant}
              gap={GRID_SETTINGS.BACKGROUND_GAP}
              size={GRID_SETTINGS.BACKGROUND_SIZE}
              color="var(--color-border)"
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

const AgenticContentFlow = () => (
  <ReactFlowProvider>
    <SelectProvider>
      <ReactStateHistory>
        <AgenticContentFlowContent />
      </ReactStateHistory>
    </SelectProvider>
  </ReactFlowProvider>
);

export default AgenticContentFlow;
