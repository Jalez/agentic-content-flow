import React from "react";
import { ArrowUpDown } from "lucide-react";
import { LayoutDirection, useLayoutContext } from "@jalez/react-flow-automated-layout";
import ControlDropdown from "../../../Controls/Components/ControlDropdown";

const DirectionControls: React.FC = () => {
  const { direction, setDirection } = useLayoutContext();
  
  const handleDirectionSelect = (newDirection: LayoutDirection) => {
    setDirection(newDirection);
  };

  const directionItems = [
    {
      key: "title",
      label: "Layout Direction",
      onClick: () => {},
      className: "font-semibold text-sm text-muted-foreground pb-2"
    },
    {
      key: "DOWN",
      label: "Top to Bottom",
      onClick: () => handleDirectionSelect("DOWN"),
      active: direction === "DOWN"
    },
    {
      key: "RIGHT",
      label: "Left to Right",
      onClick: () => handleDirectionSelect("RIGHT"),
      active: direction === "RIGHT"
    },
    {
      key: "LEFT",
      label: "Right to Left",
      onClick: () => handleDirectionSelect("LEFT"),
      active: direction === "LEFT"
    },
    {
      key: "UP",
      label: "Bottom to Top",
      onClick: () => handleDirectionSelect("UP"),
      active: direction === "UP"
    }
  ];

  return (
    <ControlDropdown
      tooltip="Layout Direction"
      icon={<ArrowUpDown className="size-4" />}
      items={directionItems}
    />
  );
};

export default DirectionControls;
