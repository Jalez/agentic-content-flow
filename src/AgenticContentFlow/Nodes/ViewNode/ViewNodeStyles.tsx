import { styled } from "@mui/material/styles";
import { BaseNodeContainer } from "../common/NodeStyles";

// Define additional props interface for the ViewNodeContainer
interface ViewNodeProps {
  isCollapsed?: boolean;
}

// Custom container for ViewNode with dashboard-like appearance incorporating DataNode's style elements
// Custom container for DataNode with file/folder appearance
export const ViewNodeContainer = styled(BaseNodeContainer)<ViewNodeProps>(({ }) => ({
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

}));