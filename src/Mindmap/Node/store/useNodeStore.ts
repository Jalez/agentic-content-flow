/** @format */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Node } from "@xyflow/react";
import { childNodesData, parentNodesData } from "../../test/nodesData";
import { getNodeTypeInfo } from "../registry/nodeTypeRegistry";
import { organizeNodeParents } from "../hooks/utils/organizeNodeParents";

export interface NodeStoreState {
  nodes: Node<any>[];
  parentNodes: Node<any>[];
  childNodes: Node<any>[];
  nodeMap: Map<string, Node<any>>;
  nodeParentMap: Map<string, Node<any>[]>;

  setNodes: (nodes: Node<any>[]) => void;
  addNodeToStore: (node: Node<any>) => void;
  removeNodes: (nodes: Node<any>[]) => void;
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

    // Also check if this node itself is a parent type and ensure it has an entry
    // in the nodeParentMap (even if it has no children yet)
    if (node.type && (node.data?.isParent || isParentNodeType(node.type))) {
      if (!nodeParentMap.has(node.id)) {
        nodeParentMap.set(node.id, []);
      }
    }
  });

  return { nodeMap, nodeParentMap };
};

// Helper to check if a node type is registered as a parent
const isParentNodeType = (type: string): boolean => {
  const nodeTypeInfo = getNodeTypeInfo(type);
  return !!nodeTypeInfo?.isParent;
};

const initialParentNodes = parentNodesData;

const initialChildNodes = childNodesData;
const initialNodes = [...initialParentNodes, ...initialChildNodes];
const initialMaps = rebuildMaps(initialNodes);

