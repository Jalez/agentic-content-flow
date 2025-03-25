/** @format */
import React from "react";
import { Box, Paper, Typography, useTheme } from "@mui/material";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useControls } from "../Controls/context/ControlsContext";

interface KeyboardShortcut {
  key: string;
  description: string;
}

interface KeyboardShortcutPanelProps {
  shortcuts?: KeyboardShortcut[];
}

/**
 * Component that displays available keyboard shortcuts
 */
const KeyboardShortcutPanel: React.FC<KeyboardShortcutPanelProps> = ({
  shortcuts = [
    { key: "Ctrl+F", description: "Fit all nodes" },
    { key: "Ctrl+Shift+C", description: "Center selected node" },
    { key: "Ctrl++ / Ctrl+-", description: "Zoom in/out" },
    { key: "M", description: "Toggle mini-map" },
  ],
}) => {
  const theme = useTheme();

  const {
    fitView,
    centerSelected, // renamed from centerOnSelected
    showMiniMap,
    setShowMiniMap,
  } = useControls();

  // Use keyboard shortcuts
  useKeyboardShortcuts({
    fitView,
    centerSelected, // updated property
    showMiniMap,
    setShowMiniMap,
  });

  return (
    <Paper
      elevation={3}
      sx={{
        position: "absolute",
        bottom: "20px",
        left: "20px",
        backgroundColor: theme.palette.background.paper,
        padding: "10px",
        // borderRadius: theme.shape.borderRadius,
        fontSize: "12px",
        maxWidth: "250px",
        boxShadow: theme.shadows[2],
        zIndex: 5,
        color: theme.palette.text.primary,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Typography variant="h6" sx={{ mb: 1 }}>
        Keyboard Shortcuts
      </Typography>
      <Box component="ul" sx={{ m: "5px 0", pl: "20px" }}>
        {shortcuts.map((shortcut, index) => (
          <li key={index}>
            <Typography variant="body2" component="span">
              {shortcut.key}: {shortcut.description}
            </Typography>
          </li>
        ))}
      </Box>
    </Paper>
  );
};

export default KeyboardShortcutPanel;
