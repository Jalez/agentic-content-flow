/** @format */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Node } from "@xyflow/react";
import { childNodesData, parentNodesData } from "../../test/default/nodesData";
import { getNodeTypeInfo } from "../registry/nodeTypeRegistry";
import { organizeNodeParents } from "../hooks/utils/organizeNodeParents";

export interface NodeStoreState {
  nodes: Node<any>[];
  parentNodes: Node<any>[];
  childNodes: Node<any>[];
  nodeMap: Map<string, Node<any>>;
  nodeParentMap: Map<string, Node<any>[]>;
  nodeParentIdMapWithChildIdSet: Map<string, Set<string>>;


  setNodes: (nodes: Node<any>[]) => void;
  addNodeToStore: (node: Node<any>) => void;
  removeNodes: (nodes: Node<any>[]) => void;
  getNode: (id: string) => Node<any> | undefined;
  updateNode: (node: Node<any>) => void;
  updateNodes: (nodes: Node<any>[]) => void;
}

// Helper to rebuild lookup maps from a nodes array.
const rebuildStoreState = (nodes: Node<any>[]) => {
  const nodeMap = new Map<string, Node<any>>();
  //Map where key is parentId and value is an array of child nodes
  const nodeParentMap = new Map<string, Node<any>[]>();
  const nodeParentIdMapWithChildIdSet = new Map<string, Set<string>>();

  // Ensure "no-parent" category exists.
  nodeParentMap.set("no-parent", []);
  nodeParentIdMapWithChildIdSet.set("no-parent", new Set());

  nodes.forEach((node) => {
    nodeMap.set(node.id, node);
    if (node.parentId) {
      if (!nodeParentMap.has(node.parentId)) {
        nodeParentMap.set(node.parentId, []);
        nodeParentIdMapWithChildIdSet.set(node.parentId, new Set());
      }
      nodeParentMap.get(node.parentId)!.push(node);
      nodeParentIdMapWithChildIdSet.get(node.parentId)!.add(node.id);
    } else {
      nodeParentMap.get("no-parent")!.push(node);
      nodeParentIdMapWithChildIdSet.get("no-parent")!.add(node.id);

    }

    // Also check if this node itself is a parent type and ensure it has an entry
    // in the nodeParentMap (even if it has no children yet)
    if (node.type && (node.data?.isParent || isParentNodeType(node.type))) {
      if (!nodeParentMap.has(node.id)) {
        nodeParentMap.set(node.id, []);
        nodeParentIdMapWithChildIdSet.set(node.id, new Set());
      }
    }
  });

  return { nodeMap, nodeParentMap, nodeParentIdMapWithChildIdSet };
};

// Helper to check if a node type is registered as a parent
const isParentNodeType = (type: string): boolean => {
  const nodeTypeInfo = getNodeTypeInfo(type);
  return !!nodeTypeInfo?.isParent;
};

const initialParentNodes = parentNodesData;

const initialChildNodes = childNodesData;
const initialNodes = [...initialParentNodes, ...initialChildNodes];
const initialState = rebuildStoreState(initialNodes);

