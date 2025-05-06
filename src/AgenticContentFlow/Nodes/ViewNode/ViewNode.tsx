import React, { useState, useEffect } from 'react';
import { NodeProps } from '@xyflow/react';
//Get an icon suitable for view nodes
import ViewQuiltIcon from '@mui/icons-material/ViewQuilt';
import { MenuItem } from '@mui/material';
import {
  NodeHeader,
  NodeHeaderMenuAction,
  NodeHeaderDeleteAction
} from '../common/NodeHeader';
import { useNodeHistoryState } from '../../Node/hooks/useNodeState';
import { useUpdateNodeInternals, useReactFlow } from '@xyflow/react';
import { LAYOUT_CONSTANTS } from '../../Layout/utils/layoutUtils';
import CornerResizer from '../common/CornerResizer';
import ScrollingText from '../common/ScrollingText';
import { ViewNodeContainer } from './ViewNodeStyles';
import ConnectionHandles from '../common/ConnectionHandles';
import ExpandCollapseButton from '../common/ExpandCollapseButton';
/**
 * Data Node Component
 * 
 * Represents a data source or repository in a flow diagram.
 * Has a distinctive folder appearance.
 * Accepts data primarily from left side, produces data primarily to right side.
 * Also maintains top/bottom connections for sibling/conditional communication.
 */
export const ViewNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const { updateNode } = useNodeHistoryState();
  const updateNodeInternals = useUpdateNodeInternals();
  const { getNode } = useReactFlow();
  const nodeInFlow = getNode(id);
  const [isExpanded, setIsExpanded] = useState(nodeInFlow?.data.expanded || false);

  useEffect(() => {
    if (nodeInFlow) {
      setIsExpanded(Boolean(nodeInFlow.data?.expanded));
    }
  }, [nodeInFlow]);


  const color = isExpanded ?
    "#FF5733" : //darker color when not expanded
    "#FF8C00"; //lighter color when expanded

  if (!nodeInFlow) {
    console.error(`Node with id ${id} not found in store.`);
    return null;
  }

  // Default dimensions for the container
  const collapsedDimensions = {
    width: 300,
    height: 60,
  };

  const expandedDimensions = {
    width: nodeInFlow?.width || 300,
    height: nodeInFlow?.height || 300,
  };




  // Type checking for data properties
  const nodeLabel = data?.label ? String(data.label) : 'Files';

  // Generate mock file structure for the explorer view

  // Custom menu items for file operations
  const fileNodeMenuItems = [
    <MenuItem key="open" onClick={() => console.log('Open file')}>
      Open File
    </MenuItem>,
    <MenuItem key="download" onClick={() => console.log('Download file')}>
      Download
    </MenuItem>,
    <MenuItem key="share" onClick={() => console.log('Share file')}>
      Share
    </MenuItem>
  ];



  return (
    <>
      <CornerResizer
        minHeight={LAYOUT_CONSTANTS.NODE_DEFAULT_HEIGHT}
        minWidth={LAYOUT_CONSTANTS.NODE_DEFAULT_WIDTH}
        canResize={selected}
        nodeToResize={nodeInFlow}
        color={color}
      />
      <ViewNodeContainer
        onTransitionEnd={() => updateNodeInternals(id)}
        selected={selected}
        color={color}
        isCollapsed={!isExpanded}
        sx={{
          width: nodeInFlow?.width || collapsedDimensions.width,
          height: nodeInFlow?.height || (isExpanded ? expandedDimensions.height : collapsedDimensions.height),
          backgroundColor: color,
          display: "flex",
          flexDirection: "column",
          userSelect: "none",
          transition: "width 0.2s ease, height 0.2s ease",
        }}
      >
        {/* Connection handles */}
        <ConnectionHandles color={color} />

        {/* Input handle at the top */}
        <NodeHeader className="dragHandle">

          <ViewQuiltIcon
            sx={{
              color: 'primary.secondary',
              position: isExpanded ? 'relative' : 'absolute',
              //When it is not expanded, center the icon 
              left: isExpanded ? '0' : '50%',
              top: isExpanded ? '0' : '50%',
              transform: isExpanded ? 'none' : 'translate(-50%, -50%)',
              //Make it larger when not expanded
              fontSize: isExpanded ? '1.5rem' : '5rem',
            }}
          />
          <ScrollingText
            text={nodeLabel}
            variant="subtitle1"
            maxWidth="100%"
            sx={{
              flex: 1,
              fontWeight: 600,
              position: 'relative',
            }}
          />
          <ExpandCollapseButton
            collapsedDimensions={collapsedDimensions}
            expandedDimensions={expandedDimensions}
            nodeInFlow={nodeInFlow}
          />

          <NodeHeaderMenuAction label="File Options">
            {fileNodeMenuItems}
            <NodeHeaderDeleteAction />
          </NodeHeaderMenuAction>
        </NodeHeader>

      </ViewNodeContainer>
    </>
  );
};

export default ViewNode;