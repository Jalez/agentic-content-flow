/** @format */
import React from "react";
import { Divider } from "@mui/material";

// Import components
import DirectionControls from "./components/DirectionControls";
import SpacingControls from "./components/SpacingControls";
import AutoLayoutToggle from "./components/AutoLayoutToggle";
import ApplyLayout from "./components/ApplyLayout";
import FitAllNodes from "./components/FitAllNodes";

const LayoutControls: React.FC = () => {
  return (
    <>
      <ApplyLayout />
      <Divider />
      <FitAllNodes />
      <Divider />
      <DirectionControls />
      <Divider />
      <SpacingControls />
      <Divider />
      <AutoLayoutToggle />
    </>
  );
};

export default React.memo(LayoutControls);
