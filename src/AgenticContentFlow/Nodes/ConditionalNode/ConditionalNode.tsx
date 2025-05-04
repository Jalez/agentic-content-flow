import React, { useState } from 'react';
import { NodeProps, Position } from '@xyflow/react';
import { 
  DiamondContainer, 
  DiamondContent, 
  ConditionalHandle,
  DecisionLabel,
  HandleLabel
} from './ConditionalNodeStyles';
import { Menu, MenuItem } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useSelect } from '../../Select/contexts/SelectContext';

/**
 * ConditionalNode Component
 * 
 * A diamond-shaped node that represents a condition/decision in a flow diagram
 * with two output paths: "OK" (true) downward and "Not OK" (false) to the right.
 */
export const ConditionalNode: React.FC<NodeProps> = ({
  id,
  data,
  selected
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { deleteSelected } = useSelect();
  const color = "#ff9800"; // Orange color for conditional nodes
  
  const handleContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = () => {
    deleteSelected();
    handleClose();
  };

  // Type safety for data properties
  const nodeLabel = data?.label ? String(data.label) : 'Condition';
  const nodeDetails = data?.details ? String(data.details) : undefined;

  return (
    <>
      <div
        style={{
          position: 'relative',
          width: '150px',
          height: '150px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Input handle at the top */}
        <ConditionalHandle
          type="target"
          position={Position.Top}
          id="input"
          color={color}
          style={{
            top: '-5px',
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        />
        
        {/* Not OK (false) output handle on the right */}
        <ConditionalHandle
          type="source"
          position={Position.Right}
          id="false"
          color={color}
          isTrue={false}
          style={{
            right: '-5px',
            top: '50%',
            transform: 'translateY(-50%)'
          }}
        />
        <HandleLabel
          style={{
            right: '-35px',
            top: '50%',
            transform: 'translateY(-50%)'
          }}
        >
          Not OK
        </HandleLabel>
        
        {/* OK (true) output handle on the bottom */}
        <ConditionalHandle
          type="source"
          position={Position.Bottom}
          id="true"
          color={color}
          isTrue={true}
          style={{
            bottom: '-5px',
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        />
        <HandleLabel
          style={{
            bottom: '-25px',
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        >
          OK
        </HandleLabel>
        
        <DiamondContainer 
          color={color}
          selected={selected}
          elevation={2}
          onContextMenu={handleContextMenu}
        >
          <DiamondContent>
            <DecisionLabel variant="subtitle2">{nodeLabel}</DecisionLabel>
            {nodeDetails && (
              <div style={{ fontSize: '0.75rem', textAlign: 'center', maxWidth: '90%' }}>
                {nodeDetails}
              </div>
            )}
            {!nodeDetails && (
              <HelpOutlineIcon fontSize="small" color="disabled" />
            )}
          </DiamondContent>
        </DiamondContainer>
      </div>

      <Menu
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
      >
        <MenuItem onClick={() => {
          console.log('Edit condition');
          handleClose();
        }}>
          Edit Condition
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          Delete
        </MenuItem>
      </Menu>
    </>
  );
};

export default ConditionalNode;