import {
  NodeProps,
  NodeResizer,
  ResizeDragEvent,
  ResizeParams,
  Position,
  useReactFlow,
  useUpdateNodeInternals,
} from "@xyflow/react";
import { BaseNodeContainer, StyledHandle } from "../common/NodeStyles";
import { LAYOUT_CONSTANTS } from "../../Layout/utils/layoutUtils";
import {
  NodeHeader,
  NodeHeaderTitle,
  NodeHeaderActions,
  NodeHeaderMenuAction,
  NodeHeaderDeleteAction,
} from "../common/NodeHeader";
import { useNodeState } from "../../Node/hooks/useNodeState";
import ExpandCollapseButton from "../common/ExpandCollapseButton";
import NodeContent from "../common/NodeContent";
import { NodeStyleHelper } from "../common/NodeStyleHelper";
import { UnifiedNodeData, isCourseNode } from "./types";

/**
 * ContainerNode component
 * Represents a container node in the mind map
 */
export const ContainerNode = ({
  id,
  data,
  selected,
  targetPosition,
  sourcePosition,
}: NodeProps) => {
  const { updateNode, nodeParentMap, expandedNodes, toggleNodeExpansion, isDragging } = useNodeState();
  const updateNodeInternals = useUpdateNodeInternals();
  const { getNode } = useReactFlow();

  const nodeInStore = getNode(id);
  const isExpanded = expandedNodes[id] !== false; // Default to expanded if not explicitly collapsed
  
  // Safely cast data to our expected type
  const nodeData = data as UnifiedNodeData;
  const isCourse = isCourseNode(nodeData);
  
  // Calculate styling
  const nodeColor = NodeStyleHelper.getNodeColor({
    nodeLevel: nodeData.nodeLevel,
    isCourse
  });

  const handleResize = (_: ResizeDragEvent, params: ResizeParams) => {
    if (!nodeInStore) return;
    
    updateNode({
      ...nodeInStore,
      style: {
        ...nodeInStore.style,
        width: params.width,
        height: params.height,
      },
      measured: undefined,
      width: undefined,
      height: undefined,
    });
  };

  const childNodes = nodeParentMap.get(id) || [];
  const childCount = childNodes.length;

  if (!nodeInStore) {
    console.error(`Node with id ${id} not found in store.`);
    return null;
  }
  // Use the most up-to-date data during dragging
  const highlighted = isDragging ? data.highlighted : nodeInStore.data.highlighted;
  
  return (
    <>
      {selected && (
        <NodeResizer
          minHeight={LAYOUT_CONSTANTS.NODE_DEFAULT_HEIGHT}
          minWidth={LAYOUT_CONSTANTS.NODE_DEFAULT_WIDTH}
          onResize={handleResize}
        />
      )}
      <BaseNodeContainer
        onTransitionEnd={() => updateNodeInternals(id)}
        selected={!!selected}
        color={nodeColor}
        sx={{
          width: nodeInStore.width,
          height: nodeInStore.height,
          backgroundColor: "background.default",
          display: "flex",
          flexDirection: "column",
          userSelect: "none",
          transition: "width 0.2s ease, height 0.2s ease",
          ...(isCourse && {
            border: "0.5em solid",
            borderColor: (selected || highlighted) ? "primary.main" 
            :
             "divider",
          }),
        }}
      >
        <StyledHandle
          type="target"
          position={targetPosition || Position.Top}
          color="grey.400"
        />

        <NodeHeader className="dragHandle">
          <NodeHeaderTitle>{nodeData.label}</NodeHeaderTitle>
          <NodeHeaderActions>
            <ExpandCollapseButton
              nodeInStore={nodeInStore}
              nodeId={id}
              isExpanded={isExpanded}
              childCount={childCount}
              updateNode={updateNode}
              toggleNodeExpansion={toggleNodeExpansion}
            />
            <NodeHeaderMenuAction label="Container Options">
              {/* Add menu items here if needed */}
            </NodeHeaderMenuAction>
            <NodeHeaderDeleteAction />
          </NodeHeaderActions>
        </NodeHeader>

        <NodeContent 
          isCourse={isCourse}
          details={nodeData.details}
        />

        <StyledHandle
          type="source"
          position={sourcePosition || Position.Bottom}
          color="grey.400"
        />
      </BaseNodeContainer>
    </>
  );
};

export default ContainerNode;
