/** @format */
import { Fragment, useMemo, memo } from "react";
import { Box, Paper, useTheme, SxProps, Theme, Divider } from "@mui/material";
import { Panel, PanelPosition } from "@xyflow/react";

import RegisteredControls from "./RegisteredControls";
import KeyboardShortcutPanel from "../../KeyboardShortCuts";
import { useControls } from "../context/ControlsContext";
import { CONTROL_TYPES } from "../../constants";
import { useControlsRegistry } from "./controlsRegistry";

interface UnifiedControlsPanelProps {
  context?: string;
  position?: PanelPosition;
}

/**
 * UnifiedControlsPanel Component
 *
 * @version 2.0.0
 *
 * A panel component that displays registered controls of different types.
 * Uses the controls registry system to dynamically render controls.
 * Now supports dynamically registered control types.
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
const UnifiedControlsPanel: React.FC<UnifiedControlsPanelProps> = memo(({
  position = "top-right",
  context = CONTROL_TYPES.MINDMAP,
}) => {
  const theme = useTheme();
  const { showShortcuts } = useControls();
  const { getControlTypes } = useControlsRegistry();

  const dividerSectionStyle: SxProps<Theme> = useMemo(() => ({
    display: "flex",
    gap: 1,
    "&:not(:empty)::before": {
      content: '""',
      borderLeft: `1px solid ${theme.palette.divider}`,
      marginLeft: 1,
      marginRight: 1,
    },
  }), [theme.palette.divider]);

  // Get all registered control types for this context
  const controlTypes = useMemo(() => getControlTypes(context), [getControlTypes, context]);

  // Only log in development
  if (process.env.NODE_ENV === 'development') {
    console.log("UnifiedControlsPanel - control types:", controlTypes);
  }

  // Memoize the entire controls panel structure
  const controlsPanel = useMemo(() => (
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
          {controlTypes.map((type, index) => (
            <Fragment key={`control-type-${type}`}>
              {index > 0 && <Divider orientation="vertical" flexItem sx={dividerSectionStyle} />}
              <RegisteredControls
                type={type}
                context={context}
              />
            </Fragment>
          ))}
        </Box>
      </Paper>
    </Panel>
  ), [position, theme.palette.background.paper, controlTypes, context, dividerSectionStyle]);

  return (
    <>
      {controlsPanel}
      {/* Keyboard Shortcuts Panel */}
      {showShortcuts && <KeyboardShortcutPanel />}
    </>
  );
});

UnifiedControlsPanel.displayName = 'UnifiedControlsPanel';

export default UnifiedControlsPanel;
