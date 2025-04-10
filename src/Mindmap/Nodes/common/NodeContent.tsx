import { Box, Typography } from "@mui/material";

interface NodeContentProps {
  /**
   * Whether the node is a course node
   */
  isCourse: boolean;
  
  /**
   * The details text to display
   */
  details?: string;
}

/**
 * NodeContent component renders the content area of a node
 */
export const NodeContent = ({ isCourse, details }: NodeContentProps) => {
  // Don't render content for course nodes or if there are no details
  if (isCourse || !details) {
    return null;
  }
  
  return (
    <Box sx={{ flex: 1, p: 1.25 }}>
      <Typography variant="body2" color="text.secondary">
        {details}
      </Typography>
    </Box>
  );
};

export default NodeContent;