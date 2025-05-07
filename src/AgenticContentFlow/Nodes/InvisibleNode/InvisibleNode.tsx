import React, { useEffect, useState, useRef } from 'react';
import { NodeProps } from '@xyflow/react';
import ViewQuiltIcon from '@mui/icons-material/ViewQuilt';
import { Box, MenuItem } from '@mui/material';
import { InvisibleNodeContainer } from './InvisibleNodeStyles';
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

interface InvisibleNodeProps extends NodeProps {
  isExpanded?: boolean;
}

/**
 * Invisible Node Component
 * 
 * A container node that becomes invisible when expanded, showing only its children.
 * When collapsed or hovered, shows a standard node interface.
 */
export const InvisibleNode: React.FC<InvisibleNodeProps> = ({ id, data, selected }) => {
  const updateNodeInternals = useUpdateNodeInternals();
  const { getNode } = useReactFlow();
  const nodeInFlow = getNode(id);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isExpanded, setIsExpanded] = useState(nodeInFlow?.data.expanded || false);

  useEffect(() => {
    if (nodeInFlow) {
      setIsExpanded(Boolean(nodeInFlow.data?.expanded));
    }
  }, [nodeInFlow]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      setIsHovered(inside);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const darkerColor = "#9c27b0"; // Purple color for invisible nodes
  const lighterColor = "transparent";

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
  const nodeLabel = data?.label ? String(data.label) : 'Container';

  // Additional menu items specific to invisible nodes
  const invisibleNodeMenuItems = [
    <MenuItem key="toggle" onClick={() => console.log('Toggle visibility')}>
      Toggle Container Visibility
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
      <InvisibleNodeContainer
        ref={containerRef}
        onTransitionEnd={() => updateNodeInternals(id)}
        selected={selected}
        color={color}
        isExpanded={isExpanded as boolean}
        sx={{
          width: nodeInFlow?.width,
          height: nodeInFlow?.height,
          display: "flex",
          flexDirection: "column",
          userSelect: "none",
          transition: "width 0.2s ease, height 0.2s ease",
          borderColor: (!isExpanded || isHovered) ? 'black' : 'transparent',

        }}
      >
        <Box
          className="dragHandle"
          component={NodeHeader}
        >
          { (!isExpanded || isHovered)  && (
            <>
              <ViewQuiltIcon sx={{
                color: 'primary.secondary',
                position: isExpanded ? 'relative' : 'absolute',
                left: isExpanded ? '0' : '50%',
                top: isExpanded ? '0' : '50%',
                transform: isExpanded ? 'none' : 'translate(-50%, -50%)',
                fontSize: isExpanded ? '1.5rem' : '5rem',
                //show only when collapsed
              }} />

              <NodeHeaderTitle>{nodeLabel}</NodeHeaderTitle>
          <NodeHeaderActions>
            <ExpandCollapseButton
              collapsedDimensions={collapsedDimensions}
              expandedDimensions={expandedDimensions}
              nodeInFlow={nodeInFlow}
              />
            <NodeHeaderMenuAction label="Container Options">
              {invisibleNodeMenuItems}
              <NodeHeaderDeleteAction />
            </NodeHeaderMenuAction>
          </NodeHeaderActions>
              </>
            )}
        </Box>
      </InvisibleNodeContainer>
    </>
  );
};

export default InvisibleNode;