import { styled } from "@mui/material/styles";
import { BaseNodeContainer } from "../common/NodeStyles";

// Define additional props interface for the DataNodeContainer
interface DataNodeProps {
  isCollapsed?: boolean;
}

// Custom container for DataNode with file/folder appearance
export const DataNodeContainer = styled(BaseNodeContainer)<DataNodeProps>(({ theme, color, selected, isCollapsed = true }) => ({
  position: 'relative',
  padding: 0,
  overflow: 'visible',
  zIndex: 0,
  borderRadius: '6px',
  //boxShadow: '0 10px 20px rgba(0,0,0,0.15)',
  border: `2px solid black`,
  //borderTop: `10px solid black`,
  marginTop: '20px', // Add space for the tab that will contain the label
  //Add thick shadow to the top
  boxShadow: `5px -2px black`,
  // Folder tab that will contain the label
  '&::before': {
    content: '""',
    position: 'absolute',
    
    top: '-23px', // Position at the top
    left: '-2px', // Start from the left corner
    width: isCollapsed ? '180px' : '220px', // Wide enough for label
    height: '24px', // Tall enough for text
    backgroundColor: isCollapsed ? color : `${color}`, // Use the color directly when collapsed, lighter with opacity when expanded
    borderTopLeftRadius: '6px',
    borderTopRightRadius: '6px',
    border: `2px solid black`,
    
    borderRight: 'none',
    borderBottom: `none`,
    boxShadow: '3px -3px black',
  },
}));