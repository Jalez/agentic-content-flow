/** @format */
import React from "react";
import { Maximize, Keyboard } from "lucide-react"; 
import ControlButton from "../ControlButton";

interface NavigationControlsProps {
  onToggleFullscreen: () => void;
  onToggleShortcuts: () => void;
  showShortcuts: boolean;
}

const NavigationControls: React.FC<NavigationControlsProps> = ({
  onToggleFullscreen,
  onToggleShortcuts,
  showShortcuts,
}) => {
  const controls = [
    {
      tooltip: "Toggle Fullscreen",
      icon: <Maximize className="size-5" />,
      onClick: onToggleFullscreen,
    },
    {
      tooltip: "Toggle Shortcuts",
      icon: <Keyboard className="size-5" />,
      onClick: onToggleShortcuts,
      active: showShortcuts,
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
