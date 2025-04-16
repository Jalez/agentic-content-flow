/** @format */
import { useCallback, useMemo } from "react";
import { NodeChange, applyNodeChanges, Node } from "@xyflow/react";
import { NodeData } from "../../types";
import { useNodeStore } from "../../stores";
import { useTrackableState } from "@jalez/react-state-history";
import { useNodeDrag } from "./useNodeDrag";

export const useNodeState = () => {
  const nodes = useNodeStore((state) => state.nodes);
  const setNodes = useNodeStore((state) => state.setNodes);
  const updateNode = useNodeStore((state) => state.updateNode);
  const updateNodes = useNodeStore((state) => state.updateNodes);
  const nodeMap = useNodeStore((state) => state.nodeMap);
  const nodeParentMap = useNodeStore((state) => state.nodeParentMap);
  const expandedNodes = useNodeStore((state) => state.expandedNodes);
  const toggleNodeExpansion = useNodeStore((state) => state.toggleNodeExpansion);
  
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
  const {
    isDragging,
    isDraggingRef,
    localNodes,
    setLocalNodes,
    onNodeDragStart,
    onNodeDragStop,
    onNodeDrag
  } = useNodeDrag(trackUpdateNodes);



  // Function to check if a node should be hidden based on its ancestors' collapsed state
  const shouldNodeBeHidden = useCallback(
    (nodeId: string, checkedNodes = new Set<string>()): boolean => {
      // Prevent infinite recursion
      if (checkedNodes.has(nodeId)) return false;
      checkedNodes.add(nodeId);

      const node = nodeMap.get(nodeId);
      if (!node) return false;
      if (!node.parentId) return false;
      if (expandedNodes[node.parentId] === false) return true;
      return shouldNodeBeHidden(node.parentId, checkedNodes);
    },
    [nodeMap, expandedNodes]
  );

  // Apply hidden property to nodes based on their parents' collapse state
  const applyCollapsedState = useCallback(
    (nodesToProcess: Node<NodeData>[]): Node<NodeData>[] => {
      return nodesToProcess.map((node) => ({
        ...node,
        hidden: shouldNodeBeHidden(node.id)
      }));
    },
    [shouldNodeBeHidden]
  );

  // Create a filtered parent-child map that only includes visible children
  const getVisibleNodeParentMap = useCallback(() => {
    const visibleNodeParentMap = new Map<string, Node<any>[]>();
    visibleNodeParentMap.set("no-parent", []);

    nodeParentMap.forEach((children, parentId) => {
      const visibleChildren = children.filter(child => !shouldNodeBeHidden(child.id));
      if (visibleChildren.length > 0 || parentId === "no-parent") {
        visibleNodeParentMap.set(parentId, visibleChildren);
      }
    });

    return visibleNodeParentMap;
  }, [nodeParentMap, shouldNodeBeHidden]);

  const getVisibleNodeMap = useCallback(() => {
    const visibleNodeMap = new Map<string, Node<any>>();
    nodes.forEach((node) => {
      if (!shouldNodeBeHidden(node.id)) {
        visibleNodeMap.set(node.id, node);
      }
    });
    return visibleNodeMap;
  }, [nodes, shouldNodeBeHidden]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      console.log("onNodesChange - isDraggingRef:", isDraggingRef.current);
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
      console.log("handleUpdateNodes - updatedNodes:", updatedNodes);
      trackUpdateNodes(updatedNodes, nodes);
    },
    [trackUpdateNodes, nodes]
  );



  const getVisibleNodes = useCallback(() => {
    console.log("getVisibleNodes called");
    const nodesToProcess = (isDraggingRef.current || localNodes.length > 0)
      ? localNodes
      : nodes;
    return applyCollapsedState(nodesToProcess);
  }, [nodes, localNodes, applyCollapsedState, isDraggingRef])



  // Memoize the displayed nodes to prevent unnecessary recalculations
  const displayedNodes = useMemo(() => getVisibleNodes(), [getVisibleNodes, expandedNodes, nodes, localNodes, isDraggingRef]);
  const visibleNodeParentMap = useMemo(() => getVisibleNodeParentMap(), [getVisibleNodeParentMap, expandedNodes, nodes]);
  const visibleNodeMap = useMemo(() => getVisibleNodeMap(), [getVisibleNodeMap, expandedNodes, nodes]);

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

  return {
    displayedNodes,
    nodeMap,
    onNodeDrag,
    nodeParentMap,
    expandedNodes,
    toggleNodeExpansion,
    visibleNodeMap,
    visibleNodeParentMap,
    setNodes: handleSetNodes,
    updateNodes: trackUpdateNodes,
    updateNode: handleUpdateNode,
    handleUpdateNodes,
    onNodesChange,
    getVisibleNodes,
    isDragging,
    onNodeDragStop,
    onNodeDragStart,
  };
};
