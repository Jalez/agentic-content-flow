import React, { useEffect, useState } from 'react';
import { NodeProps } from '@xyflow/react';
import LanguageIcon from '@mui/icons-material/Language';
import { Box, MenuItem } from '@mui/material';
import { PageNodeContainer } from './PageNodeStyles';
import {
  NodeHeader,
  NodeHeaderTitle,
  NodeHeaderActions,
  NodeHeaderMenuAction,
  NodeHeaderDeleteAction
} from '../common/NodeHeader';
import { useUpdateNodeInternals, useReactFlow } from '@xyflow/react';
import { LAYOUT_CONSTANTS } from '../../Layout/utils/layoutUtils';
import ExpandCollapseButton from '../common/ExpandCollapseButton';
import ConnectionHandles from '../common/ConnectionHandles';
import CornerResizer from '../common/CornerResizer';

/**
 * Page Node Component
 * 
 * Represents an HTML page in a flow diagram.
 * Features a minimal design with distinctive page appearance.
 */
export const PageNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const updateNodeInternals = useUpdateNodeInternals();
  const { getNode } = useReactFlow();
  const nodeInFlow = getNode(id);

  const [isExpanded, setIsExpanded] = useState(nodeInFlow?.data.expanded || false);

  useEffect(() => {
    if (nodeInFlow) {
      setIsExpanded(Boolean(nodeInFlow.data?.expanded));
    }
  }, [nodeInFlow]);

  const darkerColor = "#4caf50"; // Green color for page nodes
  const lighterColor = "white"; // Lighter green for expanded state

const color = isExpanded ? lighterColor : darkerColor;

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


  // Type checking for data properties
  const nodeLabel = data?.label ? String(data.label) : 'Page';
  const nodeDetails = data?.details ? String(data.details) : undefined;


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
      <CornerResizer
        minHeight={LAYOUT_CONSTANTS.NODE_DEFAULT_HEIGHT}
        minWidth={LAYOUT_CONSTANTS.NODE_DEFAULT_WIDTH}
        nodeToResize={nodeInFlow}
        canResize={selected}
        color={color}
      />
      <PageNodeContainer
        onTransitionEnd={() => updateNodeInternals(id)}
        selected={selected}
        color={color}
        sx={{
          width: nodeInFlow?.width,
          height: nodeInFlow?.height,
          backgroundColor: color,

          display: "flex",
          flexDirection: "column",
          userSelect: "none",
          transition: "width 0.2s ease, height 0.2s ease",
        }}
      >
        {/* Connection handles */}
        <ConnectionHandles color={color} />
        <NodeHeader className="dragHandle">
          <LanguageIcon sx={{
            color: 'primary.secondary',
            position: isExpanded ? 'relative' : 'absolute',
            //When it is not expanded, center the icon 
            left: isExpanded ? '0' : '50%',
            top: isExpanded ? '0' : '50%',
            transform: isExpanded ? 'none' : 'translate(-50%, -50%)',
            //Make it larger when not expanded
            fontSize: isExpanded ? '1.5rem' : '5rem',
          }} />

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


      </PageNodeContainer>
    </>
  );
};

export default PageNode;