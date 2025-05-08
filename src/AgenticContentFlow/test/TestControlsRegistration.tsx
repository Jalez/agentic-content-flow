/** @format */
import { useEffect } from "react";
import {
  registerControl,
  unregisterControl,
} from "../Controls/registry/controlsRegistry";
import { CONTROL_TYPES } from "../constants";
import { TestDataSwitcher } from "./TestDataSwitcher";

/**
 * TestControlsRegistration Component
 *
 * This component handles the registration and unregistration of test controls
 * for the mindmap. It's a non-rendering component that only manages the
 * control registration lifecycle.
 */
const TestControlsRegistration = () => {
  useEffect(() => {
    // Register the test data switcher control
    registerControl(
      "tools", // Use the tools section
      CONTROL_TYPES.MINDMAP,
      "TEST_DATA_SWITCHER",
      TestDataSwitcher,
      {}, // No props needed
      10 // Priority (lower numbers appear first)
    );

    // Cleanup when unmounted
    return () => {
      unregisterControl("tools", CONTROL_TYPES.MINDMAP, "TEST_DATA_SWITCHER");
    };
  }, []); // Empty dependency array ensures this runs only once

  // This component doesn't render anything
  return null;
};

export default TestControlsRegistration;
