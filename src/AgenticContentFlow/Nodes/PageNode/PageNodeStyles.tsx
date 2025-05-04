import { styled } from "@mui/material/styles";
import { BaseNodeContainer } from "../common/NodeStyles";

// Clean, minimal container for PageNode
export const PageNodeContainer = styled(BaseNodeContainer)(({ theme, color, selected }) => ({
  // Modern page appearance
  borderRadius: '6px',
  position: 'relative',
  overflow: 'visible',
  boxShadow: selected 
    ? `0 0 0 2px ${color}, 0 4px 8px rgba(0, 0, 0, 0.08)` 
    : '0 2px 4px rgba(0, 0, 0, 0.05)',
  border: 'none',  // Remove default border
  backgroundColor: theme.palette.mode === 'dark' 
    ? theme.palette.grey[900]
    : '#ffffff',
    
  // Simple colored accent at top
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    backgroundColor: color,
    borderTopLeftRadius: '6px',
    borderTopRightRadius: '6px',
    opacity: selected ? 1 : 0.7,
    zIndex: 2
  },
  
  // Clean content area
  '& .page-content-area': {
    position: 'absolute',
    top: 60, // Below the header
    bottom: 0,
    left: 0,
    right: 0,
    borderTop: `1px solid ${theme.palette.divider}`,
    padding: '12px',
    zIndex: 1
  }
}));