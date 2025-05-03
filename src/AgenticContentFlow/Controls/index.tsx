/** @format */
import React, { memo, useCallback, useMemo } from "react";
import { ControlsProvider, useControls } from "./context/ControlsContext";
import { registerControl } from "./registry/controlsRegistry";

// Import the UnifiedControlsPanel that uses the registry
import UnifiedControlsPanel from "./registry/UnifiedControlsPanel";

// Import our control components
import NavigationControls from "./Components/NavigationControls";
import ViewSettingsControls from "./Components/ViewSettingsControls";
import { CONTROL_IDS, CONTROL_PRIORITIES, CONTROL_TYPES } from "../constants";

interface UnifiedControlsProps {
  onFitView: () => void;
  onToggleFullscreen: () => void;
}

/**
 * Inner component that handles the registration of controls
 * This component is wrapped by ControlsProvider, so it has access to the context
 */
const ControlsRegistration = memo<UnifiedControlsProps>(({
  onFitView,
  onToggleFullscreen,
}) => {
  const { showShortcuts, toggleShortcuts } = useControls();

  // Memoize the navigation controls component creation
  const NavControlsWithProps = useCallback(() => (
    <NavigationControls
      onFitView={onFitView}
      onToggleFullscreen={onToggleFullscreen}
      showShortcuts={showShortcuts}
      onToggleShortcuts={toggleShortcuts}
    />
  ), [onFitView, onToggleFullscreen, showShortcuts, toggleShortcuts]);

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

  // Register view settings controls - only once
  React.useEffect(() => {
    // The ViewSettingsControl will receive its props from the ControlsContext
    registerControl(
      CONTROL_TYPES.VIEW_SETTINGS,
      CONTROL_TYPES.MINDMAP,
      CONTROL_IDS.VIEW_SETTINGS_CONTROLS,
      ViewSettingsControls,
      {},
      CONTROL_PRIORITIES.VIEW_SETTINGS
    );

    // Clean up when unmounted
    return () => {
      // No need to unregister as the component is unmounting
    };
  }, []); // Empty dependency array = only run once

  // Memoize the UnifiedControlsPanel to prevent unnecessary re-renders
  const memoizedPanel = useMemo(() => <UnifiedControlsPanel />, []);
  
  return memoizedPanel;
});

ControlsRegistration.displayName = 'ControlsRegistration';

/**
 * UnifiedControls Component
 *
 * @version 2.0.0
 *
 * An improved version of the mindmap controls using the registry system.
 * Registers the default controls and provides the context for all controls.
 */
const UnifiedControls = memo<UnifiedControlsProps>(({
  onFitView,
  onToggleFullscreen,
}) => {
  // Memoize the callback functions to ensure stable references
  const memoizedFitView = useCallback(() => {
    onFitView();
  }, [onFitView]);
  
  const memoizedToggleFullscreen = useCallback(() => {
    onToggleFullscreen();
  }, [onToggleFullscreen]);
  
  return (
    <ControlsProvider
      onFitView={memoizedFitView}
      onToggleFullscreen={memoizedToggleFullscreen}
    >
      <ControlsRegistration
        onFitView={memoizedFitView}
        onToggleFullscreen={memoizedToggleFullscreen}
      />
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
