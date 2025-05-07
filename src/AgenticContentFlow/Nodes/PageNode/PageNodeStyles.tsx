import { styled } from "@mui/material/styles";
import { BaseNodeContainer, BaseNodeProps } from "../common/NodeStyles";

// Define additional props interface for the ViewNodeContainer
interface PageNodeProps extends BaseNodeProps {
  isExpanded?: boolean;
}



// Custom container for ViewNode with dashboard-like appearance incorporating DataNode's style elements
// Custom container for DataNode with file/folder appearance
export const PageNodeContainer = styled(BaseNodeContainer)<PageNodeProps>(({ isExpanded}) => ({
  position: 'relative',
  padding: 0,
  overflow: 'visible',
  zIndex: 0,
  borderRadius: '6px',
  //boxShadow: '0 10px 20px rgba(0,0,0,0.15)',
  border: !isExpanded ?`2px solid black` : "none",
  //borderTop: `10px solid black`,
  //Add thick shadow to the top
  boxShadow: `5px -2px black`,

}));

