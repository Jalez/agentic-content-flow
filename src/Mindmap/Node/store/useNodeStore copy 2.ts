/** @format */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Node } from "@xyflow/react";
import { nodesData } from "../../test/nodesData";

export interface NodeStoreState {
  // Keep both data structures
  nodes: Node<any>[]; // For React Flow rendering
  nodeMap: Map<string, Node<any>>; // For O(1) lookups
  nodeParentMap: Map<string, Node<any>[]>; // For O(1) parent lookups

  // Operations
  setNodes: (nodes: Node<any>[]) => void;
  addNodeToStore: (node: Node<any>) => void;
  removeNode: (nodeId: string) => void;
  getNode: (id: string) => Node<any> | undefined;
  updateNode: (node: Node<any>) => void;
  updateNodes: (nodes: Node<any>[]) => void;
  expandedNodes: Record<string, boolean>;
  toggleNodeExpansion: (nodeId: string) => void;
}

// Initialize both structures
const initialNodes = nodesData;
const createInitialNodeMap = () => {
  const map = new Map<string, Node<any>>();
  initialNodes.forEach((node) => map.set(node.id, node));
  return map;
};

// Create a parent map for efficient parent lookups
const createInitialNodeParentMap = () => {
  const map = new Map<string, Node<any>[]>();

  // First pass: initialize empty arrays for all parent categories
  initialNodes.forEach((node) => {
    if (node.parentId) {
      if (!map.has(node.parentId)) {
        map.set(node.parentId, []);
      }
    }
  });

  // Initialize no-parent category
  if (!map.has("no-parent")) {
    map.set("no-parent", []);
  }

  // Second pass: add nodes to their respective parent arrays, ensuring no duplicates
  initialNodes.forEach((node) => {
    if (node.parentId) {
      const parentChildren = map.get(node.parentId)!;
      if (!parentChildren.some((child) => child.id === node.id)) {
        parentChildren.push(node);
      }
    } else {
      const noParentChildren = map.get("no-parent")!;
      if (!noParentChildren.some((child) => child.id === node.id)) {
        noParentChildren.push(node);
      }
    }
  });

  return map;
};

// Helper functions to manage node relationships
const addToParent = (
  parentMap: Map<string, Node<any>[]>,
  node: Node<any>
): Map<string, Node<any>[]> => {
  const newParentMap = new Map(parentMap);
  const parentId = node.parentId || "no-parent";
  const parentChildren = newParentMap.get(parentId) || [];

  // Only add if not already present
  if (!parentChildren.some((child) => child.id === node.id)) {
    newParentMap.set(parentId, [...parentChildren, node]);
  }

  return newParentMap;
};

const removeFromParent = (
  parentMap: Map<string, Node<any>[]>,
  node: Node<any>
): Map<string, Node<any>[]> => {
  const newParentMap = new Map(parentMap);
  const parentId = node.parentId || "no-parent";
  const parentChildren = newParentMap.get(parentId);

  if (parentChildren) {
    newParentMap.set(
      parentId,
      parentChildren.filter((child) => child.id !== node.id)
    );
  }

  return newParentMap;
};

// Get all descendant node IDs (for recursive removal)
const getAllDescendantIds = (
  nodeId: string,
  parentMap: Map<string, Node<any>[]>
): string[] => {
  const result: string[] = [];
  const children = parentMap.get(nodeId) || [];

  children.forEach((child) => {
    result.push(child.id);
    result.push(...getAllDescendantIds(child.id, parentMap));
  });

  return result;
};

