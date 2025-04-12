/** @format */
import { useCallback, useState, useRef } from "react";
import { Node, useReactFlow, useViewport } from "@xyflow/react"; 
import { NodeData } from "../../types";
import { useNodeStore } from "../../stores";
import { useTrackableState } from "@jalez/react-state-history";
import { getPotentialParent } from "./utils/getPotentialParents";
import { 
  hasInfiniteExtent,
  updateNodeExtentInLocalNodes
} from "./utils/dragUtils";
import { getDragResistance, dragStartTimes } from "./utils/getDragResistance";

/**
 * A custom hook for handling node dragging behavior in a mindmap.
 */
export const useNodeDrag = () => {
  const updateNode = useNodeStore((state) => state.updateNode);
  const updateNodes = useNodeStore((state) => state.updateNodes);
  const nodes = useNodeStore((state) => state.nodes);
  const setNodes = useNodeStore((state) => state.setNodes);
  const nodeMap = useNodeStore((state) => state.nodeMap);
  const nodeParentMap = useNodeStore((state) => state.nodeParentMap);

  const { getIntersectingNodes, getNode } = useReactFlow();
  const { x, y, zoom } = useViewport();

  const [isDragging, setIsDragging] = useState(false);
  const [localNodes, setLocalNodes] = useState<Node<NodeData>[]>([]);
  const [currentParentCandidate, setCurrentParentCandidate] = useState<Node | null>(null);
  const isDraggingRef = useRef(false);

  const trackUpdateNodes = useTrackableState(
    "useNodeDrag/UpdateNodes",
    updateNodes,
    setNodes
  );

  // Handle drag start
  const onNodeDragStart = useCallback((_: React.MouseEvent, node: Node<NodeData>) => {
    setIsDragging(true);
    isDraggingRef.current = true;
    setLocalNodes(nodes);
    
    // Root nodes can always be dragged freely
    if (!node.parentId) {
      const nodeInStore = nodeMap.get(node.id);
      if (nodeInStore && !hasInfiniteExtent(nodeInStore)) {
        // Update store node for persistence
        nodeInStore.extent = [[-Infinity, -Infinity], [Infinity, Infinity]];
        updateNode(nodeInStore);
        
        // Update local nodes for visual representation during drag
        setLocalNodes(prevNodes => 
          updateNodeExtentInLocalNodes(prevNodes, node.id, true)
        );
      }
    }
  }, [nodes, nodeMap, updateNode]);

  // Handle drag in progress
  const onNodeDrag = useCallback(
    (event: React.MouseEvent, node: Node<NodeData>, nodes: Node<NodeData>[]) => {
      // Skip processing for root nodes - they're already free to move
      if (!node.parentId) return;
      
      // Get parent node
      const parentNode = nodeMap.get(node.parentId);
      if (!parentNode) return;
      
      // Get mouse position from event and transform to flow coordinates
      const mousePosition = {
        x: (event.clientX - x) / zoom,
        y: (event.clientY - y) / zoom
      };
      
      // Get the actual current node position from React Flow
      const currentNodeState = getNode(node.id) as Node<NodeData> | null;
      const nodeWithUpdatedPosition = currentNodeState || node;
      
      // Check if node should break free using our simplified resistance logic
      const { shouldBreakFree } = getDragResistance(
        nodeWithUpdatedPosition, 
        mousePosition, 
        parentNode
      );
      
      if (shouldBreakFree) {
        const nodeInStore = nodeMap.get(node.id);
        const nodeInLocalNodes = localNodes.find(n => n.id === node.id);
        
        const isStoreNodeInfinite = hasInfiniteExtent(nodeInStore);
        const isLocalNodeInfinite = hasInfiniteExtent(nodeInLocalNodes);
        
        // Only update if not already infinite
        if (nodeInStore && !isStoreNodeInfinite) {
          if (process.env.NODE_ENV !== 'production') {
            console.log('Breaking free! Distance threshold exceeded for node:', node.id);
          }
          
          // Update store for persistence
          nodeInStore.extent = [[-Infinity, -Infinity], [Infinity, Infinity]];
          updateNode(nodeInStore);
          
          // Update local nodes for visual representation during drag
          if (!isLocalNodeInfinite) {
            setLocalNodes(prevNodes => 
              updateNodeExtentInLocalNodes(prevNodes, node.id, true)
            );
          }
        }
      }

      // Handle intersections and parent candidates
      const intersectingNodes = getIntersectingNodes(node);
      if (intersectingNodes.length > 0 && node.id) {
        const potentialParent = getPotentialParent(
          node,
          intersectingNodes,
          nodeParentMap,
          nodeMap
        );
        
        // Update highlighted state for parent candidates
        if (potentialParent && currentParentCandidate?.id !== potentialParent.id) {
          // Clear highlight from previous candidate
          if (currentParentCandidate) {
            const currentParent = nodeMap.get(currentParentCandidate.id);
            if (currentParent) {
              const updatedNode = {
                ...currentParent,
                data: {
                  ...currentParent.data,
                  highlighted: false
                },
              } as Node<NodeData>;
              
              if (isDraggingRef.current) {
                setLocalNodes(prev => 
                  prev.map(n => n.id === currentParent.id ? updatedNode : n)
                );
              }
            }
          }

          // Set highlight on new candidate
          const updatedResult = {
            ...potentialParent,
            data: {
              ...potentialParent.data,
              highlighted: true
            },
          } as Node<NodeData>;
          
          if (isDraggingRef.current) {
            setLocalNodes(prev => 
              prev.map(n => n.id === potentialParent.id ? updatedResult : n)
            );
          }

          setCurrentParentCandidate(potentialParent);
        }
      }
    },
    [getIntersectingNodes, nodeParentMap, nodeMap, currentParentCandidate, updateNode, localNodes, x, y, zoom, getNode]
  );

  // Handle drag end
  const onNodeDragStop = useCallback((_: React.MouseEvent, node: Node<NodeData>) => {
    setIsDragging(false);
    isDraggingRef.current = false;

    // Reset drag start time for this node
    if (node.id) {
      dragStartTimes.delete(node.id);
    }

    // Update parent relationship if there's a candidate
    if (currentParentCandidate) {
      localNodes.forEach((localNode) => {
        if (localNode.id === currentParentCandidate.id) {
          localNode.data.highlighted = false;
        }
        if (localNode.id === node.id) {
          localNode.parentId = currentParentCandidate.id;
          localNode.extent = "parent";
        }   
      });
      setCurrentParentCandidate(null);
    }

    // Commit changes to node state
    if (localNodes.length > 0) {
      trackUpdateNodes(localNodes, nodes);
      setLocalNodes([]);
    }
  }, [localNodes, trackUpdateNodes, nodes, currentParentCandidate]);

  return {
    isDragging,
    isDraggingRef,
    localNodes,
    setLocalNodes,
    onNodeDragStart,
    onNodeDragStop,
    onNodeDrag,
  };
};