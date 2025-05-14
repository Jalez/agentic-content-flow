/** @format */
import React, { useMemo, memo } from "react";
import { cn } from "@/lib/utils";
import {
  useControlsRegistry,
  ControlType,
  ControlEntry,
} from "./controlsRegistry";

interface RegisteredControlsProps {
  type: ControlType;
  context: string;
  className?: string;
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
 *   className="flex flex-col gap-4"
 * />
 * ```
 */
const RegisteredControls: React.FC<RegisteredControlsProps> = memo(({
  type,
  context,
  className,
}) => {
  // Use the improved hook to get controls
  const { getControls, version } = useControlsRegistry();

  // Get controls for the specified type and context
  const controls = useMemo(
    () => getControls(type, context),
    [getControls, type, context, version] // Include version in dependencies
  );

  // Memoize the rendered controls
  const renderedControls = useMemo(() => {
    if (!controls.length) return null;
    
    return (
      <div className={cn("flex gap-1", className)}>
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
      </div>
    );
  }, [controls, className, type, context, version]);

  return renderedControls;
});

RegisteredControls.displayName = 'RegisteredControls';

export default RegisteredControls;