export const useNodeStore = create<NodeStoreState>()(
  persist(
    (set, get) => ({
      nodes: initialNodes,
      nodeMap: createInitialNodeMap(),
      nodeParentMap: createInitialNodeParentMap(),

      // Efficient node lookup
      getNode: (id: string) => get().nodeMap.get(id),

      // Keep both structures in sync when updating
      setNodes: (nodes) => {
        if (!Array.isArray(nodes)) {
          console.error("Invalid nodes value:", nodes);
          return;
        }

        // Update both array and map simultaneously
        const nodeMap = new Map<string, Node<any>>();
        const nodeParentMap = new Map<string, Node<any>[]>();

        // Initialize parent arrays
        nodeParentMap.set("no-parent", []);
        nodes.forEach((node) => {
          if (node.parentId && !nodeParentMap.has(node.parentId)) {
            nodeParentMap.set(node.parentId, []);
          }
        });

        // Add all nodes to maps
        nodes.forEach((node) => {
          nodeMap.set(node.id, node);
          if (node.parentId) {
            const parentChildren = nodeParentMap.get(node.parentId)!;
            if (!parentChildren.some((child) => child.id === node.id)) {
              parentChildren.push(node);
            }
          } else {
            const noParentChildren = nodeParentMap.get("no-parent")!;
            if (!noParentChildren.some((child) => child.id === node.id)) {
              noParentChildren.push(node);
            }
          }
        });

        set({ nodes, nodeMap, nodeParentMap });
      },

      addNodeToStore: (node) => {
        set((state) => {
          // First check if node already exists
          if (state.nodeMap.has(node.id)) {
            console.warn(
              `Node with id ${node.id} already exists. Updating instead of adding.`
            );
            return state.updateNode(node), state;
          }

          const newNodes = [...state.nodes, node];
          const newNodeMap = new Map(state.nodeMap);
          newNodeMap.set(node.id, node);

          // Use helper to update parent relationships
          const newNodeParentMap = addToParent(state.nodeParentMap, node);

          return {
            nodes: newNodes,
            nodeMap: newNodeMap,
            nodeParentMap: newNodeParentMap,
          };
        });
      },

      updateNode: (node) => {
        set((state) => {
          const oldNode = state.nodeMap.get(node.id);
          if (!oldNode) {
            console.warn(
              `Node with id ${node.id} doesn't exist. Adding instead of updating.`
            );
            return state.addNodeToStore(node), state;
          }

          const updatedNodes = state.nodes.map((n) =>
            n.id === node.id ? node : n
          );
          const updatedMap = new Map(state.nodeMap);
          updatedMap.set(node.id, node);

          // Remove from old parent and add to new parent
          let updatedParentMap = removeFromParent(state.nodeParentMap, oldNode);
          updatedParentMap = addToParent(updatedParentMap, node);

          return {
            nodes: updatedNodes,
            nodeMap: updatedMap,
            nodeParentMap: updatedParentMap,
          };
        });
      },

      updateNodes: (nodes) => {
        set((state) => {
          if (!nodes.length) return state;

          const nodeIds = new Set(nodes.map((n) => n.id));
          const untouchedNodes = state.nodes.filter((n) => !nodeIds.has(n.id));
          const updatedNodes = [...untouchedNodes, ...nodes];

          // Update node map
          const updatedMap = new Map(state.nodeMap);
          nodes.forEach((node) => updatedMap.set(node.id, node));

          // Update parent relationships
          let updatedParentMap = new Map(state.nodeParentMap);

          // Remove old relationships first
          nodes.forEach((node) => {
            const oldNode = state.nodeMap.get(node.id);
            if (oldNode) {
              updatedParentMap = removeFromParent(updatedParentMap, oldNode);
            }
          });

          // Add new relationships
          nodes.forEach((node) => {
            updatedParentMap = addToParent(updatedParentMap, node);
          });

          return {
            nodes: updatedNodes,
            nodeMap: updatedMap,
            nodeParentMap: updatedParentMap,
          };
        });
      },

      removeNode: (nodeId) => {
        set((state) => {
          const nodeToRemove = state.nodeMap.get(nodeId);
          if (!nodeToRemove) return state;

          // Get all descendants to remove
          const descendantIds = getAllDescendantIds(
            nodeId,
            state.nodeParentMap
          );
          const allIdsToRemove = [nodeId, ...descendantIds];

          // Remove nodes from all three data structures
          const updatedNodes = state.nodes.filter(
            (node) => !allIdsToRemove.includes(node.id)
          );

          const updatedNodeMap = new Map(state.nodeMap);
          allIdsToRemove.forEach((id) => updatedNodeMap.delete(id));

          // Remove node from parent's children
          let updatedParentMap = removeFromParent(
            state.nodeParentMap,
            nodeToRemove
          );

          // Remove all child mappings
          allIdsToRemove.forEach((id) => updatedParentMap.delete(id));

          return {
            nodes: updatedNodes,
            nodeMap: updatedNodeMap,
            nodeParentMap: updatedParentMap,
          };
        });
      },

      expandedNodes: {},
      toggleNodeExpansion: (nodeId) =>
        set((state) => ({
          expandedNodes: {
            ...state.expandedNodes,
            [nodeId]: !state.expandedNodes[nodeId],
          },
        })),
    }),

    {
      name: "node-storage",
      partialize: (state) => ({
        nodes: state.nodes,
        expandedNodes: state.expandedNodes,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Rebuild the nodeMap and nodeParentMap from scratch
          const nodeMap = new Map<string, Node<any>>();
          const nodeParentMap = new Map<string, Node<any>[]>();

          // Initialize parent arrays
          nodeParentMap.set("no-parent", []);
          state.nodes.forEach((node) => {
            if (node.parentId && !nodeParentMap.has(node.parentId)) {
              nodeParentMap.set(node.parentId, []);
            }
          });

          // Build all relationships
          state.nodes.forEach((node) => {
            nodeMap.set(node.id, node);
            const parentId = node.parentId || "no-parent";
            const parentChildren = nodeParentMap.get(parentId)!;
            if (!parentChildren.some((child) => child.id === node.id)) {
              parentChildren.push(node);
            }
          });

          // Update the state with rebuilt maps
          state.nodeMap = nodeMap;
          state.nodeParentMap = nodeParentMap;
        }
      },
    }
  )
);
