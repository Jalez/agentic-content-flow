import React from "react";
import { Keyboard } from "lucide-react";
import { useShortcuts } from "../context/ShortcutsContext";
import ControlButton from "../../Controls/Components/ControlButton";

/**
 * Decoupled shortcuts toggle button that uses the shortcuts context
 * No longer depends on the Controls context
 */
const ShortcutsToggleButton = () => {
  const { showShortcuts, toggleShortcuts } = useShortcuts();

  return (
    <ControlButton
      key="toggleShortcuts"
      tooltip="Toggle Shortcuts"
      icon={<Keyboard className="size-4" />}
      onClick={toggleShortcuts}
      active={showShortcuts}
    />
  );
};

export default ShortcutsToggleButton;