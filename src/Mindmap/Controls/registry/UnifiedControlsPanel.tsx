/** @format */
import React from "react";
import { Box, Divider, Paper, useTheme, SxProps, Theme } from "@mui/material";
import { Panel, PanelPosition } from "@xyflow/react";

import RegisteredControls from "./RegisteredControls";
import KeyboardShortcutPanel from "../../KeyboardShortCuts";
import { useControls } from "../context/ControlsContext";
import { CONTROL_TYPES } from "../../constants";

interface UnifiedControlsPanelProps {
  context?: string;
  position?: PanelPosition;
}

/**
 * UnifiedControlsPanel Component
 *
 * @version 1.0.0
 *
 * A panel component that displays registered controls of different types.
 * Uses the controls registry system to dynamically render controls.
 *
 * @example
 * ```tsx
 * // Basic usage - will use "mindmap" as default context
 * <UnifiedControlsPanel />
 *
 * // With custom context
 * <UnifiedControlsPanel context="customContext" />
 *
 * // With custom position
 * <UnifiedControlsPanel position="bottom-left" />
 * ```
 */
const UnifiedControlsPanel: React.FC<UnifiedControlsPanelProps> = ({
  position = "top-right",
}) => {
  const theme = useTheme();
  const { showShortcuts } = useControls();

  const dividerSectionStyle: SxProps<Theme> = {
    display: "flex",
    gap: 1,
    "&:not(:empty)::before": {
      content: '""',
      borderLeft: `1px solid ${theme.palette.divider}`,
      marginLeft: 1,
      marginRight: 1,
    },
  };

  return (
    <>
      <Panel position={position}>
        <Paper
          elevation={3}
          sx={{
            borderRadius: 1,
            backgroundColor: theme.palette.background.paper,
            overflow: "hidden",
            mr: 4,
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "row", gap: 2, p: 1 }}>
            <RegisteredControls
              type="navigation"
              context={CONTROL_TYPES.MINDMAP}
            />

            <Divider orientation="vertical" flexItem />

            <RegisteredControls
              type="viewSettings"
              context={CONTROL_TYPES.MINDMAP}
            />

            {/* Only add tools section if there are registered tools */}
            <RegisteredControls
              type="tools"
              context={CONTROL_TYPES.MINDMAP}
              containerSx={dividerSectionStyle}
            />

            {/* Only add custom section if there are registered custom controls */}
            <RegisteredControls
              type="custom"
              context={CONTROL_TYPES.MINDMAP}
              containerSx={dividerSectionStyle}
            />
          </Box>
        </Paper>
      </Panel>

      {/* Keyboard Shortcuts Panel */}
      {showShortcuts && <KeyboardShortcutPanel />}
    </>
  );
};

export default UnifiedControlsPanel;
