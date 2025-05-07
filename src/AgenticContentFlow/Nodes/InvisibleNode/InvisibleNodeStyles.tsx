import { styled } from "@mui/system";
import { BaseNodeContainer, BaseNodeProps } from "../common/NodeStyles";

interface InvisibleNodeProps extends BaseNodeProps {
    isExpanded?: boolean;
  }

export const InvisibleNodeContainer = styled(BaseNodeContainer, {
    shouldForwardProp: (prop) => !["isExpanded", "selected", "color"].includes(prop as string),
  })<InvisibleNodeProps>(({ isExpanded }) => ({
    position: 'relative',
    padding: 0,
    overflow: 'visible',
    zIndex: 0,
    borderRadius: '6px',
    backgroundColor: isExpanded ? 'transparent' : 'white',
    border: isExpanded ? '4px dashed black' : '2px solid black',
    boxShadow: isExpanded ? 'none' : '5px -2px black',
  
    transition: 'all 0.2s ease',
    '&:hover': {
      borderColor: 'black',
    }
  }));