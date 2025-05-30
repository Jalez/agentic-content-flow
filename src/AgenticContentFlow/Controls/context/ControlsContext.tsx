/** @format */
import React, { createContext, useContext } from "react";
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

  // Navigation
  toggleFullscreen: () => void;
}

// Create the context with default values
const ControlsContext = createContext<ControlsContextValue | undefined>(
  undefined
);

interface ControlsProviderProps {
  children: React.ReactNode;
  onToggleFullscreen: () => void;
}

/**
 * Provider component that manages the mindmap controls state
 * Shortcuts functionality has been moved to the dedicated ShortcutsManager
 */
export const ControlsProvider: React.FC<ControlsProviderProps> = ({
  children,
  onToggleFullscreen,
}) => {
  // Access Zustand store state and actions
  const {
    showGrid,
    setShowGrid,
    snapToGrid,
    setSnapToGrid,
    touchMode,
    setTouchMode,
  } = useViewPreferencesStore();

  // Create context value
  const value: ControlsContextValue = {
    // View settings
    showGrid,
    setShowGrid,
    snapToGrid,
    setSnapToGrid,
    touchMode,
    setTouchMode,
    // Navigation
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
