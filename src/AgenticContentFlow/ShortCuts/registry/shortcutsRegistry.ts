/** @format */
import { useMemo, useRef, useEffect, useCallback } from "react";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

/**
 * Shortcuts Registry System
 *
 * @version 1.0.0
 *
 * A flexible system for registering and managing keyboard shortcuts.
 * Allows components to register actions with specific key combinations.
 * Completely decoupled from other systems.
 *
 * @example
 * ```tsx
 * // Register a shortcut action
 * registerShortcut('navigation', 'fit-view', 'Ctrl+F', () => fitView(), 'Fit all nodes');
 *
 * // Register with complex key combination
 * registerShortcut('tools', 'toggle-grid', 'Ctrl+G', () => toggleGrid(), 'Toggle grid');
 *
 * // Clean up when component unmounts
 * useEffect(() => {
 *   registerShortcut('navigation', 'my-action', 'Ctrl+M', myAction, 'My Action');
 *   return () => unregisterShortcut('navigation', 'my-action');
 * }, []);
 * ```
 */

// Shortcut categories - can be extended dynamically
export type ShortcutCategory = string;

export const DEFAULT_SHORTCUT_CATEGORIES = {
  NAVIGATION: "navigation",
  VIEW_SETTINGS: "viewSettings", 
  TOOLS: "tools",
  EDITING: "editing",
  CUSTOM: "custom",
} as const;

/**
 * Shortcut entry containing the action, key combination, and metadata
 */
export interface ShortcutEntry {
  name: string;
  keyCombo: string;
  description: string;
  action: () => void;
  category: ShortcutCategory;
  enabled?: boolean;
  order?: number;
}

/**
 * Key combination definition for parsing
 */
export interface KeyCombination {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
}

/**
 * Internal store to manage shortcuts state and trigger re-renders
 */
interface ShortcutsRegistryStore {
  version: number;
  shortcuts: Record<ShortcutCategory, ShortcutEntry[]>;
  incrementVersion: () => void;
  setShortcuts: (shortcuts: Record<ShortcutCategory, ShortcutEntry[]>) => void;
}

// Shortcuts registry map (category -> name -> entry)
const shortcutsRegistry = new Map<ShortcutCategory, Map<string, ShortcutEntry>>();

// Create the registry store
const useShortcutsRegistryStoreRaw = create<ShortcutsRegistryStore>((set) => ({
  version: 0,
  shortcuts: {
    [DEFAULT_SHORTCUT_CATEGORIES.NAVIGATION]: [],
    [DEFAULT_SHORTCUT_CATEGORIES.VIEW_SETTINGS]: [],
    [DEFAULT_SHORTCUT_CATEGORIES.TOOLS]: [],
    [DEFAULT_SHORTCUT_CATEGORIES.EDITING]: [],
    [DEFAULT_SHORTCUT_CATEGORIES.CUSTOM]: [],
  },
  incrementVersion: () => set((state) => ({ version: state.version + 1 })),
  setShortcuts: (shortcuts) => set({ shortcuts }),
}));

// Initialize registry for a category
const initRegistry = (category: ShortcutCategory) => {
  if (!shortcutsRegistry.has(category)) {
    shortcutsRegistry.set(category, new Map<string, ShortcutEntry>());
  }
  return shortcutsRegistry.get(category)!;
};

// Process the registry and update store
const updateRegistry = () => {
  const shortcutsState: Record<ShortcutCategory, ShortcutEntry[]> = {};

  // Initialize with default categories
  Object.values(DEFAULT_SHORTCUT_CATEGORIES).forEach(category => {
    shortcutsState[category] = [];
  });

  // Convert the Map structure to the store structure
  shortcutsRegistry.forEach((entryMap, category) => {
    if (!shortcutsState[category]) {
      shortcutsState[category] = [];
    }
    
    // Convert Map values to array and sort by order
    const entries = Array.from(entryMap.values());
    const sortedEntries = entries.sort((a, b) => {
      const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });

    shortcutsState[category] = sortedEntries;
  });

  const store = useShortcutsRegistryStoreRaw.getState();
  store.setShortcuts(shortcutsState);
  store.incrementVersion();
};

