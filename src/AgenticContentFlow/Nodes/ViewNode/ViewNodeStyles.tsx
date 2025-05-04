import { styled } from "@mui/material/styles";
import { BaseNodeContainer } from "../common/NodeStyles";

// Custom container for ViewNode with dashboard-like appearance
export const ViewNodeContainer = styled(BaseNodeContainer)(({ theme, color, selected }) => ({
  // Dashboard-like appearance
  borderRadius: '8px',
  position: 'relative',
  overflow: 'visible',
  
  // Add chart/graph pattern in the background
  '&::before': {
    content: '""',
    position: 'absolute',
    bottom: '10px',
    left: '20px',
    right: '20px',
    height: '60%',
    backgroundImage: `
      linear-gradient(90deg, ${color}20 1px, transparent 1px),
      linear-gradient(${color}20 1px, transparent 1px),
      linear-gradient(to top, ${color}60 0px, ${color}10 50%)
    `,
    backgroundSize: '20px 20px, 20px 20px, 100% 100%',
    backgroundPosition: 'center center',
    opacity: 0.3,
    borderRadius: '4px',
    zIndex: 0
  },
  
  // Add control panel effect at the top
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '45px',
    left: '10px',
    right: '10px',
    height: '15px',
    backgroundImage: `linear-gradient(90deg, 
      ${theme.palette.divider} 1px, 
      transparent 1px, 
      transparent 10px,
      ${theme.palette.divider} 1px, 
      transparent 1px,
      transparent 10px,
      ${theme.palette.divider} 1px
    )`,
    backgroundSize: '30px 15px',
    opacity: 0.5,
    borderRadius: '3px',
    zIndex: 1
  },
  
  // Dashboard border effect
  border: '0.5em solid',
  borderColor: selected ? color : theme.palette.divider,
  borderBottomWidth: '6px'
}));