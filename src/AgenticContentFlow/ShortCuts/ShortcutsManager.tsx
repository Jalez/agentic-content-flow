/** @format */
import React, { useEffect } from "react";
import { ShortcutsProvider, useShortcuts } from "./context/ShortcutsContext";
import ShortcutsDisplay from "./components/ShortcutsDisplay";
import ShortcutsToggleButton from "./components/ShortcutsToggleButton";
import { useKeyboardShortcutHandler, registerShortcut, DEFAULT_SHORTCUT_CATEGORIES } from "./registry/shortcutsRegistry";
import { registerControl } from "../Controls/registry/controlsRegistry";
import { CONTROL_TYPES } from "../constants";

/**
 * Internal component that registers the shortcuts toggle button and manages shortcuts
 * This component has access to the ShortcutsProvider context
 */
const ShortcutsRegistration: React.FC = () => {
  const { toggleShortcuts } = useShortcuts();

  useEffect(() => {
    // Register the shortcuts toggle control in the controls registry
    registerControl(
      CONTROL_TYPES.NAVIGATION,
      CONTROL_TYPES.MINDMAP,
      "SHORTCUTS_TOGGLE",
      ShortcutsToggleButton,
      {},
      1 // High priority to appear early
    );

    // Register the shortcut for toggling shortcuts display
    registerShortcut(
      DEFAULT_SHORTCUT_CATEGORIES.VIEW_SETTINGS,
      "toggle-shortcuts",
      "k",
      toggleShortcuts,
      "Toggle shortcuts display",
      true,
      1
    );

    // No cleanup needed - components handle their own lifecycle
  }, [toggleShortcuts]);

  // Enable keyboard shortcut handling at this level
  useKeyboardShortcutHandler();

  return null; // This component doesn't render anything
};

/**
 * Display component that shows shortcuts when enabled
 */
const ShortcutsDisplayManager: React.FC = () => {
  const { showShortcuts } = useShortcuts();

  return showShortcuts ? <ShortcutsDisplay /> : null;
};

interface ShortcutsManagerProps {
  children?: React.ReactNode;
  initialShow?: boolean;
}

/**
 * Main shortcuts manager component that provides the complete shortcuts system
 * This is the main entry point for the shortcuts system
 * 
 * Features:
 * - Registry-based shortcut management
 * - Automatic keyboard event handling
 * - Context-based state management
 * - Integration with controls registry
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <ShortcutsManager>
 *   <YourApp />
 * </ShortcutsManager>
 * 
 * // With shortcuts initially visible
 * <ShortcutsManager initialShow={true}>
 *   <YourApp />
 * </ShortcutsManager>
 * ```
 */
const ShortcutsManager: React.FC<ShortcutsManagerProps> = ({
  children,
  initialShow = false,
}) => {
  return (
    <ShortcutsProvider initialShow={initialShow}>
      <ShortcutsRegistration />
      <ShortcutsDisplayManager />
      {children}
    </ShortcutsProvider>
  );
};

export default ShortcutsManager;

// Export the registry functions for external use
export {
  registerShortcut,
  unregisterShortcut,
  getShortcuts,
  getAllShortcuts,
  getShortcutCategories,
  clearShortcuts,
  hasShortcut,
  executeShortcut,
  useShortcutsRegistry,
  useKeyboardShortcutHandler,
  DEFAULT_SHORTCUT_CATEGORIES,
} from "./registry/shortcutsRegistry";

export type {
  ShortcutEntry,
  ShortcutCategory,
  KeyCombination,
} from "./registry/shortcutsRegistry";

export { useShortcuts, ShortcutsProvider } from "./context/ShortcutsContext";
export { default as ShortcutsDisplay } from "./components/ShortcutsDisplay";
export { default as ShortcutsToggleButton } from "./components/ShortcutsToggleButton";