// Debounce registry updates
let updateTimer: number | null = null;
const debouncedUpdateRegistry = () => {
  if (updateTimer) clearTimeout(updateTimer);
  updateTimer = window.setTimeout(updateRegistry, 50);
};

/**
 * Parse a key combination string into a KeyCombination object
 */
export function parseKeyCombo(keyCombo: string): KeyCombination {
  const parts = keyCombo.toLowerCase().split('+');
  const result: KeyCombination = { key: '' };
  
  for (const part of parts) {
    switch (part.trim()) {
      case 'ctrl':
      case 'control':
        result.ctrlKey = true;
        break;
      case 'shift':
        result.shiftKey = true;
        break;
      case 'alt':
        result.altKey = true;
        break;
      case 'cmd':
      case 'meta':
        result.metaKey = true;
        break;
      default:
        result.key = part.trim();
        break;
    }
  }
  
  return result;
}

/**
 * Check if a keyboard event matches a key combination
 */
export function matchesKeyCombo(event: KeyboardEvent, keyCombo: string): boolean {
  const combo = parseKeyCombo(keyCombo);
  
  // Normalize the key
  let eventKey = event.key.toLowerCase();
  if (eventKey === ' ') eventKey = 'space';
  if (eventKey === 'escape') eventKey = 'esc';
  
  const keyMatches = eventKey === combo.key || event.code.toLowerCase() === `key${combo.key}`;
  const ctrlMatches = !!combo.ctrlKey === (event.ctrlKey || event.metaKey);
  const shiftMatches = !!combo.shiftKey === event.shiftKey;
  const altMatches = !!combo.altKey === event.altKey;
  
  return keyMatches && ctrlMatches && shiftMatches && altMatches;
}

/**
 * Register a new shortcut action
 *
 * @param category - The category of the shortcut (navigation, tools, etc.)
 * @param name - A unique name for this shortcut within its category
 * @param keyCombo - The key combination (e.g., "Ctrl+F", "Shift+M", "Esc")
 * @param action - The function to execute when the shortcut is triggered
 * @param description - Human-readable description of what the shortcut does
 * @param enabled - Whether the shortcut is currently enabled (default: true)
 * @param order - Optional order number to sort shortcuts (lower numbers appear first)
 */
export function registerShortcut(
  category: ShortcutCategory,
  name: string,
  keyCombo: string,
  action: () => void,
  description: string,
  enabled: boolean = true,
  order?: number
) {
  const registry = initRegistry(category);
  
  const shortcutEntry: ShortcutEntry = {
    name,
    keyCombo,
    description,
    action,
    category,
    enabled,
    order
  };

  // Set the shortcut in the registry - this will replace any existing shortcut with the same name
  registry.set(name, shortcutEntry);

  // Update the store
  debouncedUpdateRegistry();
}

/**
 * Unregister a shortcut
 *
 * @param category - The category of the shortcut
 * @param name - The name of the shortcut to remove
 */
export function unregisterShortcut(category: ShortcutCategory, name: string) {
  const registry = shortcutsRegistry.get(category);
  if (!registry) return;

  const deleted = registry.delete(name);

  // If the category is now empty, remove it
  if (registry.size === 0) {
    shortcutsRegistry.delete(category);
  }

  // Only trigger re-render if something was actually removed
  if (deleted) {
    debouncedUpdateRegistry();
  }
}

/**
 * Get all registered shortcuts for a specific category
 *
 * @param category - The category to get shortcuts for
 * @returns An array of registered shortcut entries
 */
export function getShortcuts(category: ShortcutCategory): ShortcutEntry[] {
  const storeState = useShortcutsRegistryStoreRaw.getState();
  return storeState.shortcuts[category] || [];
}

/**
 * Get all registered shortcut categories
 * 
 * @returns An array of categories that have registered shortcuts
 */
export function getShortcutCategories(): string[] {
  const storeState = useShortcutsRegistryStoreRaw.getState();
  const categories: string[] = [];
  
  Object.entries(storeState.shortcuts).forEach(([category, shortcuts]) => {
    if (shortcuts && shortcuts.length > 0) {
      categories.push(category);
    }
  });
  
  return categories;
}

/**
 * Get all registered shortcuts across all categories
 * 
 * @returns A flat array of all registered shortcut entries
 */
