import React from 'react';
import { NodeProps, Position, NodeResizer } from '@xyflow/react';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BarChartIcon from '@mui/icons-material/BarChart';
import { MenuItem } from '@mui/material';
import { StyledHandle } from '../common/NodeStyles';
import { ViewNodeContainer } from './ViewNodeStyles';
import { 
  NodeHeader,
  NodeHeaderTitle,
  NodeHeaderActions,
  NodeHeaderMenuAction,
  NodeHeaderDeleteAction
} from '../common/NodeHeader';
import NodeContent from '../common/NodeContent';
import { useNodeHistoryState } from '../../Node/hooks/useNodeState';
import { useUpdateNodeInternals, useReactFlow } from '@xyflow/react';
import { LAYOUT_CONSTANTS } from '../../Layout/utils/layoutUtils';
import ExpandCollapseButton from '../common/ExpandCollapseButton';

/**
 * View Node Component
 * 
 * Represents a view or visualization in a flow diagram.
 * Has a distinctive dashboard-like appearance with graph/chart imagery.
 * Accepts data primarily from left side, produces data primarily to right side.
 * Also maintains top/bottom connections for sibling/conditional communication.
 */
export const ViewNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const { updateNode } = useNodeHistoryState();
  const updateNodeInternals = useUpdateNodeInternals();
  const { getNode } = useReactFlow();
  const nodeInFlow = getNode(id);
  const color = "#9c27b0"; // Purple color for view nodes

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
  const nodeLabel = data?.label ? String(data.label) : 'View';
  const nodeDetails = data?.details ? String(data.details) : undefined;
  const isHighlighted = !!data?.highlighted;

  // Additional menu items specific to view nodes
  const viewNodeMenuItems = [
    <MenuItem key="configure" onClick={() => console.log('Configure view')}>
      Configure View
    </MenuItem>,
    <MenuItem key="export" onClick={() => console.log('Export visualization')}>
      Export Visualization
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
      <ViewNodeContainer
        onTransitionEnd={() => updateNodeInternals(id)}
        selected={selected}
        color={color}
        sx={{
          width: nodeInFlow?.width,
          height: nodeInFlow?.height,
          backgroundColor: "background.paper",
          display: "flex",
          flexDirection: "column",
          userSelect: "none",
          transition: "width 0.2s ease, height 0.2s ease",
        }}
      >
        {/* Primary data flow - left to right */}
        <StyledHandle
          type="target"
          position={Position.Left}
          id="left"
          color={color}
          style={{
            left: '-7px',
          }}
        />

        <StyledHandle
          type="source"
          position={Position.Right}
          id="right"
          color={color}
          style={{
            right: '-7px',
          }}
        />

        {/* Hierarchical/sibling connections - top and bottom */}
        <StyledHandle
          type="target"
          position={Position.Top}
          id="top"
          color={color}
          style={{
            top: '-7px',
          }}
        />

        <StyledHandle
          type="source"
          position={Position.Bottom}
          id="bottom"
          color={color}
          style={{
            bottom: '-7px',
          }}
        />

        <NodeHeader className="dragHandle">
          <div style={{ marginRight: '8px', display: 'flex', alignItems: 'center' }}>
            <BarChartIcon style={{ color: color }} />
          </div>
          <NodeHeaderTitle>{nodeLabel}</NodeHeaderTitle>
          <NodeHeaderActions>
            <ExpandCollapseButton
              collapsedDimensions={collapsedDimensions}
              expandedDimensions={expandedDimensions}
              nodeInFlow={nodeInFlow}
            />
            
            <NodeHeaderMenuAction label="View Options">
              {viewNodeMenuItems}
              <NodeHeaderDeleteAction />
            </NodeHeaderMenuAction>
          </NodeHeaderActions>
        </NodeHeader>

        <NodeContent 
          isCourse={false}
          details={nodeDetails}
        />
      </ViewNodeContainer>
    </>
  );
};

export default ViewNode;