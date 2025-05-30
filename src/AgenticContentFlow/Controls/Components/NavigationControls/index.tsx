/** @format */
import React from "react";
import { Maximize } from "lucide-react"; 
import ControlButton from "../ControlButton";

interface NavigationControlsProps {
  onToggleFullscreen: () => void;
}

const NavigationControls: React.FC<NavigationControlsProps> = ({
  onToggleFullscreen,
}) => {
  const controls = [
    {
      tooltip: "Toggle Fullscreen",
      icon: <Maximize className="size-5" />,
      onClick: onToggleFullscreen,
    },
  ];

  return (
    <div className="flex gap-1">
      {controls.map((control) => (
        <ControlButton key={control.tooltip} {...control} />
      ))}
    </div>
  );
};

export default NavigationControls;
