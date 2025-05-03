/** @format */
import { ComponentType, useMemo, useRef, useEffect } from "react";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

/**
 * Controls Registry System
 *
 * @version 1.2.0
 *
 * A flexible system for registering and managing different types of controls in the mindmap.
 * Supports dynamic registration, unregistration, and automatic re-rendering.
 * Different control types can be registered separately (navigation, view settings, etc.)
 * Uses named controls to prevent duplicate registrations.
 *
 * @example
 * ```tsx
 * // Register a navigation control
 * registerControl('navigation', 'fit-view', FitViewComponent);
 *
 * // Register with props
 * registerControl('viewSettings', 'grid-toggle', GridToggleComponent, { some: 'props' });
 *
 * // Clean up when component unmounts
 * useEffect(() => {
 *   registerControl('navigation', 'my-control', MyComponent);
 *   return () => unregisterControl('navigation', 'my-control');
 * }, []);
 * ```
 */

// Control types - now supports any string value for dynamic control types
export type ControlType = string;

// Default built-in control types
export const DEFAULT_CONTROL_TYPES = {
  NAVIGATION: "navigation",
  VIEW_SETTINGS: "viewSettings",
  TOOLS: "tools",
  CUSTOM: "custom",
} as const;

/**
 * Control entry containing the component, name, and optional props
 */
export interface ControlEntry {
  name: string;
  Component: ComponentType<any>;
  props?: Record<string, any>;
  order?: number; // Optional order property to sort controls
}

/**
 * Internal store to manage controls state and trigger re-renders.
 */
interface ControlsRegistryStore {
  version: number;
  controls: Record<string, Record<string, ControlEntry[]>>;
  incrementVersion: () => void;
  setControls: (
    controls: Record<string, Record<string, ControlEntry[]>>
  ) => void;
}

// Separate registries for different control types, using Map<ControlType, Map<context, Map<name, ControlEntry>>>
const controlsRegistry = new Map<
  string,
  Map<string, Map<string, ControlEntry>>
>();

// Create the registry store with immutable updates
const useControlsRegistryStoreRaw = create<ControlsRegistryStore>((set) => ({
  version: 0,
  controls: {
    [DEFAULT_CONTROL_TYPES.NAVIGATION]: {},
    [DEFAULT_CONTROL_TYPES.VIEW_SETTINGS]: {},
    [DEFAULT_CONTROL_TYPES.TOOLS]: {},
    [DEFAULT_CONTROL_TYPES.CUSTOM]: {},
  },
  incrementVersion: () => set((state) => ({ version: state.version + 1 })),
  setControls: (controls) => set({ controls }),
}));

// Initialize registry for each control type
const initRegistry = (type: ControlType) => {
  if (!controlsRegistry.has(type)) {
    controlsRegistry.set(type, new Map<string, Map<string, ControlEntry>>());
  }
  return controlsRegistry.get(type)!;
};

// Initialize context in registry
const initContext = (
  registry: Map<string, Map<string, ControlEntry>>,
  context: string
) => {
  if (!registry.has(context)) {
    registry.set(context, new Map<string, ControlEntry>());
  }
  return registry.get(context)!;
};

// Process the registry and update store
const updateRegistry = () => {
  const controlsState: Record<string, Record<string, ControlEntry[]>> = {};

  // Initialize with default types
  Object.values(DEFAULT_CONTROL_TYPES).forEach(type => {
    controlsState[type] = {};
  });

  // Convert the Map structure to the store structure
  controlsRegistry.forEach((contextMap, type) => {
    if (!controlsState[type]) {
      controlsState[type] = {};
    }
    
    contextMap.forEach((controlMap, context) => {
      // Convert Map values to array and sort by order
      const entries = Array.from(controlMap.values());
      const sortedEntries = entries.sort((a, b) => {
        const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
        const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
        return orderA - orderB;
      });

      controlsState[type][context] = sortedEntries;
    });
  });

  const store = useControlsRegistryStoreRaw.getState();
  store.setControls(controlsState);
  store.incrementVersion();
};

// Debounce registry updates
let updateTimer: number | null = null;
const debouncedUpdateRegistry = () => {
  if (updateTimer) clearTimeout(updateTimer);
  updateTimer = window.setTimeout(updateRegistry, 50);
};

/**
 * Register a new control for a specific context and type.
 *
 * @param type - The type of control (navigation, viewSettings, etc.)
 * @param context - The context identifier (usually the component name or path)
 * @param name - A unique name for this control within its type and context
 * @param Component - The React component to render
 * @param props - Optional props to pass to the component
 * @param order - Optional order number to sort controls (lower numbers appear first)
 */
