/** @format */
import { useEffect } from "react";
import { ReactFlowInstance } from "@xyflow/react";

interface KeyboardShortcutsConfig {
  reactFlowInstance?: ReactFlowInstance | null; // made optional
  fitView: () => void;
  centerSelected: () => void; // renamed property
  showMiniMap: boolean;
  setShowMiniMap: (value: boolean) => void;
}

export const useKeyboardShortcuts = ({
  reactFlowInstance,
  fitView,
  centerSelected, // updated name
  showMiniMap,
  setShowMiniMap,
}: KeyboardShortcutsConfig) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input field
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.code) {
        case "Space":
        case "KeyF":
          if (e.ctrlKey || e.metaKey) {
            fitView();
            e.preventDefault();
          }
          break;
        case "KeyC":
          if (e.ctrlKey || (e.metaKey && e.shiftKey)) {
            centerSelected(); // updated call
            e.preventDefault();
          }
          break;
        case "KeyM":
          setShowMiniMap(!showMiniMap);
          break;
        case "Equal":
        case "NumpadAdd":
          if (e.ctrlKey || e.metaKey) {
            reactFlowInstance?.zoomIn();
            e.preventDefault();
          }
          break;
        case "Minus":
        case "NumpadSubtract":
          if (e.ctrlKey || e.metaKey) {
            reactFlowInstance?.zoomOut();
            e.preventDefault();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [reactFlowInstance, fitView, centerSelected, showMiniMap, setShowMiniMap]);
};
