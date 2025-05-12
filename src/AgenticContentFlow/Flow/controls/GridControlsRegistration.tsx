/** @format */
import { useEffect } from "react";
import {
  registerControl,
  unregisterControl,
} from "../../Controls/registry/controlsRegistry";
import { CONTROL_TYPES } from "../../constants";
import GridControls from "./GridControls";

/**
 * Component that registers the grid controls in the controls registry
 * This is a non-rendering component that manages the control registration lifecycle
 */
const GridControlsRegistration = () => {
  useEffect(() => {
    // Register the grid controls in the flow section
    registerControl(
      "flow", // Create a flow section for flow-specific controls
      CONTROL_TYPES.MINDMAP,
      "GRID_CONTROLS",
      GridControls, 
      {}, // No props needed as component uses hooks internally
      10 // Priority - make it appear early in the flow controls section
    );

    // Cleanup when unmounted
    return () => {
      unregisterControl("flow", CONTROL_TYPES.MINDMAP, "GRID_CONTROLS");
    };
  }, []); // Empty dependency array ensures this runs only once

  // This component doesn't render anything
  return null;
};

export default GridControlsRegistration;