export const useNodeStore = create<NodeStoreState>()(
  persist(
  (set, get) => ({
    nodes: initialNodes,
    parentNodes: initialParentNodes,
    childNodes: initialChildNodes,
    nodeMap: initialMaps.nodeMap,
    nodeParentMap: initialMaps.nodeParentMap,

    getNode: (id: string) => get().nodeMap.get(id),

    setNodes: (nodes) => {
      if (!Array.isArray(nodes)) {
        console.error("Invalid nodes value:", nodes);
        return;
      }
      const { nodeMap, nodeParentMap } = rebuildMaps(nodes);
      set({ nodes, nodeMap, nodeParentMap });
    },

    setChildNodes: (newChildnodes: Node<any>[]) => {

      const newNodes = [...get().parentNodes
        , ...newChildnodes];

      const { nodeMap, nodeParentMap } = rebuildMaps(newNodes);
      set({ nodes: newNodes, nodeMap, nodeParentMap, childNodes: newChildnodes });
    },

    setParentNodes: (newParentnodes: Node<any>[]) => {
      const newNodes = [...newParentnodes, ...get().childNodes];

      const { nodeMap, nodeParentMap } = rebuildMaps(newNodes);
      set({ nodes: newNodes, nodeMap, nodeParentMap, parentNodes: newParentnodes });
    },


    addNodeToStore: (node) => {
      set((state) => {
        // If node exists, throw an error
        if (state.nodeMap.has(node.id)) {
          console.error("Node already exists in the store:", node.id);
          return state;
        }
        // Create new maps (shallow clones)
        const newNodeMap = new Map(state.nodeMap);
        const newNodeParentMap = new Map(state.nodeParentMap);

        newNodeMap.set(node.id, node);

        // Update parent-child relationships
        if (node.parentId) {
          if (!newNodeParentMap.has(node.parentId)) {
            console.error(
              `Parent node not found in the store: ${node.parentId}. Node ID: ${node.id}`
            );
            return state;
          }
          const children = [...(newNodeParentMap.get(node.parentId) || [])];
          children.push(node);
          newNodeParentMap.set(node.parentId, children);
        } else {
          const noParentChildren = [...(newNodeParentMap.get("no-parent") || [])];
          noParentChildren.push(node);
          newNodeParentMap.set("no-parent", noParentChildren);
        }


        let newNodes = state.nodes;
        let newChildNodes = state.childNodes;
        let newParentNodes = state.parentNodes;
        if (!isParentNodeType(node?.type || "")) {
          newChildNodes = [...state.childNodes, node];
          newNodes = [...state.parentNodes, ...newChildNodes];
        }
        else {
          if (newNodeParentMap.has(node.id)) {
            console.error(
              `This node is already a parent node: ${node.id}. Node ID: ${node.id}. Aborting`
            );
            return state;
          }
          newNodeParentMap.set(node.id, []);
          newParentNodes = organizeNodeParents(
            newNodeParentMap,
            newNodeMap
          );
          newNodes = [...newParentNodes, ...state.childNodes];
        }

        return {
          nodes: newNodes,
          nodeMap: newNodeMap,
          nodeParentMap: newNodeParentMap,
          parentNodes: newParentNodes,
          childNodes: newChildNodes,
        };
      });
    },

    updateNode: (node) => {
      set((state) => {
        //If the node doesnt exist, cant update it
        if (!state.nodeMap.has(node.id)) {
          console.error("Node not found in the store:", node.id);
          return state;
        }
        // Create new maps (shallow clones)
        const newNodeMap = new Map(state.nodeMap);
        const newNodeParentMap = new Map(state.nodeParentMap);
        //Get also the old node
        const oldNode = state.nodeMap.get(node.id);
        // Update the node in the nodeMap

        newNodeMap.set(node.id, node);
        // Update parent-child relationships if the parentId has changed
        if (oldNode?.parentId !== node?.parentId) {
          const addToId = node.parentId || "no-parent";
          // If the new parentId is not in the map, throw an error
          if (!newNodeParentMap.has(addToId)) {
            console.error(
              `Parent node not found in the store: ${addToId}. Node ID: ${node.id}`
            );
            return state;
          }
          // Add the node to the new parentId
          const newSiblings = [...(newNodeParentMap.get(addToId) || [])];
          newSiblings.push(node);
          newNodeParentMap.set(addToId, newSiblings);

          const removeFromId = oldNode?.parentId || "no-parent";
          const oldSiblings = [...(newNodeParentMap.get(removeFromId) || [])];
          const index = oldSiblings.findIndex((child) => child.id === node.id);
          if (index !== -1) {
            oldSiblings.splice(index, 1);
            newNodeParentMap.set(removeFromId, oldSiblings);
          }
        }

        let newNodes = state.nodes;
        let newChildNodes = state.childNodes;
        let newParentNodes = state.parentNodes;

        if (!isParentNodeType(node?.type || "")) {
          newChildNodes = state.childNodes.map((child) => {
            if (child.id === node.id) {
              return node;
            }
            return child;
          });
          newNodes = [...state.parentNodes, ...newChildNodes];
        } else {
          newParentNodes = organizeNodeParents(
            newNodeParentMap,
            newNodeMap
          );
          newNodes = [...newParentNodes, ...state.childNodes];
        }

        return {
          nodes: newNodes,
          nodeMap: newNodeMap,
          nodeParentMap: newNodeParentMap,
          parentNodes: newParentNodes,
          childNodes: newChildNodes,
        };
      });
    },
    removeNodes: (nodesToRemove) => {
      set((state) => {
        // If node doesn't exist, throw an error
        const newNodeMap = new Map(state.nodeMap);
        const newNodeParentMap = new Map(state.nodeParentMap);
        let newNodes = state.nodes;
        let newChildNodes = state.childNodes;
        let newParentNodes = state.parentNodes;
        for (const node of nodesToRemove) {
          const nodeId = node.id;
          if (!state.nodeMap.has(nodeId)) {
            console.error("Node not found in the store:", nodeId);
            return state;
          }
          
          // Create new maps (shallow clones)
          //we know its in the map
          // Remove the node from the nodeMap
          const nodeToRemove = newNodeMap.get(nodeId);
          newNodeMap.delete(nodeId);
          // Remove the node from the parent-child relationships
          if (nodeToRemove?.parentId) {
            const children = [...(newNodeParentMap.get(nodeToRemove.parentId) || [])];
            const index = children.findIndex((child) => child.id === nodeId);
            if (index !== -1) {
              children.splice(index, 1);
              newNodeParentMap.set(nodeToRemove.parentId, children);
            }
          } else {
            const noParentChildren = [...(newNodeParentMap.get("no-parent") || [])];
            const index = noParentChildren.findIndex((child) => child.id === nodeId);
            if (index !== -1) {
              noParentChildren.splice(index, 1);
              newNodeParentMap.set("no-parent", noParentChildren);
            }
          }
          const nodeType = nodeToRemove?.type;
          if (nodeType && isParentNodeType(nodeType)) {
            //If it has children, then make them children of the nodes parent
            const children = newNodeParentMap.get(nodeId);
            if (children && children.length > 0) {
              // Get the parent of the node
              const parentId = nodeToRemove.parentId;
              if (parentId) {
                // Add the children to the parent
                const parentChildren = newNodeParentMap.get(parentId);
                if (parentChildren) {
                  parentChildren.push(...children);
                  newNodeParentMap.set(parentId, parentChildren);
                }
              }
            }
            newNodeParentMap.delete(nodeId);
          }
          
          
          
          if (!isParentNodeType(nodeToRemove?.type || "")) {
            newChildNodes = state.childNodes.filter((node) => node.id !== nodeId);
            newNodes = [...state.parentNodes, ...newChildNodes];
          } else {
            newParentNodes = state.parentNodes.filter((node) => node.id !== nodeId);
            newNodes = [...newParentNodes, ...state.childNodes];
          }
        }
          return {
            nodes: newNodes,
            nodeMap: newNodeMap,
            nodeParentMap: newNodeParentMap,
          parentNodes: newParentNodes,
          childNodes: newChildNodes,
        };


      });
    },

    // Merges only the updated nodes with the existing ones.
    updateNodes: (updatedNodes: Node<any>[]) => {
      set((state) => {

        //First, go through the updated nodes and check if they exist in the store
        for (const node of updatedNodes) {
          if (!state.nodeMap.has(node.id)) {
            console.error("Node not found in the store:", node.id);
            return state;
          }
        }

        // Create new maps (shallow clones)
        const newNodeMap = new Map(state.nodeMap);
        const newNodeParentMap = new Map(state.nodeParentMap);

        // Update the nodes in the nodeMap
        updatedNodes.forEach((node) => {
          newNodeMap.set(node.id, node);
        });

        // Update parent-child relationships

        // Update the nodes in the store
        let newNodes = state.nodes;
        let newChildNodes: Node[] = []
        let newParentNodes = state.parentNodes;
        updatedNodes.forEach((node) => {
          const oldNode = state.nodeMap.get(node.id);
          if (oldNode?.parentId !== node?.parentId) {
            const addToId = node.parentId || "no-parent";
            // If the new parentId is not in the map, throw an error
            if (!newNodeParentMap.has(addToId)) {
              console.error(
                `Parent node not found in the store: ${addToId}. Node ID: ${node.id}`
              );
              return state;
            }
            // Add the node to the new parentId
            const newSiblings = [...(newNodeParentMap.get(addToId) || [])];
            newSiblings.push(node);
            newNodeParentMap.set(addToId, newSiblings);

            const removeFromId = oldNode?.parentId || "no-parent";
            const oldSiblings = [...(newNodeParentMap.get(removeFromId) || [])];
            const index = oldSiblings.findIndex((child) => child.id === node.id);
            if (index !== -1) {
              oldSiblings.splice(index, 1);
              newNodeParentMap.set(removeFromId, oldSiblings);
            }
          }

          if (!isParentNodeType(node.type || "")) {
            newChildNodes.push(node);
          } else {
            newParentNodes = organizeNodeParents(
              newNodeParentMap,
              newNodeMap
            );
          }
        });
        newNodes = [...newParentNodes, ...newChildNodes];

        return {
          nodes: newNodes,
          nodeMap: newNodeMap,
          nodeParentMap: newNodeParentMap,
          parentNodes: newParentNodes,
          childNodes: newChildNodes,
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
      parentNodes: state.parentNodes,
      childNodes: state.childNodes,
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
