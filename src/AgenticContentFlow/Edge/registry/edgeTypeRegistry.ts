/** @format */
import { ComponentType, useMemo, useRef, useEffect } from "react";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

/**
 * Edge type entry containing the component and any additional configuration
 */
export interface EdgeTypeEntry {
  Component: ComponentType<any>;
  config?: {
    animated?: boolean;
    style?: any;
  };
}

/**
 * Internal store to manage edge type registry state
 */
interface EdgeTypeRegistryStore {
  version: number;
  edgeTypes: Record<string, ComponentType<any>>;
  setEdgeTypes: (types: Record<string, ComponentType<any>>) => void;
  incrementVersion: () => void;
}

// Edge type registry map (not part of reactive state)
const edgeTypeRegistry = new Map<string, EdgeTypeEntry>();

// Create the store
const useEdgeTypeRegistryStore = create<EdgeTypeRegistryStore>((set) => ({
  version: 0,
  edgeTypes: {},
  setEdgeTypes: (types) => set({ edgeTypes: types }),
  incrementVersion: () => set((state) => ({ version: state.version + 1 })),
}));

// Process the registry and update store
const updateRegistry = () => {
  const types: Record<string, ComponentType<any>> = {};
  edgeTypeRegistry.forEach((entry, key) => {
    types[key] = entry.Component;
  });

  const store = useEdgeTypeRegistryStore.getState();
  store.setEdgeTypes(types);
  store.incrementVersion();
};

// Debounce registry updates
let updateTimer: number | null = null;
const debouncedUpdateRegistry = () => {
  if (updateTimer) clearTimeout(updateTimer);
  updateTimer = window.setTimeout(updateRegistry, 50);
};

/**
 * Register a new edge type with its component and configuration
 */
export function registerEdgeType(
  type: string,
  Component: ComponentType<any>,
  config?: EdgeTypeEntry["config"]
) {
  edgeTypeRegistry.set(type, { Component, config });
  debouncedUpdateRegistry();
}

/**
 * Unregister an edge type
 */
export function unregisterEdgeType(type: string) {
  if (edgeTypeRegistry.delete(type)) {
    debouncedUpdateRegistry();
  }
}

/**
 * Get an edge type component by its identifier
 */
export function getEdgeTypeComponent(
  type: string
): ComponentType<any> | undefined {
  return edgeTypeRegistry.get(type)?.Component;
}

/**
 * Get all information about an edge type
 */
export function getEdgeTypeInfo(type: string): EdgeTypeEntry | undefined {
  return edgeTypeRegistry.get(type);
}

/**
 * Get all registered edge types
 */
export function getAllEdgeTypes(): Record<string, ComponentType<any>> {
  return { ...useEdgeTypeRegistryStore.getState().edgeTypes };
}

/**
 * React hook for accessing edge types with proper caching
 */
export function useEdgeTypeRegistry() {
  const { edgeTypes, version } = useEdgeTypeRegistryStore(
    useShallow((state) => ({
      edgeTypes: state.edgeTypes,
      version: state.version,
    }))
  );

  const cachedTypes = useMemo(() => edgeTypes, [edgeTypes]);
  const initialized = useRef(false);

  useEffect(() => {
    if (
      !initialized.current &&
      Object.keys(cachedTypes).length === 0 &&
      edgeTypeRegistry.size > 0
    ) {
      initialized.current = true;
      updateRegistry();
    }
  }, [cachedTypes]);

  return useMemo(
    () => ({
      edgeTypes: cachedTypes,
      version,
    }),
    [cachedTypes, version]
  );
}

// For compatibility
export { useEdgeTypeRegistry as useEdgeTypeRegistryStore };