import React from 'react';
import { NodeProps, Position, NodeResizer } from '@xyflow/react';
import LanguageIcon from '@mui/icons-material/Language';
import { Box, MenuItem } from '@mui/material';
import { StyledHandle } from '../common/NodeStyles';
import { PageNodeContainer } from './PageNodeStyles';
import { 
  NodeHeader,
  NodeHeaderTitle,
  NodeHeaderActions,
  NodeHeaderMenuAction,
  NodeHeaderDeleteAction
} from '../common/NodeHeader';
import { useNodeHistoryState } from '../../Node/hooks/useNodeState';
import { useUpdateNodeInternals, useReactFlow } from '@xyflow/react';
import { LAYOUT_CONSTANTS } from '../../Layout/utils/layoutUtils';
import ExpandCollapseButton from '../common/ExpandCollapseButton';

/**
 * Page Node Component
 * 
 * Represents an HTML page in a flow diagram.
 * Features a minimal design with distinctive page appearance.
 */
export const PageNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const { updateNode } = useNodeHistoryState();
  const updateNodeInternals = useUpdateNodeInternals();
  const { getNode } = useReactFlow();
  const nodeInFlow = getNode(id);
  const color = "#4caf50"; // Green color for page nodes

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

  const handleResize = (_: any, params: any) => {
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
  const nodeLabel = data?.label ? String(data.label) : 'Page';
  const nodeDetails = data?.details ? String(data.details) : undefined;
  const isHighlighted = !!data?.highlighted;

  // Additional menu items specific to page nodes
  const pageNodeMenuItems = [
    <MenuItem key="edit" onClick={() => console.log('Edit page content')}>
      Edit HTML
    </MenuItem>,
    <MenuItem key="preview" onClick={() => console.log('View page preview')}>
      Preview Page
    </MenuItem>
  ];

  return (
    <>
      {selected && (
        <NodeResizer
          minHeight={LAYOUT_CONSTANTS.NODE_DEFAULT_HEIGHT}
          minWidth={LAYOUT_CONSTANTS.NODE_DEFAULT_WIDTH}
          onResize={handleResize}
        />
      )}
      <PageNodeContainer
        onTransitionEnd={() => updateNodeInternals(id)}
        selected={selected}
        color={color}
        sx={{
          width: nodeInFlow?.width,
          height: nodeInFlow?.height,
          display: "flex",
          flexDirection: "column",
          userSelect: "none",
          transition: "width 0.2s ease, height 0.2s ease",
        }}
      >
        {/* Connection handles */}
        <StyledHandle
          type="target"
          position={Position.Left}
          id="left"
          color={color}
          style={{ left: '-7px', zIndex: 3 }}
        />
        <StyledHandle
          type="source"
          position={Position.Right}
          id="right"
          color={color}
          style={{ right: '-7px', zIndex: 3 }}
        />
        <StyledHandle
          type="target"
          position={Position.Top}
          id="top"
          color={color}
          style={{ top: '-7px', zIndex: 3 }}
        />
        <StyledHandle
          type="source"
          position={Position.Bottom}
          id="bottom"
          color={color}
          style={{ bottom: '-7px', zIndex: 3 }}
        />

        <NodeHeader className="dragHandle">
          <div style={{ marginRight: '8px', display: 'flex', alignItems: 'center' }}>
            <LanguageIcon style={{ color }} />
          </div>
          <NodeHeaderTitle>{nodeLabel}</NodeHeaderTitle>
          <NodeHeaderActions>
            <ExpandCollapseButton
              collapsedDimensions={collapsedDimensions}
              expandedDimensions={expandedDimensions}
              nodeInFlow={nodeInFlow}
            />
            <NodeHeaderMenuAction label="Page Options">
              {pageNodeMenuItems}
              <NodeHeaderDeleteAction />
            </NodeHeaderMenuAction>
          </NodeHeaderActions>
        </NodeHeader>

        {/* Clean content area */}
        <Box className="page-content-area">
          {nodeDetails && (
            <Box sx={{ color: 'text.primary', fontSize: '0.875rem' }}>
              {nodeDetails}
            </Box>
          )}
        </Box>
      </PageNodeContainer>
    </>
  );
};

export default PageNode;