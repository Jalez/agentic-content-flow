/** @format */

// Main shortcuts manager - the primary entry point
export { default as ShortcutsManager } from "./ShortcutsManager";

// Registry system exports
export {
  registerShortcut,
  unregisterShortcut,
  getShortcuts,
  getAllShortcuts,
  getShortcutCategories,
  clearShortcuts,
  hasShortcut,
  executeShortcut,
  useShortcutsRegistry,
  useKeyboardShortcutHandler,
  DEFAULT_SHORTCUT_CATEGORIES,
  parseKeyCombo,
  matchesKeyCombo,
} from "./registry/shortcutsRegistry";

// Context exports
export { useShortcuts, ShortcutsProvider } from "./context/ShortcutsContext";

// Component exports
export { default as ShortcutsDisplay } from "./components/ShortcutsDisplay";
export { default as ShortcutsToggleButton } from "./components/ShortcutsToggleButton";

// Type exports
export type {
  ShortcutEntry,
  ShortcutCategory,
  KeyCombination,
} from "./registry/shortcutsRegistry";

// Example exports
export { default as ExampleShortcutsRegistration } from "./examples/ExampleShortcutsRegistration";