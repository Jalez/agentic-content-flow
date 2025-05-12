/** @format */
import React from "react";
import { Box } from "@mui/material";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import KeyboardIcon from "@mui/icons-material/Keyboard";
import ControlButton from "../ControlButton";

interface NavigationControlsProps {
  onToggleFullscreen: () => void;
  onToggleShortcuts: () => void;
  showShortcuts: boolean;
}

const NavigationControls: React.FC<NavigationControlsProps> = ({
  onToggleFullscreen,
  onToggleShortcuts,
  showShortcuts,
}) => {
  const controls = [
 

    {
      tooltip: "Toggle Fullscreen",
      icon: <OpenInFullIcon />,
      onClick: onToggleFullscreen,
    },
    {
      tooltip: "Toggle Shortcuts",
      icon: <KeyboardIcon />,
      onClick: onToggleShortcuts,
      active: showShortcuts,
    },
  ];

  return (
    <Box sx={{ display: "flex", gap: 1 }}>
      {controls.map((control) => (
        <ControlButton key={control.tooltip} {...control} />
      ))}
    </Box>
  );
};

export default NavigationControls;