export function registerControl(
  type: ControlType,
  context: string,
  name: string,
  Component: ComponentType<any>,
  props?: Record<string, any>,
  order?: number
) {
  const registry = initRegistry(type);
  const contextRegistry = initContext(registry, context);

  const controlEntry = { name, Component, props, order };

  // Set the control in the registry - this will replace any existing control with the same name
  contextRegistry.set(name, controlEntry);

  // Update the store
  debouncedUpdateRegistry();
}

/**
 * Unregister a control from a specific context and type.
 *
 * @param type - The type of control (navigation, viewSettings, etc.)
 * @param context - The context identifier to remove the control from
 * @param name - The name of the control to remove
 */
export function unregisterControl(
  type: ControlType,
  context: string,
  name: string
) {
  const registry = controlsRegistry.get(type);
  if (!registry) return;

  const contextRegistry = registry.get(context);
  if (!contextRegistry) return;

  const deleted = contextRegistry.delete(name);

  // If the context is now empty, remove it
  if (contextRegistry.size === 0) {
    registry.delete(context);
  }

  // Only trigger re-render if something was actually removed
  if (deleted) {
    debouncedUpdateRegistry();
  }
}

/**
 * Get all registered controls for a specific context and type.
 *
 * @param type - The type of control (navigation, viewSettings, etc.)
 * @param context - The context identifier to get the controls for
 * @returns An array of registered control entries
 */
export function getControls(
  type: ControlType,
  context: string
): ControlEntry[] {
  const storeState = useControlsRegistryStoreRaw.getState();
  return storeState.controls[type]?.[context] || [];
}

/**
 * Get all registered control types for a specific context.
 * 
 * @param context - The context identifier to get the control types for
 * @returns An array of control types that have registered controls for this context
 */
export function getControlTypes(context: string): string[] {
  const storeState = useControlsRegistryStoreRaw.getState();
  const types: string[] = [];
  
  Object.entries(storeState.controls).forEach(([type, contexts]) => {
    if (contexts[context] && contexts[context].length > 0) {
      types.push(type);
    }
  });
  
  return types;
}

/**
 * Clear all registered controls for a specific context and type.
 *
 * @param type - The type of control (navigation, viewSettings, etc.)
 * @param context - The context identifier to clear the controls for
 */
export function clearControls(type: ControlType, context: string) {
  const registry = controlsRegistry.get(type);
  if (registry?.delete(context)) {
    debouncedUpdateRegistry();
  }
}

/**
 * Check if a control exists in a specific context and type.
 *
 * @param type - The type of control (navigation, viewSettings, etc.)
 * @param context - The context identifier to check in
 * @param name - The name of the control to check for
 * @returns Whether the control exists
 */
export function hasControl(
  type: ControlType,
  context: string,
  name: string
): boolean {
  const registry = controlsRegistry.get(type);
  if (!registry) return false;

  const contextRegistry = registry.get(context);
  if (!contextRegistry) return false;

  return contextRegistry.has(name);
}

/**
 * React hook for accessing controls registry with proper caching to avoid infinite loops
 */
export function useControlsRegistry() {
  // Use useShallow to properly handle equality checks
  const { version, controls } = useControlsRegistryStoreRaw(
    useShallow((state) => ({
      version: state.version,
      controls: state.controls,
    }))
  );

  // Keep a stable reference to controls
  const cachedControls = useMemo(() => controls, [controls]);

  // Use initialization ref to ensure we only initialize once
  const initialized = useRef(false);

  // Initialize the registry if needed - move to useEffect to avoid state updates during render
  useEffect(() => {
    if (!initialized.current && controlsRegistry.size > 0) {
      initialized.current = true;
      updateRegistry();
    }
  }, []);

  // Return stable reference
  return useMemo(
    () => ({
      version,
      controls: cachedControls,
      getControls: (type: ControlType, context: string) =>
        cachedControls[type]?.[context] || [],
      getControlTypes: (context: string) => {
        const types: string[] = [];
        Object.entries(cachedControls).forEach(([type, contexts]) => {
          if (contexts[context] && contexts[context].length > 0) {
            types.push(type);
          }
        });
        return types;
      }
    }),
    [cachedControls, version]
  );
}

// For compatibility with existing code
export const useControlsRegistryStore = useControlsRegistry;
