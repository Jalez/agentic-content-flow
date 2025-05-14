/** @format */
import React from "react";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useControls } from "../Controls/context/ControlsContext";
import { cn } from "@/lib/utils";

interface KeyboardShortcut {
  key: string;
  description: string;
}

interface KeyboardShortcutPanelProps {
  shortcuts?: KeyboardShortcut[];
}

/**
 * Component that displays available keyboard shortcuts
 */
const KeyboardShortcutPanel: React.FC<KeyboardShortcutPanelProps> = ({
  shortcuts = [
    { key: "Ctrl+F", description: "Fit all nodes" },
    { key: "Ctrl+Shift+C", description: "Center selected node" },
    { key: "Ctrl++ / Ctrl+-", description: "Zoom in/out" },
    { key: "M", description: "Toggle mini-map" },
  ],
}) => {
  const {
    showGrid,
    setShowGrid,
    snapToGrid,
    setSnapToGrid,
    showShortcuts,
    toggleShortcuts,
    toggleFullscreen
  } = useControls();

  // Use keyboard shortcuts
  useKeyboardShortcuts({
    showGrid,
    setShowGrid,
    snapToGrid,
    setSnapToGrid,
    showShortcuts,
    toggleShortcuts,
    toggleFullscreen
  });

  return (
    <div
      className={cn(
        "absolute bottom-5 left-5 bg-background p-3 rounded-md text-sm",
        "max-w-[250px] shadow-md z-10 border border-border"
      )}
    >
      <h2 className="text-lg font-semibold mb-2">Keyboard Shortcuts</h2>
      <ul className="my-1 pl-5 space-y-1">
        {shortcuts.map((shortcut, index) => (
          <li key={index} className="text-sm">
            <span className="font-medium">{shortcut.key}</span>: {shortcut.description}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default KeyboardShortcutPanel;
