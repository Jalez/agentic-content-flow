/** @format */
import React, { useMemo } from "react";
import { Box } from "@mui/material";
import {
  useControlsRegistry,
  ControlType,
  ControlEntry,
} from "./controlsRegistry";

interface RegisteredControlsProps {
  type: ControlType;
  context: string;
  containerSx?: React.CSSProperties;
}

/**
 * RegisteredControls Component
 *
 * @version 1.0.0
 *
 * A dynamic component that renders controls based on the specified type and context.
 * Automatically updates when controls are registered or unregistered.
 *
 * @example
 * ```tsx
 * // Render navigation controls for the mindmap
 * <RegisteredControls type="navigation" context="mindmap" />
 *
 * // Render view settings with custom styles
 * <RegisteredControls
 *   type="viewSettings"
 *   context="mindmap"
 *   containerSx={{ display: 'flex', gap: 2 }}
 * />
 * ```
 */
const RegisteredControls: React.FC<RegisteredControlsProps> = ({
  type,
  context,
  containerSx = { display: "flex", gap: 1 },
}) => {
  // Use the improved hook to get controls
  const { getControls, version } = useControlsRegistry();

  // Get controls for the specified type and context
  const controls = useMemo(
    () => getControls(type, context),
    [getControls, type, context]
  );

  if (!controls.length) return null;

  return (
    <Box sx={containerSx}>
      {controls.map((entry: ControlEntry, index) => {
        const { Component, props } = entry;
        // Render with props if available, otherwise render without props
        return (
          <Component
            key={`${type}-${context}-${entry.name || index}-${version}`}
            {...(props || {})}
          />
        );
      })}
    </Box>
  );
};

export default RegisteredControls;
