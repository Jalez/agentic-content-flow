/** @format */
import React from "react";
import { Box } from "@mui/material";

// Icons
import GridOnIcon from "@mui/icons-material/GridOn";
import GridOffIcon from "@mui/icons-material/GridOff";
import SnapshotIcon from "@mui/icons-material/Dashboard";
import TouchAppIcon from "@mui/icons-material/TouchApp";

import ControlButton from "../ControlButton";

interface ViewSettingsControlsProps {
  showGrid: boolean;
  onToggleGrid: () => void;
  snapToGrid: boolean;
  onToggleSnapToGrid: () => void;
  touchMode: boolean;
  onToggleTouchMode: () => void;
}

/**
 * Component for view-related settings like grid, minimap, etc.
 */
const ViewSettingsControls: React.FC<ViewSettingsControlsProps> = ({
  showGrid,
  onToggleGrid,
  snapToGrid,
  onToggleSnapToGrid,
  touchMode,
  onToggleTouchMode,
}) => {
  const settings = [
    {
      tooltip: "Toggle Grid",
      onClick: onToggleGrid,
      icon: showGrid ? (
        <GridOnIcon fontSize="small" />
      ) : (
        <GridOffIcon fontSize="small" />
      ),
      active: showGrid,
    },
    {
      tooltip: "Snap to Grid",
      onClick: onToggleSnapToGrid,
      icon: <SnapshotIcon fontSize="small" />,
      active: snapToGrid,
    },

    {
      tooltip: "Touch Mode",
      onClick: onToggleTouchMode,
      icon: <TouchAppIcon fontSize="small" />,
      active: touchMode,
    },
  ];

  return (
    <Box sx={{ display: "flex", gap: 1 }}>
      {settings.map((setting, index) => (
        <ControlButton key={index} {...setting} />
      ))}
    </Box>
  );
};

export default ViewSettingsControls;
