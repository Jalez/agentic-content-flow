import React from 'react';
import { IconButton } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { Node } from "@xyflow/react";
import { useNodeHistoryState } from "../../Node/hooks/useNodeState";

interface FolderExpandButtonProps {
  /**
   * Whether the node is currently expanded
   */
  isExpanded: boolean;

  /**
   * Callback to toggle expanded state
   */
  onToggle: () => void;
}

/**
 * A custom button component for expanding and collapsing folder nodes
 */
export const FolderExpandButton = ({
  isExpanded,
  onToggle
}: FolderExpandButtonProps) => {
  return (
    <IconButton
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      size="small"
      sx={{ ml: 1 }}
      aria-label={isExpanded ? "Collapse folder" : "Expand folder"}
    >
      {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
    </IconButton>
  );
};

export default FolderExpandButton;