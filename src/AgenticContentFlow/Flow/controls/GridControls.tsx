/** @format */
import React from "react";
import { BackgroundVariant } from "@xyflow/react";
import { useViewPreferencesStore } from "../../stores";

// Import grid icons
import { GridIconOn } from "./icons/GridIconOn";
import { GridIconOff } from "./icons/GridIconOff";

// Import the ControlDropdown component
import ControlDropdown from "../../Controls/Components/ControlDropdown";

/**
 * GridControls Component
 * 
 * A control for toggling grid visibility and selecting grid variant
 * Uses the ControlDropdown component for better user experience
 */
const GridControls: React.FC = () => {
  const { showGrid, setShowGrid, gridVariant, setGridVariant } = useViewPreferencesStore();

  // Toggle grid visibility
  const toggleGrid = React.useCallback(() => {
    setShowGrid(!showGrid);
  }, [showGrid, setShowGrid]);

  // Create grid variant options for the dropdown
  const gridItems = [
    {
      key: "toggle",
      label: showGrid ? "Hide Grid" : "Show Grid",
      onClick: toggleGrid,
      active: false
    },
    {
      key: "divider-1",
      label: "───────────",
      onClick: () => {},
      active: false
    },
    {
      key: BackgroundVariant.Lines,
      label: "Lines",
      onClick: () => {
        setShowGrid(true);
        setGridVariant(BackgroundVariant.Lines);
      },
      active: showGrid && gridVariant === BackgroundVariant.Lines
    },
    {
      key: BackgroundVariant.Dots,
      label: "Dots",
      onClick: () => {
        setShowGrid(true);
        setGridVariant(BackgroundVariant.Dots);
      },
      active: showGrid && gridVariant === BackgroundVariant.Dots
    },
    {
      key: BackgroundVariant.Cross,
      label: "Cross",
      onClick: () => {
        setShowGrid(true);
        setGridVariant(BackgroundVariant.Cross);
      },
      active: showGrid && gridVariant === BackgroundVariant.Cross
    }
  ];

  return (
    <ControlDropdown
      tooltip="Grid Settings"
      icon={showGrid ? <GridIconOn /> : <GridIconOff />}
      items={gridItems}
    />
  );
};

export default GridControls;