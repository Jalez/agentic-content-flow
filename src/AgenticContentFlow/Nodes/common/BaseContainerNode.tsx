import React from 'react';
import {
  NodeProps,
  NodeResizer,
  ResizeDragEvent,
  ResizeParams,
  Position,
  useReactFlow,
  useUpdateNodeInternals,
} from "@xyflow/react";
import { BaseNodeContainer, StyledHandle } from "./NodeStyles";
import { LAYOUT_CONSTANTS } from "../../Layout/utils/layoutUtils";
import {
  NodeHeader,
  NodeHeaderTitle,
  NodeHeaderActions,
  NodeHeaderMenuAction,
  NodeHeaderDeleteAction,
} from "./NodeHeader";
import { useNodeHistoryState } from "../../Node/hooks/useNodeState";
import ExpandCollapseButton from "./ExpandCollapseButton";
import NodeContent from "./NodeContent";

export interface BaseContainerNodeProps extends NodeProps {
  title?: string;
  icon?: React.ReactNode;
  color: string;
  isCourse?: boolean;
  canCollapse?: boolean;
  headerActions?: React.ReactNode;
  menuItems?: React.ReactNode;
}

/**
 * Base component for container-type nodes with standardized connection handles:
 * - Left side: Primary input from previous nodes in a flow
 * - Right side: Primary output to next nodes in a flow
 * - Top: Secondary input for hierarchical or sibling connections
 * - Bottom: Secondary output for hierarchical or sibling connections
 */
export const BaseContainerNode: React.FC<BaseContainerNodeProps> = ({
  id,
  data,
  selected,
  icon,
  color,
  isCourse = false,
  canCollapse = true,
  headerActions,
  menuItems,
}) => {
  const { updateNode } = useNodeHistoryState();
  const updateNodeInternals = useUpdateNodeInternals();
  const { getNode } = useReactFlow();

  const nodeInFlow = getNode(id);

  if (!nodeInFlow) {
    console.error(`Node with id ${id} not found in store.`);
    return null;
  }

  // Default dimensions for the container
  const collapsedDimensions = {
    width: 300,
    height: 200,
  };
  
  const expandedDimensions = {
    width: nodeInFlow?.width || collapsedDimensions.width,
    height: nodeInFlow?.height || collapsedDimensions.height,
  };

  // Handle resize logic
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

  // Type checking for data properties
  const nodeLabel = data?.label ? String(data.label) : 'Untitled';
  const nodeDetails = data?.details ? String(data.details) : undefined;
  const isHighlighted = !!data?.highlighted;

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
        color={color}
        sx={{
          width: nodeInFlow?.width,
          height: nodeInFlow?.height,
          backgroundColor: "background.default",
          display: "flex",
          flexDirection: "column",
          userSelect: "none",
          transition: "width 0.2s ease, height 0.2s ease",
          ...(isCourse && {
            border: "0.5em solid",
            borderColor: (selected || isHighlighted) ? "primary.main" : "divider",
          }),
        }}
      >
        {/* Primary data flow - left to right */}
        <StyledHandle
          type="target"
          position={Position.Left}
          id="left"
          color="grey.400"
          style={{
            left: '-7px',
          }}
        />

        <StyledHandle
          type="source"
          position={Position.Right}
          id="right"
          color="grey.400"
          style={{
            right: '-7px',
          }}
        />

        {/* Hierarchical/sibling connections - top and bottom */}
        <StyledHandle
          type="target"
          position={Position.Top}
          id="top"
          color="grey.400"
          style={{
            top: '-7px',
          }}
        />

        <StyledHandle
          type="source"
          position={Position.Bottom}
          id="bottom"
          color="grey.400"
          style={{
            bottom: '-7px',
          }}
        />

        <NodeHeader className="dragHandle">
          {icon && (
            <div style={{ marginRight: '8px', display: 'flex', alignItems: 'center' }}>
              {icon}
            </div>
          )}
          <NodeHeaderTitle>{nodeLabel}</NodeHeaderTitle>
          <NodeHeaderActions>
            {/* Conditionally render the expand/collapse button if the node can collapse */}
            {canCollapse && (
              <ExpandCollapseButton
                collapsedDimensions={collapsedDimensions}
                expandedDimensions={expandedDimensions}
                nodeInFlow={nodeInFlow}
              />
            )}
            
            {/* Custom header actions if provided */}
            {headerActions}
            
            <NodeHeaderMenuAction label="Container Options">
              {menuItems}
              <NodeHeaderDeleteAction />
            </NodeHeaderMenuAction>
          </NodeHeaderActions>
        </NodeHeader>

        <NodeContent 
          isCourse={isCourse}
          details={nodeDetails}
        />
      </BaseNodeContainer>
    </>
  );
};