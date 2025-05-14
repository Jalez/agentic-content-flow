/** @format */
import { useEffect } from "react";
import { ReactFlowInstance } from "@xyflow/react";

interface KeyboardShortcutsConfig {
  reactFlowInstance?: ReactFlowInstance | null;
  showGrid?: boolean;
  setShowGrid?: (show: boolean) => void;
  snapToGrid?: boolean;
  setSnapToGrid?: (snap: boolean) => void;
  showShortcuts?: boolean;
  toggleShortcuts?: () => void;
  toggleFullscreen?: () => void;
}

export const useKeyboardShortcuts = ({
  reactFlowInstance,
  showGrid,
  setShowGrid,
  snapToGrid,
  setSnapToGrid,
  showShortcuts,
  toggleShortcuts,
  toggleFullscreen,
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
        case "KeyF":
          if (e.ctrlKey || e.metaKey) {
            // Fit view functionality would be here
            e.preventDefault();
          }
          break;
        case "KeyG":
          if (e.ctrlKey || e.metaKey) {
            setShowGrid?.(!showGrid);
            e.preventDefault();
          }
          break;
        case "KeyS":
          if (e.ctrlKey || e.metaKey) {
            setSnapToGrid?.(!snapToGrid);
            e.preventDefault();
          }
          break;
        case "KeyK":
          toggleShortcuts?.();
          break;
        case "KeyF11":
          toggleFullscreen?.();
          e.preventDefault();
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
  }, [
    reactFlowInstance,
    showGrid,
    setShowGrid,
    snapToGrid,
    setSnapToGrid,
    showShortcuts,
    toggleShortcuts,
    toggleFullscreen
  ]);
};
