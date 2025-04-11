/** @format */
import { useCallback, useState, useRef } from "react";
import { Node, useReactFlow } from "@xyflow/react";
import { NodeData } from "../../types";
import { useNodeStore } from "../../stores";
import { useTrackableState } from "@jalez/react-state-history";
import { getPotentialParent } from "./utils/getPotentialParents";

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

  const onNodeDragStart = useCallback(() => {
    setIsDragging(true);
    isDraggingRef.current = true;
    setLocalNodes(nodes);
  }, [nodes]);

  const onNodeDragStop = useCallback(() => {
    setIsDragging(false);
    isDraggingRef.current = false;

    if (currentParentCandidate) {
      const updatedNode = {
        ...currentParentCandidate,
        data: {
          ...currentParentCandidate.data,
          highlighted: false
        },
      } as Node<NodeData>;
      
      localNodes.forEach((localNode) => {
        if (localNode.id === updatedNode.id) {
          localNode.data.highlighted = false;
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
              updateNode(updatedNode);
              
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
          updateNode(updatedResult);
          
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