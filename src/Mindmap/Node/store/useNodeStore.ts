/** @format */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Node } from "@xyflow/react";
import { nodesData } from "../../test/nodesData";

export interface NodeStoreState {
  nodes: Node<any>[];
  nodeMap: Map<string, Node<any>>;
  nodeParentMap: Map<string, Node<any>[]>;

  setNodes: (nodes: Node<any>[]) => void;
  addNodeToStore: (node: Node<any>) => void;
  removeNode: (nodeId: string) => void;
  getNode: (id: string) => Node<any> | undefined;
  updateNode: (node: Node<any>) => void;
  updateNodes: (nodes: Node<any>[]) => void;
  expandedNodes: Record<string, boolean>;
  toggleNodeExpansion: (nodeId: string) => void;
}

// Helper to rebuild lookup maps from a nodes array.
const rebuildMaps = (nodes: Node<any>[]) => {
  const nodeMap = new Map<string, Node<any>>();
  //Map where key is parentId and value is an array of child nodes
  const nodeParentMap = new Map<string, Node<any>[]>();
  // Ensure "no-parent" category exists.
  nodeParentMap.set("no-parent", []);


  nodes.forEach((node) => {
    nodeMap.set(node.id, node);
    if (node.parentId) {
      if (!nodeParentMap.has(node.parentId)) {
        nodeParentMap.set(node.parentId, []);
      }
      nodeParentMap.get(node.parentId)!.push(node);
    } else {
      nodeParentMap.get("no-parent")!.push(node);
    }
  });

  return { nodeMap, nodeParentMap };
};

const initialNodes = nodesData;
const initialMaps = rebuildMaps(initialNodes);

export const useNodeStore = create<NodeStoreState>()(
  persist(
    (set, get) => ({
      nodes: initialNodes,
      nodeMap: initialMaps.nodeMap,
      nodeParentMap: initialMaps.nodeParentMap,

      getNode: (id: string) => get().nodeMap.get(id),

      setNodes: (nodes) => {
        if (!Array.isArray(nodes)) {
          console.error("Invalid nodes value:", nodes);
          return;
        }
        console.log("SET NODES CALLED", nodes);
        const { nodeMap, nodeParentMap } = rebuildMaps(nodes);
        set({ nodes, nodeMap, nodeParentMap });
      },

      addNodeToStore: (node) => {
        set((state) => {
          // If node exists, update it; otherwise, append.
          const exists = state.nodes.some((n) => n.id === node.id);
          const newNodes = exists
            ? state.nodes.map((n) => (n.id === node.id ? node : n))
            : [...state.nodes, node];
          const { nodeMap, nodeParentMap } = rebuildMaps(newNodes);
          return { nodes: newNodes, nodeMap, nodeParentMap };
        });
      },

      updateNode: (node) => {
        set((state) => {
          const newNodes = state.nodes.map((n) =>
            n.id === node.id ? node : n
          );
          const { nodeMap, nodeParentMap } = rebuildMaps(newNodes);
          return { nodes: newNodes, nodeMap, nodeParentMap };
        });
      },

      // Merges only the updated nodes with the existing ones.
      updateNodes: (updatedNodes: Node<any>[]) => {
        set((state) => {
          const updatedMap = new Map<string, Node<any>>();
          updatedNodes.forEach((node) => {
            updatedMap.set(node.id, node);
          });
          // Replace nodes that exist with their updated version.
          const mergedNodes = state.nodes.map((node) =>
            updatedMap.has(node.id) ? updatedMap.get(node.id)! : node
          );
          // Append any updated node not already in state.
          updatedNodes.forEach((node) => {
            if (!mergedNodes.some((n) => n.id === node.id)) {
              mergedNodes.push(node);
            }
          });
          const { nodeMap, nodeParentMap } = rebuildMaps(mergedNodes);
          return { nodes: mergedNodes, nodeMap, nodeParentMap };
        });
      },

      removeNode: (nodeId) => {
        set((state) => {
          const newNodes = state.nodes.filter((node) => node.id !== nodeId);
          const { nodeMap, nodeParentMap } = rebuildMaps(newNodes);
          return { nodes: newNodes, nodeMap, nodeParentMap };
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
          const { nodeMap, nodeParentMap } = rebuildMaps(state.nodes);
          state.nodeMap = nodeMap;
          state.nodeParentMap = nodeParentMap;
        }
      },
    }
  )
);
