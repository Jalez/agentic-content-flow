import { styled } from "@mui/material/styles";
import { BaseNodeContainer } from "../common/NodeStyles";

// Custom container for DataNode with database-like appearance
export const DataNodeContainer = styled(BaseNodeContainer)(({ theme, color, selected }) => ({
  // Special database-like appearance
  borderRadius: '8px 8px 8px 8px',
  borderBottom: `12px solid ${selected ? color : theme.palette.divider}`,
  position: 'relative',
  overflow: 'visible',
  
  // Add database-like lines
  '&::before': {
    content: '""',
    position: 'absolute',
    bottom: '-8px',
    left: '10%',
    right: '10%',
    height: '4px',
    backgroundColor: theme.palette.background.paper,
    borderLeft: `1px solid ${selected ? color : theme.palette.divider}`,
    borderRight: `1px solid ${selected ? color : theme.palette.divider}`,
    zIndex: 1
  },

  // Database top ellipse effect
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '8px',
    borderRadius: '8px 8px 0 0',
    backgroundColor: selected ? color : theme.palette.divider,
    opacity: 0.6
  }
}));