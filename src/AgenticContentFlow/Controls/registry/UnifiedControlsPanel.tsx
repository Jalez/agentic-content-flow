/** @format */
import { Fragment, useMemo, memo } from "react";
import { Panel, PanelPosition } from "@xyflow/react";

import RegisteredControls from "./RegisteredControls";
import { CONTROL_TYPES } from "../../constants";
import { useControlsRegistry } from "./controlsRegistry";

interface UnifiedControlsPanelProps {
  context?: string;
  position?: PanelPosition;
}

/**
 * UnifiedControlsPanel Component
 *
 * @version 3.0.0
 *
 * A panel component that displays registered controls of different types.
 * Uses the controls registry system to dynamically render controls.
 * Now uses the new decoupled shortcuts system.
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
  const { getControlTypes } = useControlsRegistry();

  // Get all registered control types for this context
  const controlTypes = useMemo(() => getControlTypes(context), [getControlTypes, context]);

  // Memoize the entire controls panel structure
  const controlsPanel = useMemo(() => (
    <Panel position={position}>
      <div className="rounded-md bg-card shadow-md overflow-hidden mr-4">
        <div className="flex flex-row gap-2 p-1">
          {controlTypes.map((type, index) => (
            <Fragment key={`control-type-${type}`}>
              {index > 0 && (
                <div className="flex before:content-[''] before:border-l before:border-border before:mx-1" />
              )}
              <RegisteredControls
                type={type}
                context={context}
              />
            </Fragment>
          ))}
        </div>
      </div>
    </Panel>
  ), [position, controlTypes, context]);

  return controlsPanel;
});

UnifiedControlsPanel.displayName = 'UnifiedControlsPanel';

export default UnifiedControlsPanel;
