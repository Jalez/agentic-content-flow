/** @format */
import { useCallback, useState } from "react";
import { NodeChange, applyNodeChanges, Node } from "@xyflow/react";
import { NodeData } from "../../types";
import { useTrackableState } from "@jalez/react-state-history";
import { useNodeDrag } from "./useNodeDrag";
import { withErrorHandler } from "../../utils/withErrorHandler";

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
    "useNodeState/RemoveNodes",
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
    withErrorHandler("onNodesChange", (changes: NodeChange[]) => {
      if (isDraggingRef.current) {
        setLocalNodes(prev =>
          applyNodeChanges(changes, prev.length > 0 ? prev : nodes) as Node<NodeData>[]
        );
      } else {
        // Only track significant changes in history
        // Skip position changes as they're too frequent and will be tracked by onNodeDragStop
        // const hasNonPositionChanges = changes.some(change =>
        //   change.type !== 'position' && change.type !== 'remove' && change.type !== 'add'
        // );
        
        // if (hasNonPositionChanges && lastExecutedAction !== "onNodeRemove" && lastExecutedAction !== "onNodeAdd" && lastExecutedAction !== "handleUpdateNodes") {
        //   const updatedNodes = applyNodeChanges(changes, nodes) as Node<NodeData>[];
        //   // Create a deep copy of the nodes to avoid mutating the original state
        //   const deepCopyNodes = nodes.map(node => ({ ...node }));
        //   trackUpdateNodes(updatedNodes, deepCopyNodes, "Update nodes on change");
        //   setLastExecutedAction("onNodesChange");
        // } else {
        // }
        const updatedNodes = applyNodeChanges(changes, nodes) as Node<NodeData>[];
        updateNodes(updatedNodes);
      }
    }),
    [nodes, trackUpdateNodes, setNodes, isDraggingRef, setLocalNodes, localNodes, lastExecutedAction]
  );

  const handleUpdateNodes = useCallback(
    withErrorHandler("handleUpdateNodes", (updatedNodes: Node<NodeData>[], isClick = true) => {
      if (!isClick) {
        updateNodes(updatedNodes);
        return;
      }
      const deepCopyNodes = JSON.parse(JSON.stringify(nodes)); // Create a deep copy of the nodes
      trackUpdateNodes(updatedNodes, deepCopyNodes, "Update nodes on handleUpdateNodes");
      setLastExecutedAction("handleUpdateNodes");
    }),
    [trackUpdateNodes, nodes, setLastExecutedAction, lastExecutedAction, updateNodes]
  );

  const handleSetNodes = useCallback(
    withErrorHandler("handleSetNodes", (newNodes: Node<NodeData>[], isClick = true) => {
      if (!isClick) {
        setLocalNodes(newNodes);
        return;
      }
      trackSetNodes(newNodes, nodes, "Set nodes");
      setLastExecutedAction("handleSetNodes");
    }),
    [trackSetNodes, nodes, setLastExecutedAction]
  );

  const handleUpdateNode = useCallback(
    withErrorHandler("handleUpdateNode", (updatedNode: Node<NodeData>, isClick = true) => {
      if (!isClick) {
        updateNode(updatedNode);
        return;
      }
      const deepCopyNodes = JSON.parse(JSON.stringify(nodes)); // Create a deep copy of the nodes
      trackUpdateNode(updatedNode, deepCopyNodes, "Update node");
      setLastExecutedAction("handleUpdateNode");

    }),
    [nodes, trackUpdateNode, setLastExecutedAction]
  );

  const onNodeRemove = useCallback(
    withErrorHandler("onNodeRemove", (nodesToRemove: Node<NodeData>[], isClick = true) => {
      if (!isClick) {
        removeNodes(nodesToRemove);
        return;
      }
      const deepCopyNodes = nodes.map(node => ({ ...node }));
      trackRemoveNodes(nodesToRemove, deepCopyNodes, "Delete nodes");
      setLastExecutedAction("onNodeRemove");
    }),
    [trackRemoveNodes, nodes, setLastExecutedAction, removeNodes]
  );

  const onNodeAdd = useCallback(
    withErrorHandler("onNodeAdd", (newNode: Node<NodeData>, isClick = true) => {
      if (!isClick) {
        addNode(newNode);
        return;
      }
      else {
        trackAddNode(newNode, nodes, "Add node");
        setLastExecutedAction("onNodeAdd");
      }
    }),
    [trackAddNode, nodes, setLastExecutedAction]
  );

  return {
    localNodes,
    setNodes: handleSetNodes,
    updateNodes: handleUpdateNodes,
    updateNode: handleUpdateNode,
    addNode: onNodeAdd,
    removeNodes: onNodeRemove,
    onNodesChange,
    onNodeDragStart,
    isDragging,
    onNodeDrag,
    onNodeDragStop,
  };
};
