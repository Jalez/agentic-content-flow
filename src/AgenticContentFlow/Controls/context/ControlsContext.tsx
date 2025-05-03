/** @format */
import React, { createContext, useContext, useState, useCallback } from "react";
import { useViewPreferencesStore } from "../../stores";

// Define the context interface
interface ControlsContextValue {
  // View Settings
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
  snapToGrid: boolean;
  setSnapToGrid: (snap: boolean) => void;

  touchMode: boolean;
  setTouchMode: (enabled: boolean) => void;

  // UI Controls
  showShortcuts: boolean;
  toggleShortcuts: () => void;

  fitView: () => void;
  toggleFullscreen: () => void;
}

// Create the context with default values
const ControlsContext = createContext<ControlsContextValue | undefined>(
  undefined
);

interface ControlsProviderProps {
  children: React.ReactNode;
  onFitView: () => void;
  onToggleFullscreen: () => void;
}

/**
 * Provider component that manages the mindmap controls state
 */
export const ControlsProvider: React.FC<ControlsProviderProps> = ({
  children,
  onFitView,
  onToggleFullscreen,
}) => {
  // Local UI state
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Access Zustand store state and actions
  const {
    showGrid,
    setShowGrid,
    snapToGrid,
    setSnapToGrid,
    touchMode,
    setTouchMode,
  } = useViewPreferencesStore();

  // UI action handlers
  const toggleShortcuts = useCallback(() => {
    setShowShortcuts((prev) => !prev);
  }, []);

  // Create context value
  const value: ControlsContextValue = {
    // View settings
    showGrid,
    setShowGrid,
    snapToGrid,
    setSnapToGrid,
    touchMode,
    setTouchMode,
    // UI controls
    showShortcuts,
    toggleShortcuts,
    // Navigation
    fitView: onFitView,
    toggleFullscreen: onToggleFullscreen,
  };

  return (
    <ControlsContext.Provider value={value}>
      {children}
    </ControlsContext.Provider>
  );
};

/**
 * Custom hook to consume the controls context
 */
export const useControls = (): ControlsContextValue => {
  const context = useContext(ControlsContext);
  if (context === undefined) {
    throw new Error("useControls must be used within a ControlsProvider");
  }
  return context;
};
