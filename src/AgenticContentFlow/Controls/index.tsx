/** @format */
import React, { memo, useCallback, useMemo } from "react";
import { ControlsProvider } from "./context/ControlsContext";
import { registerControl } from "./registry/controlsRegistry";

// Import the UnifiedControlsPanel that uses the registry
import UnifiedControlsPanel from "./registry/UnifiedControlsPanel";

// Import our control components
import NavigationControls from "./Components/NavigationControls";
import { CONTROL_IDS, CONTROL_PRIORITIES, CONTROL_TYPES } from "../constants";

interface UnifiedControlsProps {
  onToggleFullscreen: () => void;
  children?: React.ReactNode;
}

/**
 * Inner component that handles the registration of controls
 * This component is wrapped by ControlsProvider, so it has access to the context
 */
const ControlsRegistration = memo<UnifiedControlsProps>(({
  onToggleFullscreen,
}) => {
  // Memoize the navigation controls component creation
  const NavControlsWithProps = useCallback(() => (
    <NavigationControls onToggleFullscreen={onToggleFullscreen} />
  ), [onToggleFullscreen]);

  // Register the default navigation controls
  React.useEffect(() => {
    // Register the navigation controls
    registerControl(
      CONTROL_TYPES.NAVIGATION,
      CONTROL_TYPES.MINDMAP,
      CONTROL_IDS.NAVIGATION_CONTROLS,
      NavControlsWithProps,
      {},
      CONTROL_PRIORITIES.NAVIGATION
    );

    // Clean up when unmounted
    return () => {
      // No need to unregister as the component is unmounting
    };
  }, [NavControlsWithProps]); // Only depend on the memoized component creator

  // Memoize the UnifiedControlsPanel to prevent unnecessary re-renders
  const memoizedPanel = useMemo(() => <UnifiedControlsPanel />, []);
  
  return memoizedPanel;
});

ControlsRegistration.displayName = 'ControlsRegistration';

/**
 * UnifiedControls Component
 *
 * @version 3.0.0
 *
 * An improved version of the mindmap controls using the registry system.
 * Registers the default controls and provides the context for all controls.
 * Shortcuts functionality has been moved to the dedicated ShortcutsManager.
 */
const UnifiedControls = memo<UnifiedControlsProps>(({
  onToggleFullscreen,
  children,
}) => {
  const memoizedToggleFullscreen = useCallback(() => {
    onToggleFullscreen();
  }, [onToggleFullscreen]);
  
  return (
    <ControlsProvider onToggleFullscreen={memoizedToggleFullscreen}>
      {children}
      {/* Render the ControlsRegistration component to register controls */}
      <ControlsRegistration onToggleFullscreen={memoizedToggleFullscreen} />
    </ControlsProvider>
  );
});

UnifiedControls.displayName = 'UnifiedControls';

export default UnifiedControls;

// Export registry functions for external control registration
export {
  registerControl,
  unregisterControl,
  getControls,
  clearControls,
} from "./registry/controlsRegistry";

export type { ControlType, ControlEntry } from "./registry/controlsRegistry";
export { default as RegisteredControls } from "./registry/RegisteredControls";
export { default as UnifiedControlsPanel } from "./registry/UnifiedControlsPanel";
