import React, { useState } from 'react';
import { NodeProps, Position, useReactFlow } from '@xyflow/react';
import { ConditionalHandle } from './ConditionalNodeStyles'; // HandleLabel might not be needed if text is outside
import { Menu, MenuItem, Paper, Box, Avatar } from '@mui/material';
import CallSplitIcon from '@mui/icons-material/CallSplit';
import { useSelect } from '../../Select/contexts/SelectContext';
import { colorByDepth } from '../common/utils/colorByDepth';

/**
 * ConditionalNode Component
 * 
 * A node with a circular icon display and text label below, representing a condition.
 * Outputs: "OK" (true) downward, "Not OK" (false) to the right.
 * Settings accessible via a modal on click (placeholder).
 */
export const ConditionalNode: React.FC<NodeProps> = ({
  width,
  height,
  data,
  selected,
  id
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const { deleteSelected } = useSelect();
  const { getNode } = useReactFlow();
  const nodeInFlow = getNode(id);
  const nodeDepth = nodeInFlow?.data.depth || 0;
  const color = colorByDepth(nodeDepth as number);

  const handleContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    setAnchorEl(event.currentTarget); // Context menu on the circle
  };

  const handleCloseContextMenu = () => {
    setAnchorEl(null);
  };

  const handleNodeClick = () => {
    setIsSettingsModalOpen(true);
    // console.log(`Node ${id} clicked, opening settings modal.`);
  };

  const handleCloseSettingsModal = () => {
    setIsSettingsModalOpen(false);
  };

  const nodeLabel = data?.label ? String(data.label) : 'Condition';
  const nodeDetails = data?.details ? String(data.details) : undefined;

  const circleSize = height || width || 100; // Default size if not provided


  return (
    <>
      {/* Placeholder for Settings Modal */}
      {/* {isSettingsModalOpen && (
          <SettingsModal nodeId={id} isOpen={isSettingsModalOpen} onClose={handleCloseSettingsModal} />
        )} */}

      <ConditionalHandle type="target" position={Position.Top} id="input" color={color} />
      <ConditionalHandle type="source" position={Position.Right} id="false" color="#f44336" />
      <ConditionalHandle type="source" position={Position.Bottom} id="true" color="#4caf50" />

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={selected ? 8 : 2}
          sx={{
            width: circleSize,
            height: circleSize,
            bgcolor: color,
            borderRadius: '50%',
            borderColor: selected ? "black" : 'divider',
            borderWidth: selected ? '2px' : '1px',
            borderStyle: 'solid',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'border-color 0.2s, box-shadow 0.2s, border-width 0.2s',
            cursor: 'pointer',
            boxSizing: 'border-box',
          }}
          onContextMenu={handleContextMenu}
          onClick={handleNodeClick}
        >
          <Avatar
            sx={{
              backgroundColor: "transparent",
              width: circleSize * 0.6, // Icon Avatar takes up 60% of circle
              height: circleSize * 0.6,
            }}
          >
            <CallSplitIcon sx={{ color: "black", fontSize: circleSize * 0.4 }} /> {/* Icon itself takes 40% of circle */}
          </Avatar>
        </Paper>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseContextMenu}
      >
        <MenuItem onClick={() => { deleteSelected(); handleCloseContextMenu(); }}>Delete Node</MenuItem>
      </Menu>
    </>
  );
};

export default ConditionalNode;