/** @format */
import { ComponentType, useMemo, useRef, useEffect } from "react";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { Node } from "@xyflow/react";
import { NodeData } from "../../types";

/**
 * Function type for creating node templates
 */
export type NodeTemplateCreator = (
  params: {
    id: string;
    position: { x: number; y: number };
    eventNode?: Node<NodeData>;
  } & Record<string, any>,
  type: string
) => Node<NodeData>;

/**
 * Node type entry containing the component, template creator, and parent status
 */
export interface NodeTypeEntry {
  Component: ComponentType<any>;
  createTemplate: NodeTemplateCreator;
  isParent: boolean;
  defaultDimensions: {
    width: number;
    height: number;
  };
}

/**
 * Internal store to manage node type registry state
 */
interface NodeTypeRegistryStore {
  version: number;
  nodeTypes: Record<string, ComponentType<any>>;
  setNodeTypes: (types: Record<string, ComponentType<any>>) => void;
  incrementVersion: () => void;
}

// Node type registry map (not part of reactive state)
const nodeTypeRegistry = new Map<string, NodeTypeEntry>();

// Create the store
const useNodeTypeRegistryStore = create<NodeTypeRegistryStore>((set) => ({
  version: 0,
  nodeTypes: {},
  setNodeTypes: (types) => set({ nodeTypes: types }),
  incrementVersion: () => set((state) => ({ version: state.version + 1 })),
}));

// Process the registry and update store
const updateRegistry = () => {
  const types: Record<string, ComponentType<any>> = {};
  nodeTypeRegistry.forEach((entry, key) => {
    types[key] = entry.Component;
  });

  const store = useNodeTypeRegistryStore.getState();
  store.setNodeTypes(types);
  store.incrementVersion();
};

// Debounce registry updates
let updateTimer: number | null = null;
const debouncedUpdateRegistry = () => {
  if (updateTimer) clearTimeout(updateTimer);
  updateTimer = window.setTimeout(updateRegistry, 50);
};

/**
 * Register a new node type with its component and template creator
 * @param type The unique type identifier for this node
 * @param Component The React component to render for this node type
 * @param createTemplate The function that creates the node template
 * @param isParent Whether this node type can act as a parent (default: false)
 */
export function registerNodeType(
  type: string,
  Component: ComponentType<any>,
  createTemplate: NodeTemplateCreator,
  isParent: boolean = false,
  defaultDimensions: {
    width: number;
    height: number;
  } = { width: 300, height: 200 }
) {
  nodeTypeRegistry.set(type, { Component, createTemplate, isParent, defaultDimensions });
  debouncedUpdateRegistry();
}

/**
 * Unregister a node type
 */
export function unregisterNodeType(type: string) {
  if (nodeTypeRegistry.delete(type)) {
    debouncedUpdateRegistry();
  }
}

/**
 * Get a node type component by its identifier
 */
export function getNodeTypeComponent(
  type: string
): ComponentType<any> | undefined {
  return nodeTypeRegistry.get(type)?.Component;
}

/**
 * Get a node template creator by type
 */
export function getNodeTemplateCreator(
  type: string
): NodeTemplateCreator | undefined {
  return nodeTypeRegistry.get(type)?.createTemplate;
}

/**
 * Get all information about a node type
 * @param type The node type to get information for
 * @returns The full NodeTypeEntry or undefined if not found
 */
export function getNodeTypeInfo(type: string): NodeTypeEntry | undefined {
  return nodeTypeRegistry.get(type);
}

/**
 * Get all registered node types
 */
export function getAllNodeTypes(): Record<string, ComponentType<any>> {
  return { ...useNodeTypeRegistryStore.getState().nodeTypes };
}

/**
 * Create a new node using the registered template creator
 */
export function createNodeFromTemplate(
  type: string,
  params: {
    id: string;
    position: { x: number; y: number };
    eventNode?: Node<any>;
  } & Record<string, any>
): Node<any> | undefined {
  //If it's not a custom node type but a default one, use the default template
  if (type === "default" || !type) {
    const defaultTemplate = {
      id: params.id,
      type: "default",
      position: params.position,
      data: params,
    };
    //If there is a parent, then extent: "parent",
    if (params.eventNode?.parentId) {
      params.extent = "parent";
    }
    return defaultTemplate;
  }
  const creator = getNodeTemplateCreator(type);

  if (!creator) return undefined;
  return creator(params, type);
}

/**
 * React hook for accessing node types with proper caching to avoid infinite loops
 */
export function useNodeTypeRegistry() {
  // Use useShallow to properly handle equality checks
  const { nodeTypes, version } = useNodeTypeRegistryStore(
    useShallow((state) => ({
      nodeTypes: state.nodeTypes,
      version: state.version,
    }))
  );

  // Keep a stable reference to nodeTypes
  const cachedTypes = useMemo(() => nodeTypes, [nodeTypes]);

  // Use initialization ref to ensure we only initialize once
  const initialized = useRef(false);

  // Initialize the registry if needed - moved to useEffect to avoid state updates during render
  useEffect(() => {
    if (
      !initialized.current &&
      Object.keys(cachedTypes).length === 0 &&
      nodeTypeRegistry.size > 0
    ) {
      initialized.current = true;
      updateRegistry();
    }
  }, [cachedTypes]);

  // Return stable reference
  return useMemo(
    () => ({
      nodeTypes: cachedTypes,
      version,
    }),
    [cachedTypes, version]
  );
}

// For compatibility
export { useNodeTypeRegistry as useNodeTypeRegistryStore };
