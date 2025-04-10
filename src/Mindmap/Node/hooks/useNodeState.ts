/** @format */
import { useCallback, useState, useRef, useMemo } from "react";
import { NodeChange, applyNodeChanges, Node } from "@xyflow/react";
import { NodeData } from "../../types";
import { useNodeStore } from "../../stores";
import { useTrackableState } from "@jalez/react-state-history";

export const useNodeState = () => {
  const nodes = useNodeStore((state) => state.nodes);
  const setNodes = useNodeStore((state) => state.setNodes);
  const updateNode = useNodeStore((state) => state.updateNode);
  const updateNodes = useNodeStore((state) => state.updateNodes);
  const nodeMap = useNodeStore((state) => state.nodeMap);
  const nodeParentMap = useNodeStore((state) => state.nodeParentMap);
  const expandedNodes = useNodeStore((state) => state.expandedNodes);
  const toggleNodeExpansion = useNodeStore(
    (state) => state.toggleNodeExpansion
  );

  const [isDragging, setIsDragging] = useState(false);

  // Local state for tracking node positions during drag
  const [localNodes, setLocalNodes] = useState<Node<NodeData>[]>([]);
  const isDraggingRef = useRef(false);

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


  const trackSetNodes = useTrackableState("useNodeState/SetNodes", setNodes);

  // Function to check if a node should be hidden based on its ancestors' collapsed state
  const shouldNodeBeHidden = useCallback(
    (nodeId: string, checkedNodes = new Set<string>()): boolean => {
      // Prevent infinite recursion
      if (checkedNodes.has(nodeId)) return false;
      checkedNodes.add(nodeId);

      // Get the node's data
      const node = nodeMap.get(nodeId);
      if (!node) return false;

      // If the node has no parent, it's always visible
      if (!node.parentId) return false;

      // If the parent is collapsed, this node should be hidden
      if (expandedNodes[node.parentId] === false) return true;

      // Check if any ancestor is collapsed
      return shouldNodeBeHidden(node.parentId, checkedNodes);
    },
    [nodeMap, expandedNodes]
  );

  // Apply hidden property to nodes based on their parents' collapse state
  const applyCollapsedState = useCallback(
    (nodesToProcess: Node<NodeData>[]): Node<NodeData>[] => {
      return nodesToProcess.map((node) => {
        const hidden = shouldNodeBeHidden(node.id);
        return {
          ...node,
          hidden
        };
      });
    },
    [shouldNodeBeHidden]
  );

  // Create a filtered parent-child map that only includes visible children
  const getVisibleNodeParentMap = useCallback(() => {
    const visibleNodeParentMap = new Map<string, Node<any>[]>();
    
    // Initialize with "no-parent" key
    visibleNodeParentMap.set("no-parent", []);
    
    // Iterate through the original parent-child map
    nodeParentMap.forEach((children, parentId) => {
      // Filter out hidden children
      const visibleChildren = children.filter(child => !shouldNodeBeHidden(child.id));
      
      // Only add entries with visible children
      if (visibleChildren.length > 0) {
        visibleNodeParentMap.set(parentId, visibleChildren);
      } else if (parentId === "no-parent") {
        // Ensure "no-parent" category always exists even if empty
        visibleNodeParentMap.set(parentId, []);
      }
    });

    console.log("Visible Node Parent Map:", visibleNodeParentMap);
    
    return visibleNodeParentMap;
  }, [nodeParentMap, shouldNodeBeHidden]);

  const getVisibleNodeMap = useCallback(() => {
    const visibleNodeMap = new Map<string, Node<any>>();
    nodes.forEach((node) => {
      // Check if the node is visible
      if (!shouldNodeBeHidden(node.id)) {
        visibleNodeMap.set(node.id, node);
      }
    }
    );
    return visibleNodeMap;
  }
  , [nodes]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // return;
      if (
        changes.some((change) => change.type === "position") &&
        isDraggingRef.current
      ) {
        // During dragging, only update the local nodes state without touching the store
        setLocalNodes(
          (prev) =>
            applyNodeChanges(
              changes,
              prev.length > 0 ? prev : nodes
            ) as Node<NodeData>[]
        );
      } else if (!isDraggingRef.current) {
        // For non-dragging changes, update the store normally
        const updatedNodes = applyNodeChanges(
          changes,
          nodes
        ) as Node<NodeData>[];

        // Remove console.log for better performance
        trackUpdateNodes(updatedNodes, nodes);
      }
    },
    [nodes, trackUpdateNodes, setLocalNodes]
  );

  const handleUpdateNodes = useCallback(
    (updatedNodes: Node[]) => {
      console.log("Updating nodes:", updatedNodes);
      trackUpdateNodes(updatedNodes, nodes);
    },
    [trackUpdateNodes, nodes]
  );
  
  const onNodeDragStart = useCallback(() => {
    setIsDragging(true);
    isDraggingRef.current = true;
    // Initialize local nodes state with current nodes when drag starts
    setLocalNodes(nodes);
  }, [nodes]);

  const onNodeDragStop = useCallback(() => {
    setIsDragging(false);
    isDraggingRef.current = false;

    // Only update the store when dragging is complete
    if (localNodes.length > 0) {
      trackUpdateNodes(localNodes, nodes);
      // Clear local nodes to avoid stale state
      setLocalNodes([]);
    }
  }, [localNodes, trackUpdateNodes, nodes]);

  const handleNodeEdit = useCallback(
    (nodeId: string, label: string, details: string) => {
      const updatedNodes = nodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                label,
                details,
              },
            }
          : node
      );
      trackUpdateNodes(updatedNodes, nodes);
    },
    [nodes, trackUpdateNodes]
  );

  const getVisibleNodes = useCallback(() => {
    // Return local nodes during drag, otherwise return store nodes
    const nodesToProcess = isDraggingRef.current && localNodes.length > 0 ? localNodes : nodes;
    return applyCollapsedState(nodesToProcess);
  }, [nodes, localNodes, applyCollapsedState]);

  // Memoize the displayed nodes to prevent unnecessary recalculations
  const displayedNodes = useMemo(() => getVisibleNodes(), [getVisibleNodes, expandedNodes, nodes]);
  
  // Memoize the visible parent-child map to prevent unnecessary recalculations
  const visibleNodeParentMap = useMemo(() => getVisibleNodeParentMap(), [getVisibleNodeParentMap, expandedNodes, nodes]);

  // Memoize the visible node map to prevent unnecessary recalculations
  const visibleNodeMap = useMemo(() => getVisibleNodeMap(), [getVisibleNodeMap, expandedNodes, nodes]);


  const handleSetNodes = useCallback(
    (newNodes: Node<NodeData>[]) => {
      // Update the local state and store
      trackSetNodes(newNodes, nodes);
    },
    [trackSetNodes, nodes]
  );

  


  const handleUpdateNode = useCallback(
    (updatedNode: Node) => {
      console.log("Updating node:", updatedNode);
      trackUpdateNode(updatedNode, nodes);
    },
    [nodes, trackUpdateNodes]
  );
  
  return {
    displayedNodes,
    nodes: displayedNodes, // Return the same memoized value
    nodeMap,
    nodeParentMap,
    expandedNodes,
    toggleNodeExpansion,
    visibleNodeMap, // New filtered map for layout calculations
    visibleNodeParentMap, // New filtered map for layout calculations
    setNodes: handleSetNodes,
    updateNodes: trackUpdateNodes,
    updateNode: handleUpdateNode,
    handleUpdateNodes,
    onNodesChange,
    handleNodeEdit,
    getVisibleNodes,
    isDragging,
    onNodeDragStop,
    onNodeDragStart,
  };
};
