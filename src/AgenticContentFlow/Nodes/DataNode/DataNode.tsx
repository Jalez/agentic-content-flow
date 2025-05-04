    import React from 'react';
import { NodeProps, Position, NodeResizer } from '@xyflow/react';
import StorageIcon from '@mui/icons-material/Storage';
import { MenuItem } from '@mui/material';
import { StyledHandle } from '../common/NodeStyles';
import { DataNodeContainer } from './DataNodeStyles';
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
 * Data Node Component
 * 
 * Represents a data source or repository in a flow diagram.
 * Has a distinctive database-like appearance.
 * Accepts data primarily from left side, produces data primarily to right side.
 * Also maintains top/bottom connections for sibling/conditional communication.
 */
export const DataNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const { updateNode } = useNodeHistoryState();
  const updateNodeInternals = useUpdateNodeInternals();
  const { getNode } = useReactFlow();
  const nodeInFlow = getNode(id);
  const color = "#0288d1"; // Blue color for data nodes

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
  const nodeLabel = data?.label ? String(data.label) : 'Data Source';
  const nodeDetails = data?.details ? String(data.details) : undefined;
  const isHighlighted = !!data?.highlighted;

  // Additional menu items specific to data nodes
  const dataNodeMenuItems = [
    <MenuItem key="connect" onClick={() => console.log('Connect to data source')}>
      Connect to Data Source
    </MenuItem>,
    <MenuItem key="schema" onClick={() => console.log('View data schema')}>
      View Schema
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
      <DataNodeContainer
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
            <StorageIcon style={{ color: color }} />
          </div>
          <NodeHeaderTitle>{nodeLabel}</NodeHeaderTitle>
          <NodeHeaderActions>
            <ExpandCollapseButton
              collapsedDimensions={collapsedDimensions}
              expandedDimensions={expandedDimensions}
              nodeInFlow={nodeInFlow}
            />
            
            <NodeHeaderMenuAction label="Data Options">
              {dataNodeMenuItems}
              <NodeHeaderDeleteAction />
            </NodeHeaderMenuAction>
          </NodeHeaderActions>
        </NodeHeader>

        <NodeContent 
          isCourse={false}
          details={nodeDetails}
        />
      </DataNodeContainer>
    </>
  );
};

export default DataNode;