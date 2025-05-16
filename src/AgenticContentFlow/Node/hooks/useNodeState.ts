/** @format */
import { useCallback } from "react";
import { NodeChange, applyNodeChanges, Node } from "@xyflow/react";
import { NodeData } from "../../types";
import { useTrackableState } from "@jalez/react-state-history";
import { useNodeDrag } from "./useNodeDrag";
import { useNodeContext } from "../store/useNodeContext";

export const useNodeHistoryState = () => {
  const { nodes, setNodes, updateNode, updateNodes, removeNodes } = useNodeContext();
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

  const {
    isDragging,
    isDraggingRef,
    localNodes,
    setLocalNodes,
    onNodeDragStart,
    onNodeDragStop,
    onNodeDrag
  } = useNodeDrag(trackUpdateNodes);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      if (isDraggingRef.current) {
        setLocalNodes(prev =>
          applyNodeChanges(changes, prev.length > 0 ? prev : nodes) as Node<NodeData>[]
        );
      } else {
        const updatedNodes = applyNodeChanges(changes, nodes) as Node<NodeData>[];
        trackUpdateNodes(updatedNodes, nodes);
      }
    },
    [nodes, trackUpdateNodes, setLocalNodes, isDraggingRef, localNodes]
  );

  const handleUpdateNodes = useCallback(
    (updatedNodes: Node[]) => {
      trackUpdateNodes(updatedNodes, nodes);
    },
    [trackUpdateNodes, nodes]
  );

  const handleSetNodes = useCallback(
    (newNodes: Node<NodeData>[]) => {
      trackSetNodes(newNodes, nodes);
    },
    [trackSetNodes, nodes]
  );

  const handleUpdateNode = useCallback(
    (updatedNode: Node) => {
      trackUpdateNode(updatedNode, nodes);
    },
    [nodes, trackUpdateNode]
  );


  const onNodesDelete = useCallback(
    (nodesToRemove: Node<NodeData>[]) => {
      // Handle node deletion
      trackRemoveNodes(nodesToRemove, nodes);
      
    },
    [ trackRemoveNodes, nodes]
  );

  return {
    localNodes,
    setNodes: handleSetNodes,
    updateNodes: handleUpdateNodes,
    updateNode: handleUpdateNode,
    onNodesChange,
    onNodesDelete,
    onNodeDragStart,
    isDragging,
    onNodeDrag,
    onNodeDragStop,
  };
};
