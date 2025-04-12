/** @format */
import { useCallback, useState, useRef } from "react";
import { Node, useReactFlow } from "@xyflow/react";
import { NodeData } from "../../types";
import { useNodeStore } from "../../stores";
import { useTrackableState } from "@jalez/react-state-history";
import { getPotentialParent } from "./utils/getPotentialParents";

/**
 * A custom hook for handling node dragging behavior in a mindmap.
 * 
 * This hook manages:
 * - Node parenting: When a node is dragged over potential parent nodes
 * - Visual feedback: Highlights potential parent nodes during drag
 * - State tracking: Uses state history to track node position changes
 * - Extent management: Temporarily allows nodes to be dragged anywhere during drag
 * 
 * The hook integrates with:
 * - NodeStore: For persistent node state management
 * - ReactFlow: For node intersection detection
 * - StateHistory: For undo/redo functionality
 * 
 * @returns {Object} An object containing:
 *   - isDragging: Boolean indicating if a drag operation is in progress
 *   - isDraggingRef: Mutable ref tracking drag state for async operations
 *   - localNodes: Temporary node state during drag operations
 *   - setLocalNodes: Function to update temporary node state
 *   - onNodeDragStart: Callback for drag start - removes node extent constraints
 *   - onNodeDragStop: Callback for drag end - updates parent relationships
 *   - onNodeDrag: Callback during drag - handles parent candidate highlighting
 */
export const useNodeDrag = () => {
  const updateNode = useNodeStore((state) => state.updateNode);
  const updateNodes = useNodeStore((state) => state.updateNodes);
  const nodes = useNodeStore((state) => state.nodes);
  const setNodes = useNodeStore((state) => state.setNodes);
  const nodeMap = useNodeStore((state) => state.nodeMap);
  const nodeParentMap = useNodeStore((state) => state.nodeParentMap);

  const { getIntersectingNodes } = useReactFlow();

  const [isDragging, setIsDragging] = useState(false);
  const [localNodes, setLocalNodes] = useState<Node<NodeData>[]>([]);
  const [currentParentCandidate, setCurrentParentCandidate] = useState<Node | null>(null);
  const isDraggingRef = useRef(false);

  const trackUpdateNodes = useTrackableState(
    "useNodeDrag/UpdateNodes",
    updateNodes,
    setNodes
  );

  const onNodeDragStart = useCallback((_: React.MouseEvent, __: Node<NodeData>, draggedNodes: Node<NodeData>[]) => {
    setIsDragging(true);
    isDraggingRef.current = true;
    //Go through all the nodes and find the nodes that are currently being dragged and set their extend to [[-∞, -∞], [+∞, +∞]]
    draggedNodes.forEach((node) => {
        const nodeInStore = nodeMap.get(node.id);
        if (nodeInStore) {
          nodeInStore.extent = [[-Infinity, -Infinity], [Infinity, Infinity]];
        }
    }
    );
        
    setLocalNodes(nodes);
  }, [nodes, nodeMap]);

  const onNodeDragStop = useCallback((_: React.MouseEvent, node: Node<NodeData>) => {
    setIsDragging(false);
    isDraggingRef.current = false;

    if (currentParentCandidate) {
    
      localNodes.forEach((localNode) => {
        if (localNode.id === currentParentCandidate.id) {
          localNode.data.highlighted = false;
        }
        if(localNode.id === node.id) {
            console.log("Planning on Setting ", currentParentCandidate.id, " as parentId for node:", localNode.id);
            console.log("localNodes:", localNode);
            //This currently causes an eternal loop somewhere
          localNode.parentId = currentParentCandidate.id;
          localNode.extent = "parent"
        }   
      });
      setCurrentParentCandidate(null);
    }

    if (localNodes.length > 0) {
      trackUpdateNodes(localNodes, nodes);
      setLocalNodes([]);
    }
  }, [localNodes, trackUpdateNodes, nodes, currentParentCandidate]);

  const onNodeDrag = useCallback(
    (_: React.MouseEvent, node: Node<NodeData>) => {
      const intersectingNodes = getIntersectingNodes(node);
 
      if (intersectingNodes.length > 0 && node.id) {
        console.log("nodeParentMap", nodeParentMap);
        const result = getPotentialParent(
          node,
          intersectingNodes,
          nodeParentMap,
          nodeMap
        );
        
        if(result && currentParentCandidate?.id !== result.id) {
          if(currentParentCandidate) {
            const currentParent = nodeMap.get(currentParentCandidate.id);
            if(currentParent) {
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

          const updatedResult = {
            ...result,
            data: {
              ...result.data,
              highlighted: true
            },
          } as Node<NodeData>;
          
          if (isDraggingRef.current) {
            setLocalNodes(prev => 
              prev.map(n => n.id === result.id ? updatedResult : n)
            );
          }

          setCurrentParentCandidate(result);
        }
      }
    },
    [getIntersectingNodes, nodeParentMap, nodeMap, currentParentCandidate, updateNode]
  );

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