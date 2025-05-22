/** @format */
import { useCallback } from "react";
import { NodeChange, applyNodeChanges, Node } from "@xyflow/react";
import { NodeData } from "../../types";
import {useTrackableState } from "@jalez/react-state-history";
import { useNodeDrag } from "./useNodeDrag";

// Define a private implementation that accepts parameters
// This will be used by the provider, not exposed to components directly
export const useNodeHistoryStateImpl = (
  nodes: Node<NodeData>[],
  setNodes: (nodes: Node<NodeData>[]) => void,
  updateNode: (node: Node<NodeData>) => void,
  updateNodes: (nodes: Node<NodeData>[]) => void,
  removeNodes: (nodes: Node<NodeData>[]) => void,
  addNode: (node: Node<NodeData>) => void,
  nodeMap?: Map<string, Node<NodeData>>,
  nodeParentIdMapWithChildIdSet?: Map<string, Set<string>>
) => {

  const trackSetNodes = useTrackableState("useNodeState/SetNodes", setNodes);

  const trackUpdateNode = useTrackableState(
    "useNodeState/UpdateNode",
    updateNode,
    setNodes
  );

  const trackUpdateNodes = useTrackableState(
    "useNodeState/UpdateNodes",
    updateNodes,
    setNodes
  );

  const trackRemoveNodes = useTrackableState(
    "useNodeState/RemoveNode",
    removeNodes,
    setNodes
  );
  
  const trackAddNode = useTrackableState(
    "useNodeState/AddNode",
    addNode,
    removeNodes
  );

  // Create default maps if not provided to avoid circular dependency
  const nodeMapToUse = nodeMap || new Map();
  const parentMapToUse = nodeParentIdMapWithChildIdSet || new Map();

  const {
    isDragging,
    isDraggingRef,
    localNodes,
    setLocalNodes,
    onNodeDragStart,
    onNodeDragStop,
    onNodeDrag
  } = useNodeDrag(trackUpdateNodes, nodes, nodeMapToUse, parentMapToUse, updateNode);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      if (isDraggingRef.current) {
        setLocalNodes(prev =>
          applyNodeChanges(changes, prev.length > 0 ? prev : nodes) as Node<NodeData>[]
        );
      } else {
        // Only track significant changes in history
        // Skip position changes as they're too frequent and will be tracked by onNodeDragStop
        const hasNonPositionChanges = changes.some(change => 
          change.type !== 'position' && change.type !== 'remove'
        );
        
        if (hasNonPositionChanges) {
          const updatedNodes = applyNodeChanges(changes, nodes) as Node<NodeData>[];
          trackUpdateNodes(updatedNodes, nodes, "Update nodes on change");
        } else {
          // Apply changes without tracking in history
          const updatedNodes = applyNodeChanges(changes, nodes) as Node<NodeData>[];
          setNodes(updatedNodes);
        }
      }
    },
    [nodes, trackUpdateNodes, setNodes, isDraggingRef, setLocalNodes, localNodes]
  );

  const handleUpdateNodes = useCallback(
    (updatedNodes: Node<NodeData>[]) => {

      trackUpdateNodes(updatedNodes, nodes, "Update nodes on handleUpdateNodes");
    },
    [trackUpdateNodes, nodes]
  );

  const handleSetNodes = useCallback(
    (newNodes: Node<NodeData>[]) => {
      trackSetNodes(newNodes, nodes, "Set nodes");
    },
    [trackSetNodes, nodes]
  );

  const handleUpdateNode = useCallback(
    (updatedNode: Node<NodeData>) => {

      trackUpdateNode(updatedNode, nodes, "Update node");
    },
    [nodes, trackUpdateNode]
  );

  const onNodesDelete = useCallback(
    (nodesToRemove: Node<NodeData>[]) => {
      const deepCopyNodes = nodes.map(node => ({ ...node }));
      trackRemoveNodes(nodesToRemove, deepCopyNodes, "Delete nodes");
    },
    [trackRemoveNodes, nodes]
  );

  const handleNodeAdd = useCallback(
    (newNode: Node<NodeData>, oldValue: Node<NodeData>[], description?: string) => {
      trackAddNode(newNode, oldValue, description);
    },
    [trackAddNode, nodes]
  );

  return {
    localNodes,
    setNodes: handleSetNodes,
    updateNodes: handleUpdateNodes,
    updateNode: handleUpdateNode,
    addNode: handleNodeAdd,
    removeNodes: trackRemoveNodes,
    onNodesChange,
    onNodesDelete,
    onNodeDragStart,
    isDragging,
    onNodeDrag,
    onNodeDragStop,
  };
};
