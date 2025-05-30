/** @format */
import React, { createContext, useContext, useState, useCallback } from "react";

// Define the context interface
interface ShortcutsContextValue {
  showShortcuts: boolean;
  toggleShortcuts: () => void;
  setShowShortcuts: (show: boolean) => void;
}

// Create the context with default values
const ShortcutsContext = createContext<ShortcutsContextValue | undefined>(
  undefined
);

interface ShortcutsProviderProps {
  children: React.ReactNode;
  initialShow?: boolean;
}

/**
 * Provider component that manages the shortcuts display state
 * Completely independent from other contexts
 */
export const ShortcutsProvider: React.FC<ShortcutsProviderProps> = ({
  children,
  initialShow = false,
}) => {
  // Local state for shortcuts visibility
  const [showShortcuts, setShowShortcuts] = useState(initialShow);

  // Toggle function
  const toggleShortcuts = useCallback(() => {
    setShowShortcuts((prev) => !prev);
  }, []);

  // Create context value
  const value: ShortcutsContextValue = {
    showShortcuts,
    toggleShortcuts,
    setShowShortcuts,
  };

  return (
    <ShortcutsContext.Provider value={value}>
      {children}
    </ShortcutsContext.Provider>
  );
};

/**
 * Custom hook to consume the shortcuts context
 */
export const useShortcuts = (): ShortcutsContextValue => {
  const context = useContext(ShortcutsContext);
  if (context === undefined) {
    throw new Error("useShortcuts must be used within a ShortcutsProvider");
  }
  return context;
};