export function getAllShortcuts(): ShortcutEntry[] {
  const storeState = useShortcutsRegistryStoreRaw.getState();
  const allShortcuts: ShortcutEntry[] = [];
  
  Object.values(storeState.shortcuts).forEach(shortcuts => {
    allShortcuts.push(...shortcuts);
  });
  
  return allShortcuts.sort((a, b) => {
    const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
    return orderA - orderB;
  });
}

/**
 * Clear all registered shortcuts for a specific category
 *
 * @param category - The category to clear shortcuts for
 */
export function clearShortcuts(category: ShortcutCategory) {
  if (shortcutsRegistry.delete(category)) {
    debouncedUpdateRegistry();
  }
}

/**
 * Check if a shortcut exists in a specific category
 *
 * @param category - The category to check in
 * @param name - The name of the shortcut to check for
 * @returns Whether the shortcut exists
 */
export function hasShortcut(category: ShortcutCategory, name: string): boolean {
  const registry = shortcutsRegistry.get(category);
  return registry ? registry.has(name) : false;
}

/**
 * Execute a shortcut action by category and name
 *
 * @param category - The category of the shortcut
 * @param name - The name of the shortcut
 * @returns Whether the shortcut was found and executed
 */
export function executeShortcut(category: ShortcutCategory, name: string): boolean {
  const registry = shortcutsRegistry.get(category);
  if (!registry) return false;

  const shortcut = registry.get(name);
  if (!shortcut || !shortcut.enabled) return false;

  try {
    shortcut.action();
    return true;
  } catch (error) {
    console.error(`Error executing shortcut ${category}:${name}:`, error);
    return false;
  }
}

/**
 * React hook for accessing shortcuts registry with proper caching
 */
export function useShortcutsRegistry() {
  // Use useShallow to properly handle equality checks
  const { version, shortcuts } = useShortcutsRegistryStoreRaw(
    useShallow((state) => ({
      version: state.version,
      shortcuts: state.shortcuts,
    }))
  );

  // Keep a stable reference to shortcuts
  const cachedShortcuts = useMemo(() => shortcuts, [shortcuts]);

  // Use initialization ref to ensure we only initialize once
  const initialized = useRef(false);

  // Initialize the registry if needed
  useEffect(() => {
    if (!initialized.current && shortcutsRegistry.size > 0) {
      initialized.current = true;
      updateRegistry();
    }
  }, []);

  // Return stable reference
  return useMemo(
    () => ({
      version,
      shortcuts: cachedShortcuts,
      getShortcuts: (category: ShortcutCategory) =>
        cachedShortcuts[category] || [],
      getShortcutCategories: () => {
        const categories: string[] = [];
        Object.entries(cachedShortcuts).forEach(([category, shortcuts]) => {
          if (shortcuts && shortcuts.length > 0) {
            categories.push(category);
          }
        });
        return categories;
      },
      getAllShortcuts: () => {
        const allShortcuts: ShortcutEntry[] = [];
        Object.values(cachedShortcuts).forEach(shortcuts => {
          allShortcuts.push(...shortcuts);
        });
        return allShortcuts.sort((a, b) => {
          const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
          const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
          return orderA - orderB;
        });
      }
    }),
    [cachedShortcuts, version]
  );
}

/**
 * Hook for handling keyboard shortcuts automatically
 * This should be used at the root level of your application
 */
export function useKeyboardShortcutHandler() {
  const { getAllShortcuts } = useShortcutsRegistry();
  
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts if user is typing in an input field
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLSelectElement ||
      (event.target as HTMLElement).contentEditable === 'true'
    ) {
      return;
    }

    const allShortcuts = getAllShortcuts();
    
    for (const shortcut of allShortcuts) {
      if (shortcut.enabled && matchesKeyCombo(event, shortcut.keyCombo)) {
        event.preventDefault();
        event.stopPropagation();
        try {
          shortcut.action();
        } catch (error) {
          console.error(`Error executing shortcut ${shortcut.name}:`, error);
        }
        break; // Only execute the first matching shortcut
      }
    }
  }, [getAllShortcuts]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

// For compatibility with existing code
export const useShortcutsRegistryStore = useShortcutsRegistry;