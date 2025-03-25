/** @format */
import React from "react";
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
const ControlsRegistration: React.FC<UnifiedControlsProps> = ({
  onFitView,
  onToggleFullscreen,
}) => {
  const { showShortcuts, toggleShortcuts } = useControls();

  // Register the default navigation controls
  React.useEffect(() => {
    const NavControlsWithProps = () => (
      <NavigationControls
        onFitView={onFitView}
        onToggleFullscreen={onToggleFullscreen}
        showShortcuts={showShortcuts}
        onToggleShortcuts={toggleShortcuts}
      />
    );

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
  }, [onFitView, onToggleFullscreen, showShortcuts, toggleShortcuts]);

  // Register view settings controls
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
  }, []);

  return <UnifiedControlsPanel />;
};

/**
 * UnifiedControls Component
 *
 * @version 2.0.0
 *
 * An improved version of the mindmap controls using the registry system.
 * Registers the default controls and provides the context for all controls.
 */
const UnifiedControls: React.FC<UnifiedControlsProps> = ({
  onFitView,
  onToggleFullscreen,
}) => {
  return (
    <ControlsProvider
      onFitView={onFitView}
      onToggleFullscreen={onToggleFullscreen}
    >
      <ControlsRegistration
        onFitView={onFitView}
        onToggleFullscreen={onToggleFullscreen}
      />
    </ControlsProvider>
  );
};

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