export const useNodeStore = create<NodeStoreState>()(
  persist(
  (set, get) => ({
    nodes: initialNodes,
    parentNodes: initialParentNodes,
    childNodes: initialChildNodes,
    nodeMap: initialState.nodeMap,
    nodeParentMap: initialState.nodeParentMap,
    nodeParentIdMapWithChildIdSet: initialState.nodeParentIdMapWithChildIdSet,

    getNode: (id: string) => get().nodeMap.get(id),

    setNodes: (nodes) => {
      if (!Array.isArray(nodes)) {
        console.error("Invalid nodes value:", nodes);
        return;
      }
      const { nodeMap, nodeParentMap, nodeParentIdMapWithChildIdSet } = rebuildStoreState(nodes);
      
      // Split the nodes into parent and child arrays
      const parentNodes = nodes.filter(node => 
        node.type && isParentNodeType(node.type)
      );
      const childNodes = nodes.filter(node => 
        !node.type || !isParentNodeType(node.type)
      );
      
      // Update the entire state with the new data
      set({ 
        nodes, 
        nodeMap, 
        nodeParentMap, 
        nodeParentIdMapWithChildIdSet,
        parentNodes,
        childNodes
      });
    },

    setChildNodes: (newChildnodes: Node<any>[]) => {

      const newNodes = [...get().parentNodes
        , ...newChildnodes];

      const { nodeMap, nodeParentMap, nodeParentIdMapWithChildIdSet } = rebuildStoreState(newNodes);
      set({ nodes: newNodes, nodeMap, nodeParentMap, childNodes: newChildnodes, nodeParentIdMapWithChildIdSet });
    },

    setParentNodes: (newParentnodes: Node<any>[]) => {
      const newNodes = [...newParentnodes, ...get().childNodes];

      const { nodeMap, nodeParentMap, nodeParentIdMapWithChildIdSet } = rebuildStoreState(newNodes);
      set({ nodes: newNodes, nodeMap, nodeParentMap, parentNodes: newParentnodes, nodeParentIdMapWithChildIdSet });
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
        const newNodeParentIdMapWithChildIdSet = new Map(state.nodeParentIdMapWithChildIdSet);

        newNodeMap.set(node.id, node);

        // Update parent-child relationships
        const parentId = node.parentId || "no-parent";
        
        // Update the Set-based map structure (more efficient)
        if (!newNodeParentIdMapWithChildIdSet.has(parentId)) {
          newNodeParentIdMapWithChildIdSet.set(parentId, new Set());
        }
        newNodeParentIdMapWithChildIdSet.get(parentId)!.add(node.id);

        // Update the old nodeParentMap too (for backwards compatibility)
        if (!newNodeParentMap.has(parentId)) {
          // Only show error for real parent IDs, not "no-parent"
          if (parentId !== "no-parent") {
            console.error(
              `Parent node not found in the store: ${parentId}. Node ID: ${node.id}`
            );
            return state;
          }
          newNodeParentMap.set(parentId, []);
        }
        const children = [...(newNodeParentMap.get(parentId) || [])];
        children.push(node);
        newNodeParentMap.set(parentId, children);

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
          newNodeParentIdMapWithChildIdSet.set(node.id, new Set());
          newParentNodes = organizeNodeParents(
            newNodeParentIdMapWithChildIdSet,
            newNodeMap
          );
          newNodes = [...newParentNodes, ...state.childNodes];
        }

        return {
          nodes: newNodes,
          nodeMap: newNodeMap,
          nodeParentMap: newNodeParentMap,
          nodeParentIdMapWithChildIdSet: newNodeParentIdMapWithChildIdSet,
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
        const newNodeParentIdMapWithChildIdSet = new Map(state.nodeParentIdMapWithChildIdSet);
        
        //Get also the old node
        const oldNode = state.nodeMap.get(node.id);
        
        // Update the node in the nodeMap
        newNodeMap.set(node.id, node);
        
        // Update parent-child relationships if the parentId has changed
        if (oldNode?.parentId !== node?.parentId) {
          // Remove from old parent's child set
          const removeFromId = oldNode?.parentId || "no-parent";
          const oldChildSet = newNodeParentIdMapWithChildIdSet.get(removeFromId);
          if (oldChildSet) {
            oldChildSet.delete(node.id);
          }
          
          // Add to new parent's child set
          const addToId = node.parentId || "no-parent";
          if (!newNodeParentIdMapWithChildIdSet.has(addToId)) {
            newNodeParentIdMapWithChildIdSet.set(addToId, new Set());
          }
          newNodeParentIdMapWithChildIdSet.get(addToId)!.add(node.id);
          
          // Update the old nodeParentMap too (for backwards compatibility)
          // Add the node to the new parentId
          const newSiblings = [...(newNodeParentMap.get(addToId) || [])];
          newSiblings.push(node);
          newNodeParentMap.set(addToId, newSiblings);

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
            newNodeParentIdMapWithChildIdSet,
            newNodeMap
          );
          newNodes = [...newParentNodes, ...state.childNodes];
        }

        return {
          nodes: newNodes,
          nodeMap: newNodeMap,
          nodeParentMap: newNodeParentMap,
          nodeParentIdMapWithChildIdSet: newNodeParentIdMapWithChildIdSet,
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
        const newNodeParentIdMapWithChildIdSet = new Map(state.nodeParentIdMapWithChildIdSet);
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
          // We know it's in the map
          // Remove the node from the nodeMap
          const nodeToRemove = newNodeMap.get(nodeId);
          newNodeMap.delete(nodeId);
          
          // Remove the node from the parent-child relationships using the Set-based approach
          if (nodeToRemove?.parentId) {
            const parentId = nodeToRemove.parentId;
            const childIdSet = newNodeParentIdMapWithChildIdSet.get(parentId);
            if (childIdSet) {
              childIdSet.delete(nodeId);
              if (childIdSet.size === 0) {
                // If no more children, consider deleting the set
                // But we keep the entry to preserve the fact this was a parent node
                // newNodeParentIdMapWithChildIdSet.delete(parentId);
              }
            }
            
            // Update the old nodeParentMap too (for backwards compatibility)
            const children = [...(newNodeParentMap.get(parentId) || [])];
            const index = children.findIndex((child) => child.id === nodeId);
            if (index !== -1) {
              children.splice(index, 1);
              newNodeParentMap.set(parentId, children);
            }
          } else {
            // Handle no-parent case for Set-based map
            const noParentChildIdSet = newNodeParentIdMapWithChildIdSet.get("no-parent");
            if (noParentChildIdSet) {
              noParentChildIdSet.delete(nodeId);
            }
            
            // Update old nodeParentMap too
            const noParentChildren = [...(newNodeParentMap.get("no-parent") || [])];
            const index = noParentChildren.findIndex((child) => child.id === nodeId);
            if (index !== -1) {
              noParentChildren.splice(index, 1);
              newNodeParentMap.set("no-parent", noParentChildren);
            }
          }
          
          const nodeType = nodeToRemove?.type;
          if (nodeType && isParentNodeType(nodeType)) {
            // If it has children, then make them children of the node's parent
            // Get all child IDs from the Set-based map
            const childIdSet = newNodeParentIdMapWithChildIdSet.get(nodeId);
            
            if (childIdSet && childIdSet.size > 0) {
              // Get the parent of the node
              const parentId = nodeToRemove.parentId || "no-parent";
              
              // Add the children to the parent's Set
              if (!newNodeParentIdMapWithChildIdSet.has(parentId)) {
                newNodeParentIdMapWithChildIdSet.set(parentId, new Set());
              }
              const parentChildIdSet = newNodeParentIdMapWithChildIdSet.get(parentId)!;
              
              // Add all child IDs to the parent's set
              childIdSet.forEach(childId => {
                parentChildIdSet.add(childId);
                
                // Update each child's parentId in the nodeMap
                const childNode = newNodeMap.get(childId);
                if (childNode) {
                  childNode.parentId = parentId === "no-parent" ? undefined : parentId;
                  newNodeMap.set(childId, childNode);
                }
              });
              
              // Also update the old nodeParentMap (for backwards compatibility)
              const children = newNodeParentMap.get(nodeId) || [];
              if (children.length > 0) {
                const parentChildren = newNodeParentMap.get(parentId) || [];
                parentChildren.push(...children);
                newNodeParentMap.set(parentId, parentChildren);
              }
            }
            
            // Remove this node as a parent from both map structures
            newNodeParentIdMapWithChildIdSet.delete(nodeId);
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
          nodeParentIdMapWithChildIdSet: newNodeParentIdMapWithChildIdSet,
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
        const newNodeParentIdMapWithChildIdSet = new Map(state.nodeParentIdMapWithChildIdSet);
                
        // Update the nodes in the store
        let newNodes: Node<any>[] = [...state.nodes];
        let newChildNodes: Node[] = [...state.childNodes];
        let newParentNodes: Node[] = [...state.parentNodes];
        updatedNodes.forEach((node) => {
          newNodeMap.set(node.id, node);
          const oldNode = state.nodeMap.get(node.id);
          if (oldNode?.parentId !== node?.parentId) {
            // If the node has a new parentId, remove it from the old parentId
            //remove it from the newNodeParentIdMapWithChildIdSet
            const oldParentId = oldNode?.parentId || "no-parent";
            const oldParentChildren = newNodeParentIdMapWithChildIdSet.get(oldParentId);
            if (oldParentChildren) {
              oldParentChildren.delete(node.id);
            
            }
            // Add the node to the new parentId
            // If the new parentId is not in the map, throw an error
            const newParentId = node.parentId || "no-parent";
            if (!newNodeParentIdMapWithChildIdSet.has(newParentId)) {
              newNodeParentIdMapWithChildIdSet.set(newParentId, new Set());
            }
            const newParentChildren = newNodeParentIdMapWithChildIdSet.get(newParentId);
            if (newParentChildren) {
              newParentChildren.add(node.id);
            }
            // USING THE OLD PARENT ID MAP - TO BE REMOVED
            // If the new parentId is not in the map, throw an error
            if (!newNodeParentMap.has(newParentId)) {
              console.error(
                `Parent node not found in the store: ${newParentId}. Node ID: ${node.id}`
              );
              return state;
            }
            // Add the node to the new parentId
            const newSiblings = [...(newNodeParentMap.get(newParentId) || [])];
            newSiblings.push(node);
            newNodeParentMap.set(newParentId, newSiblings);

            const oldSiblings = [...(newNodeParentMap.get(oldParentId) || [])];
            const index = oldSiblings.findIndex((child) => child.id === node.id);
            if (index !== -1) {
              oldSiblings.splice(index, 1);
              newNodeParentMap.set(oldParentId, oldSiblings);
            }
          }

          if (!isParentNodeType(node.type || "")) {
            //find the node in the childNodes and update it
            const index = newChildNodes.findIndex((child) => child.id === node.id);
            if (index !== -1) {
              newChildNodes[index] = node;
            } else {
              console.error("Node not found in the childNodes:", node.id);
            }
          } else {
            newParentNodes = organizeNodeParents(
              newNodeParentIdMapWithChildIdSet,
              newNodeMap
            );
          }
        });
        newNodes = [...newParentNodes, ...newChildNodes];
        return {
          nodes: newNodes,
          nodeMap: newNodeMap,
          nodeParentMap: newNodeParentMap,
          nodeParentIdMapWithChildIdSet: newNodeParentIdMapWithChildIdSet,
          parentNodes: newParentNodes,
          childNodes: newChildNodes,
        };
      });
    },



  }),
  {
    name: "node-storage",
    partialize: (state) => ({
      nodes: state.nodes,
      parentNodes: state.parentNodes,
      childNodes: state.childNodes,
    }),
    onRehydrateStorage: () => (state) => {
      if (state) {
        // When rehydrating, ensure we rebuild all the necessary maps
        const { nodeMap, nodeParentMap, nodeParentIdMapWithChildIdSet } = rebuildStoreState(state.nodes);
        state.nodeMap = nodeMap;
        state.nodeParentMap = nodeParentMap;
        state.nodeParentIdMapWithChildIdSet = nodeParentIdMapWithChildIdSet;
        
        // Ensure parent and child nodes are correctly categorized
        const parentNodes = state.nodes.filter(node => 
          node.type && isParentNodeType(node.type)
        );
        const childNodes = state.nodes.filter(node => 
          !node.type || !isParentNodeType(node.type)
        );
        
        state.parentNodes = parentNodes;
        state.childNodes = childNodes;
        
        console.log("Store rehydrated with", state.nodes.length, "nodes");
      }
    },
  }
  )
);
