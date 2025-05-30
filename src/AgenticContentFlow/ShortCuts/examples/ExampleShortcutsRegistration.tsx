/** @format */
import { useEffect } from "react";
import { registerShortcut, unregisterShortcut, DEFAULT_SHORTCUT_CATEGORIES } from "../registry/shortcutsRegistry";

/**
 * Example component demonstrating how to register shortcuts
 * This shows how any component can register actions with the shortcuts system
 */
const ExampleShortcutsRegistration = () => {
  useEffect(() => {
    // Example: Register navigation shortcuts
    registerShortcut(
      DEFAULT_SHORTCUT_CATEGORIES.NAVIGATION,
      "fit-view",
      "Ctrl+F",
      () => {
        console.log("Fit view action triggered");
        // Example: reactFlowInstance?.fitView();
      },
      "Fit all nodes to view",
      true,
      10
    );

    registerShortcut(
      DEFAULT_SHORTCUT_CATEGORIES.NAVIGATION,
      "center-selection",
      "Ctrl+Shift+C",
      () => {
        console.log("Center selection action triggered");
        // Example: centerSelectedNodes();
      },
      "Center selected node",
      true,
      20
    );

    // Example: Register view settings shortcuts
    registerShortcut(
      DEFAULT_SHORTCUT_CATEGORIES.VIEW_SETTINGS,
      "toggle-grid",
      "Ctrl+G",
      () => {
        console.log("Toggle grid action triggered");
        // Example: setShowGrid(!showGrid);
      },
      "Toggle grid visibility",
      true,
      10
    );

    registerShortcut(
      DEFAULT_SHORTCUT_CATEGORIES.VIEW_SETTINGS,
      "toggle-snap",
      "Ctrl+S",
      () => {
        console.log("Toggle snap action triggered");
        // Example: setSnapToGrid(!snapToGrid);
      },
      "Toggle snap to grid",
      true,
      20
    );

    // Example: Register zoom shortcuts
    registerShortcut(
      DEFAULT_SHORTCUT_CATEGORIES.NAVIGATION,
      "zoom-in",
      "Ctrl+=",
      () => {
        console.log("Zoom in action triggered");
        // Example: reactFlowInstance?.zoomIn();
      },
      "Zoom in",
      true,
      30
    );

    registerShortcut(
      DEFAULT_SHORTCUT_CATEGORIES.NAVIGATION,
      "zoom-out",
      "Ctrl+-",
      () => {
        console.log("Zoom out action triggered");
        // Example: reactFlowInstance?.zoomOut();
      },
      "Zoom out",
      true,
      40
    );

    // Example: Register editing shortcuts
    registerShortcut(
      DEFAULT_SHORTCUT_CATEGORIES.EDITING,
      "delete",
      "Delete",
      () => {
        console.log("Delete action triggered");
        // Example: deleteSelectedNodes();
      },
      "Delete selected items",
      true,
      10
    );

    registerShortcut(
      DEFAULT_SHORTCUT_CATEGORIES.EDITING,
      "copy",
      "Ctrl+C",
      () => {
        console.log("Copy action triggered");
        // Example: copySelectedNodes();
      },
      "Copy selected items",
      true,
      20
    );

    // Example: Register fullscreen shortcut
    registerShortcut(
      DEFAULT_SHORTCUT_CATEGORIES.VIEW_SETTINGS,
      "toggle-fullscreen",
      "F11",
      () => {
        console.log("Toggle fullscreen action triggered");
        // Example: toggleFullscreen();
      },
      "Toggle fullscreen",
      true,
      30
    );

    // Cleanup function to unregister shortcuts
    return () => {
      unregisterShortcut(DEFAULT_SHORTCUT_CATEGORIES.NAVIGATION, "fit-view");
      unregisterShortcut(DEFAULT_SHORTCUT_CATEGORIES.NAVIGATION, "center-selection");
      unregisterShortcut(DEFAULT_SHORTCUT_CATEGORIES.VIEW_SETTINGS, "toggle-grid");
      unregisterShortcut(DEFAULT_SHORTCUT_CATEGORIES.VIEW_SETTINGS, "toggle-snap");
      unregisterShortcut(DEFAULT_SHORTCUT_CATEGORIES.NAVIGATION, "zoom-in");
      unregisterShortcut(DEFAULT_SHORTCUT_CATEGORIES.NAVIGATION, "zoom-out");
      unregisterShortcut(DEFAULT_SHORTCUT_CATEGORIES.EDITING, "delete");
      unregisterShortcut(DEFAULT_SHORTCUT_CATEGORIES.EDITING, "copy");
      unregisterShortcut(DEFAULT_SHORTCUT_CATEGORIES.VIEW_SETTINGS, "toggle-fullscreen");
    };
  }, []);

  // This component doesn't render anything
  return null;
};

export default ExampleShortcutsRegistration;