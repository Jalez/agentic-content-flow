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
import { useNodeContext } from "../../Node/store/useNodeContext";
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
  const { updateNode } = useNodeContext();
  const updateNodeInternals = useUpdateNodeInternals();
  const { getNode } = useReactFlow();

  const nodeInFlow = getNode(id);
  
  // Safely cast data to our expected type
  const nodeData = data as UnifiedNodeData;
  const isCourse = isCourseNode(nodeData);
  
  // Calculate styling
  const nodeColor = NodeStyleHelper.getNodeColor({
    nodeLevel: nodeData.nodeLevel,
    isCourse
  });

  const handleResize = (_: ResizeDragEvent, params: ResizeParams) => {
    if (!nodeInFlow) return;
    
    updateNode({
      ...nodeInFlow,
      style: {
        ...nodeInFlow.style,
        width: params.width,
        height: params.height,
      },
      measured: undefined,
      width: undefined,
      height: undefined,
    });
  };



  if (!nodeInFlow) {
    console.error(`Node with id ${id} not found in store.`);
    return null;
  }
  // Use the most up-to-date data during dragging
  if(selected) {
  }

  const collapsedDimensions = {
    width: 300,
    height: 200,
  };
  const expandedDimensions = {
    width: nodeInFlow?.width || collapsedDimensions.width,
    height: nodeInFlow?.height  || collapsedDimensions.height,
  };
  
  // Create border style based on if it's a course node
  const courseBorderStyle ={
    border: '0.5em solid',
    borderColor: (selected || data.highlighted) ? 'var(--color-primary)' : 'var(--color-border)'
  }
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
        selected={selected}
        color={nodeColor}
        className="flex flex-col select-none"
        style={{
          width: nodeInFlow?.width,
          height: nodeInFlow?.height,
          backgroundColor: 'var(--color-background)',
          transition: 'width 0.2s ease, height 0.2s ease',
          ...courseBorderStyle
        }}
      >
        <StyledHandle
          type="target"
          position={targetPosition || Position.Top}
          color="var(--color-muted)"
        />

        <NodeHeader className="dragHandle">
          <NodeHeaderTitle>{nodeData.label}</NodeHeaderTitle>
          <NodeHeaderActions>
            <ExpandCollapseButton
              collapsedDimensions={collapsedDimensions}
              expandedDimensions={expandedDimensions}
              nodeInFlow={nodeInFlow}
            />
            <NodeHeaderMenuAction label="Container Options">
              {/* Add menu items here if needed */}
            <NodeHeaderDeleteAction />
            </NodeHeaderMenuAction>
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
