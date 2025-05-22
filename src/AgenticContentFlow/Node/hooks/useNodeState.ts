/** @format */
import { useCallback, useState } from "react";
import { NodeChange, applyNodeChanges, Node } from "@xyflow/react";
import { NodeData } from "../../types";
import { useTrackableState } from "@jalez/react-state-history";
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
  const [lastExecutedAction, setLastExecutedAction] = useState<string | null>(null);

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
    setNodes
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
        console.log("onNodesChange", changes);
        // Only track significant changes in history
        // Skip position changes as they're too frequent and will be tracked by onNodeDragStop
        const hasNonPositionChanges = changes.some(change =>
          change.type !== 'position' && change.type !== 'remove' && change.type !== 'add'
        );

        if (hasNonPositionChanges && lastExecutedAction !== "removeNodes" && lastExecutedAction !== "handleNodeAdd") {
          const updatedNodes = applyNodeChanges(changes, nodes) as Node<NodeData>[];
          trackUpdateNodes(updatedNodes, nodes, "Update nodes on change");
          setLastExecutedAction("onNodesChange");
        } else {
          const updatedNodes = applyNodeChanges(changes, nodes) as Node<NodeData>[];
          updateNodes(updatedNodes);
        }
      }
    },
    [nodes, trackUpdateNodes, setNodes, isDraggingRef, setLocalNodes, localNodes, lastExecutedAction]
  );

  const handleUpdateNodes = useCallback(
    (updatedNodes: Node<NodeData>[]) => {
      console.log("handleUpdateNodes", updatedNodes);
      if (lastExecutedAction === "removeNodes" || lastExecutedAction === "handleNodeAdd") {
        
        updateNodes(updatedNodes);
      } else {
        trackUpdateNodes(updatedNodes, nodes, "Update nodes on handleUpdateNodes");
        setLastExecutedAction("handleUpdateNodes");
      }
    },
    [trackUpdateNodes, nodes, setLastExecutedAction, lastExecutedAction, updateNodes]
  );

  const handleSetNodes = useCallback(
    (newNodes: Node<NodeData>[]) => {
      console.log("handleSetNodes", newNodes);
      trackSetNodes(newNodes, nodes, "Set nodes");
      setLastExecutedAction("handleSetNodes");
    },
    [trackSetNodes, nodes, setLastExecutedAction]
  );

  const handleUpdateNode = useCallback(
    (updatedNode: Node<NodeData>) => {
console.log("handleUpdateNode", updatedNode);
      trackUpdateNode(updatedNode, nodes, "Update node");
      setLastExecutedAction("handleUpdateNode");
    },
    [nodes, trackUpdateNode, setLastExecutedAction]
  );

  const handleRemoveNodes = useCallback(
    (nodesToRemove: Node<NodeData>[]) => {
      console.log("handleRemoveNodes", nodesToRemove);
      const deepCopyNodes = nodes.map(node => ({ ...node }));
      trackRemoveNodes(nodesToRemove, deepCopyNodes, "Delete nodes");
      setLastExecutedAction("removeNodes");
    },
    [trackRemoveNodes, nodes, setLastExecutedAction]
  );

  const handleNodeAdd = useCallback(
    (newNode: Node<NodeData>) => {
      console.log("handleNodeAdd", newNode);
      trackAddNode(newNode, nodes, "Add node");
      setLastExecutedAction("handleNodeAdd");
    },
    [trackAddNode, nodes, setLastExecutedAction]
  );

  return {
    localNodes,
    setNodes: handleSetNodes,
    updateNodes: handleUpdateNodes,
    updateNode: handleUpdateNode,
    addNode: handleNodeAdd,
    removeNodes: handleRemoveNodes,
    onNodesChange,
    onNodeDragStart,
    isDragging,
    onNodeDrag,
    onNodeDragStop,
  };
};
