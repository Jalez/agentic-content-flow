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
  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
  border: `2px solid ${color}`,
  borderTop: `3px solid ${color}`,
  marginTop: '20px', // Add space for the tab that will contain the label
  
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
    border: `2px solid ${color}`,
    
    borderRight: 'none',
    //boxShadow: '0 -2px 5px rgba(0,0,0,0.1)',
  },
  
  // Tab label container
  '.tab-label': {
    position: 'absolute',
    top: '-19px',
    left: '30px', // Offset from left to accommodate icon
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    maxWidth: isCollapsed ? '140px' : '180px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',

    
    '& .MuiSvgIcon-root': {
      marginRight: '6px',
    },
    
    '& .tab-text': {
      fontWeight: 500,
      fontSize: '0.875rem',
      color: theme.palette.getContrastText(color), // Ensure text is readable on color background
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    }
  },
  
  // Styles specific to collapsed state
  ...(isCollapsed && {
    height: '60px !important', // Force height in collapsed state
    display: 'flex',
    alignItems: 'center',
    
    // Header styling when collapsed
    '& .dragHandle': {
      backgroundColor: 'transparent',
      borderBottom: 'none',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end', // Push controls to the right
      padding: '0 12px',
      color: theme.palette.getContrastText(color), // Text color that contrasts with background
    },
    
    // Hide file explorer content when collapsed
    '& .file-explorer-content': {
      display: 'none'
    }
  }),
  
  // Styles specific to expanded state
  ...(!isCollapsed && {
    display: 'flex',
    flexDirection: 'column',
    
    // Add more depth to the expanded folder
    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
    
    // Header styling when expanded
    '& .dragHandle': {
      backgroundColor: 'transparent', // Make header transparent
      borderBottom: `1px solid ${theme.palette.divider}`,
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end', // Push controls to the right
      padding: '8px 12px',
    }
  }),
  
  // Ensure the menu stays inside the container
  '.MuiIconButton-root': {
    padding: '4px'
  },
  
  // File explorer list item styling
  '& .MuiListItem-root': {
    borderBottom: `1px solid ${theme.palette.divider}`,
    '&:hover': {
      backgroundColor: theme.palette.action.hover
    }
  }
}));