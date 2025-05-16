import { Node } from "@xyflow/react";
import { defaultInitialState, NodeStoreState } from "../useNodeContext";
import { getOrganizedNodeParents } from "../utils/getOrganizedNodeParents";
import { getPureNodeChildren } from "../utils/getPureNodeChildren";
import { isParentNodeType } from "../utils/nodeTypeCheck";
import { normalizeNodeExpandedState } from "../utils/normalizeNodeExpandedState";
import { addSingleNode, rebuildMapState } from "../utils/rebuildMapState";
import { recursiveNodeRemoval } from "../utils/deleteNodes";

// 2. Define Action Types
export type NodeAction =
  | { type: "SET_NODES"; payload: Node<any>[] }
  | { type: "ADD_NODE"; payload: Node<any> }
  | { type: "REMOVE_NODES"; payload: Node<any>[] }
  | { type: "UPDATE_NODE"; payload: Node<any> }
  | { type: "UPDATE_NODES"; payload: Node<any>[] }
  | { type: "SET_CHILD_NODES"; payload: Node<any>[] }
  | { type: "SET_PARENT_NODES"; payload: Node<any>[] }
  | { type: "REHYDRATE"; payload: NodeStoreState }; // Action for initial load/persistence



// Reducer function
export const nodeReducer = (state: NodeStoreState, action: NodeAction): NodeStoreState => {
    switch (action.type) {
      case "SET_NODES": {
        const nodes = action.payload;
        if (!Array.isArray(nodes)) {
          console.error("Invalid nodes value:", nodes);
          return state;
        }
        // Normalize and rebuild state from new nodes
        const { nodeMap, nodeParentIdMapWithChildIdSet, pureChildIdSet } = rebuildMapState(nodes);
        const parentNodes = getOrganizedNodeParents(nodeParentIdMapWithChildIdSet, nodeMap);
        const childNodes = getPureNodeChildren(pureChildIdSet, nodeMap);
  
  
        return {
          ...state,
          nodes: nodes,
          nodeMap,
          nodeParentIdMapWithChildIdSet,
          parentNodes,
          childNodes,
        };
      }
  
  
      case "ADD_NODE": {
        const node = normalizeNodeExpandedState(action.payload);
        if (state.nodeMap.has(node.id)) {
          console.error("Node already exists in the store:", node.id);
          return state; // Return current state if node exists
        }
  
        // Create new maps (immutable update)
        const newNodeMap = new Map(state.nodeMap);
        const newNodeParentIdMapWithChildIdSet = new Map(
          state.nodeParentIdMapWithChildIdSet
        );
        const newPureChildIdSet = new Set(state.pureChildIdSet);
  
        addSingleNode(
          node,
          newNodeMap,
          newNodeParentIdMapWithChildIdSet,
          newPureChildIdSet
        );
  
        const newParentNodes = getOrganizedNodeParents(
          newNodeParentIdMapWithChildIdSet,
          newNodeMap
        );
        const newChildNodes = getPureNodeChildren(
          newPureChildIdSet,
          newNodeMap
        );
        
        const newNodes = [...newParentNodes, ...newChildNodes];
  
        return {
          ...state,
          nodes: newNodes, // Update with the new nodes array
          nodeMap: newNodeMap,
          nodeParentIdMapWithChildIdSet: newNodeParentIdMapWithChildIdSet,
          parentNodes: newParentNodes,
          childNodes: newChildNodes,
        };
      }
  
      case "REMOVE_NODES": {
        const nodesToRemove = action.payload;
        // Create new maps (immutable update)
        const newNodeMap = new Map(state.nodeMap);
        const newNodeParentIdMapWithChildIdSet = new Map(
          state.nodeParentIdMapWithChildIdSet
        );
        const newPureChildIdSet = new Set(state.pureChildIdSet);
  
        recursiveNodeRemoval(newNodeMap, newNodeParentIdMapWithChildIdSet, newPureChildIdSet, nodesToRemove);
        const reorganizedParentNodes = getOrganizedNodeParents(newNodeParentIdMapWithChildIdSet, newNodeMap);
        const reorganizedChildNodes = getPureNodeChildren(newPureChildIdSet, newNodeMap);
        const nodesAfterRemoval = [...reorganizedParentNodes, ...reorganizedChildNodes];
  
        return {
          ...state,
          nodes: nodesAfterRemoval,
          nodeMap: newNodeMap,
          nodeParentIdMapWithChildIdSet: newNodeParentIdMapWithChildIdSet,
          parentNodes: reorganizedParentNodes,
          childNodes: reorganizedChildNodes,
        };
      }
  
      case "UPDATE_NODE": {
        const updatedNode = normalizeNodeExpandedState(action.payload);
        if (!state.nodeMap.has(updatedNode.id)) {
          console.error("Node not found in the store:", updatedNode.id);
          return state; // Return current state if node not found
        }
  
        // Get the old node to check for parentId changes
        const oldNode = state.nodeMap.get(updatedNode.id)!;
  
        // Create new maps (immutable update)
        const newNodeMap = new Map(state.nodeMap);
        const newNodeParentIdMapWithChildIdSet = new Map(
          state.nodeParentIdMapWithChildIdSet
        );
  
        // Update the node in the nodeMap
        newNodeMap.set(updatedNode.id, updatedNode);
  
        // Update parent-child relationships if the parentId has changed
        if (oldNode?.parentId !== updatedNode?.parentId) {
          // Remove from old parent's child set
          const oldParentId = oldNode?.parentId || "no-parent";
          const oldChildSet = newNodeParentIdMapWithChildIdSet.get(oldParentId);
          if (oldChildSet) {
            oldChildSet.delete(updatedNode.id);
          }
  
          // Add to new parent's child set
          const newParentId = updatedNode.parentId || "no-parent";
          if (!newNodeParentIdMapWithChildIdSet.has(newParentId)) {
            newNodeParentIdMapWithChildIdSet.set(newParentId, new Set());
          }
          newNodeParentIdMapWithChildIdSet.get(newParentId)!.add(updatedNode.id);
  
          // If the node itself became or ceased to be a parent, update its entry in the parent map
          const wasParent = isParentNodeType(oldNode);
          const isNowParent = isParentNodeType(updatedNode);
  
          if (wasParent && !isNowParent) {
            // Node is no longer a parent, remove its entry from the parent map
            newNodeParentIdMapWithChildIdSet.delete(updatedNode.id);
          } else if (!wasParent && isNowParent) {
            // Node is now a parent, ensure it has an entry (might be empty)
            if (!newNodeParentIdMapWithChildIdSet.has(updatedNode.id)) {
              newNodeParentIdMapWithChildIdSet.set(updatedNode.id, new Set());
            }
          }
        }
  
        // Update the nodes array by mapping or finding/replacing
        const newNodes = state.nodes.map(node =>
          node.id === updatedNode.id ? updatedNode : node
        );
  
        // Rebuild parent/child arrays based on the updated node map and parent map
        const newParentNodes = getOrganizedNodeParents(newNodeParentIdMapWithChildIdSet, newNodeMap);
        const newChildNodes = newNodes.filter(node =>
          !newParentNodes.some(parentNode => parentNode.id === node.id)
        );
  
  
        return {
          ...state,
          nodes: newNodes, // Update with the new nodes array
          nodeMap: newNodeMap,
          nodeParentIdMapWithChildIdSet: newNodeParentIdMapWithChildIdSet,
          parentNodes: newParentNodes,
          childNodes: newChildNodes,
        };
      }
  
      case "UPDATE_NODES": {
        const updatedNodes = action.payload.map(normalizeNodeExpandedState);
        // Create new maps (immutable update) starting from the current state
        const newNodeMap = new Map(state.nodeMap);
        const newNodeParentIdMapWithChildIdSet = new Map(
          state.nodeParentIdMapWithChildIdSet
        );
  
        let newNodes: Node<any>[] = [...state.nodes];
  
        updatedNodes.forEach((updatedNode) => {
          // If node doesn't exist, cannot update it
          if (!newNodeMap.has(updatedNode.id)) {
            console.error("Node not found in the store:", updatedNode.id);
            return; // Skip this node if not found
          }
  
          const oldNode = newNodeMap.get(updatedNode.id)!; // Get from potentially already updated map
  
          // Update the node in the nodeMap
          newNodeMap.set(updatedNode.id, updatedNode);
  
          // Update parent-child relationships if the parentId has changed
          if (oldNode?.parentId !== updatedNode?.parentId) {
            // Remove from old parent's child set
            const oldParentId = oldNode?.parentId || "no-parent";
            const oldChildSet = newNodeParentIdMapWithChildIdSet.get(oldParentId);
            if (oldChildSet) {
              oldChildSet.delete(updatedNode.id);
            }
  
            // Add to new parent's child set
            const newParentId = updatedNode.parentId || "no-parent";
            // Ensure the new parent exists in the map before adding a child to it
            // If a node is moved to a parent that doesn't exist, it becomes a top-level node (parentId: undefined)
            if (newParentId !== "no-parent" && !newNodeMap.has(newParentId)) {
              console.warn(`Parent node ${newParentId} not found for child ${updatedNode.id}. Setting child to top-level.`);
              updatedNode.parentId = undefined; // Correct the node being added/updated
              const noParentSet = newNodeParentIdMapWithChildIdSet.get("no-parent")!;
              noParentSet.add(updatedNode.id);
              // If it had an old parent, make sure it was removed above correctly
            } else {
              if (!newNodeParentIdMapWithChildIdSet.has(newParentId)) {
                newNodeParentIdMapWithChildIdSet.set(newParentId, new Set());
              }
              newNodeParentIdMapWithChildIdSet.get(newParentId)!.add(updatedNode.id);
            }
  
            // If the node itself became or ceased to be a parent, update its entry in the parent map
            const wasParent = isParentNodeType(oldNode);
            const isNowParent = isParentNodeType(updatedNode);
  
            if (wasParent && !isNowParent) {
              // Node is no longer a parent, remove its entry from the parent map
              newNodeParentIdMapWithChildIdSet.delete(updatedNode.id);
            } else if (!wasParent && isNowParent) {
              // Node is now a parent, ensure it has an entry (might be empty)
              if (!newNodeParentIdMapWithChildIdSet.has(updatedNode.id)) {
                newNodeParentIdMapWithChildIdSet.set(updatedNode.id, new Set());
              }
            }
  
          } // End of parentId change check
  
          // Update the node in the newNodes array
          newNodes = newNodes.map(node =>
            node.id === updatedNode.id ? updatedNode : node
          );
        });
  
        // Rebuild parent/child arrays based on the updated node map and parent map
        const newParentNodes = getOrganizedNodeParents(newNodeParentIdMapWithChildIdSet, newNodeMap);
        const newChildNodes = newNodes.filter(node =>
          !newParentNodes.some(parentNode => parentNode.id === node.id)
        );
  
  
        return {
          ...state,
          nodes: newNodes, // Update with the new nodes array
          nodeMap: newNodeMap,
          nodeParentIdMapWithChildIdSet: newNodeParentIdMapWithChildIdSet,
          parentNodes: newParentNodes,
          childNodes: newChildNodes,
        };
      }
  
  
      case "REHYDRATE": {
        // This action is only dispatched internally during initialization
        // The payload is the state loaded from storage
        // We need to re-build the maps as they are not stored directly
        const rehydratedNodes = action.payload.nodes.map(normalizeNodeExpandedState);
        const { nodeMap, nodeParentIdMapWithChildIdSet, pureChildIdSet } = rebuildMapState(rehydratedNodes);
  
        // Re-categorize parent and child nodes based on the re-built maps
      
        const parentNodes = getOrganizedNodeParents(nodeParentIdMapWithChildIdSet, nodeMap);
        const childNodes = getPureNodeChildren(pureChildIdSet, nodeMap);
  
  
        return {
          ...defaultInitialState, // Start with defaults, but override with rehydrated data
          nodes: [...parentNodes, ...childNodes], // Flatten the arrays
          nodeMap,
          nodeParentIdMapWithChildIdSet,
          pureChildIdSet, // Include the pure child ID set for future use
          parentNodes,
          childNodes,
        };
      }
  
      default:
        return state;
    }
  };