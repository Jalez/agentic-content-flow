/** @format */
import { useEffect } from "react";
import {
  registerControl,
  unregisterControl,
} from "../Controls/registry/controlsRegistry";
import { CONTROL_TYPES } from "../constants";
import LayoutControls from "./controls/LayoutControls";

/**
 * Component that registers the layout controls in the controls registry
 * This is a non-rendering component that manages the control registration lifecycle
 */
const LayoutControlsRegistration = () => {
  useEffect(() => {
    // Register the layout controls in the tools section
    registerControl(
      "layout", // Create a new layout section
      CONTROL_TYPES.MINDMAP,
      "LAYOUT_CONTROLS",
      LayoutControls, 
      {}, // No props needed as component uses hooks internally
      20 // Priority - lower than test data switcher
    );

    // Cleanup when unmounted
    return () => {
      unregisterControl("layout", CONTROL_TYPES.MINDMAP, "LAYOUT_CONTROLS");
    };
  }, []); // Empty dependency array ensures this runs only once

  // This component doesn't render anything
  return null;
};

export default LayoutControlsRegistration;
