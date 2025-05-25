import { useCallback } from "react";
import { Node, Edge } from "@xyflow/react";
import { NodeData } from "../../types";
import { useNodeContext } from "../store/useNodeContext";
import { useEdgeContext } from "../../Edge/store/useEdgeContext";
import { useTransaction } from "@jalez/react-state-history";
import {
  isHorizontalConnection,
  findLRInvisibleParent,
  createInvisibleNodeForHorizontalConnection,
  calculateInvisibleNodePosition,
  getSiblingNodes,
  removeInvisibleNodeAndReparentChildren
} from "./utils/invisibleNodeUtils";

export const useInvisibleNodeOperations = () => {
  const { 
    addNode, 
    updateNode,
    removeNodes,
    nodeMap, 
    nodeParentIdMapWithChildIdSet 
  } = useNodeContext();
  
  const { edges } = useEdgeContext();
  const { withTransaction } = useTransaction();

  /**
   * Handle invisible node management when a new connection is created
   */
  const handleConnectionWithInvisibleNode = useCallback((
    edge: Edge,
    sourceNode: Node<NodeData>,
    targetNode: Node<NodeData>
  ) => {
    // Only process horizontal connections
    if (!isHorizontalConnection(edge.sourceHandle, edge.targetHandle)) {
      return { updatedNodes: [], newInvisibleNode: null, shouldRemoveNodes: [] };
    }

    const sourceLRParent = findLRInvisibleParent(sourceNode.id, nodeMap);
    const targetLRParent = findLRInvisibleParent(targetNode.id, nodeMap);

    let updatedNodes: Node<NodeData>[] = [];
    let newInvisibleNode: Node<NodeData> | null = null;
    let shouldRemoveNodes: string[] = [];

    // Case 1: Neither node has an LR invisible parent - create one
    if (!sourceLRParent && !targetLRParent) {
      const containerPosition = calculateInvisibleNodePosition([sourceNode, targetNode]);
      newInvisibleNode = createInvisibleNodeForHorizontalConnection(sourceNode, containerPosition);
      
      if (newInvisibleNode) {
        // Update both nodes to be children of the new container
        const updatedSourceNode = {
          ...sourceNode,
          parentId: newInvisibleNode.id,
          extent: "parent" as const
        };
        
        const updatedTargetNode = {
          ...targetNode,
          parentId: newInvisibleNode.id,
          extent: "parent" as const
        };
        
        updatedNodes = [updatedSourceNode, updatedTargetNode];
      }
    }
    
    // Case 2: One node has LR parent, other doesn't - add the other to existing container
    else if (sourceLRParent && !targetLRParent) {
      const updatedTargetNode = {
        ...targetNode,
        parentId: sourceLRParent.id,
        extent: "parent" as const
      };
      updatedNodes = [updatedTargetNode];
    }
    else if (!sourceLRParent && targetLRParent) {
      const updatedSourceNode = {
        ...sourceNode,
        parentId: targetLRParent.id,
        extent: "parent" as const
      };
      updatedNodes = [updatedSourceNode];
    }
    
    // Case 3: Both nodes have different LR parents - merge containers
    else if (sourceLRParent && targetLRParent && sourceLRParent.id !== targetLRParent.id) {
      // Move all children from target's parent to source's parent
      const targetParentChildren = removeInvisibleNodeAndReparentChildren(
        targetLRParent.id,
        sourceLRParent.id,
        nodeMap,
        nodeParentIdMapWithChildIdSet
      );
      
      updatedNodes = targetParentChildren;
      shouldRemoveNodes = [targetLRParent.id];
    }

    return { updatedNodes, newInvisibleNode, shouldRemoveNodes };
  }, [nodeMap, nodeParentIdMapWithChildIdSet]);

  /**
   * Process drag-to-create operation with invisible node management
   */
  const handleDragToCreateWithInvisibleNode = useCallback((
    newNode: Node<NodeData>,
    sourceNode: Node<NodeData>,
    edge: Edge
  ) => {
    if (!isHorizontalConnection(edge.sourceHandle, edge.targetHandle)) {
      return { updatedNodes: [newNode], newInvisibleNode: null };
    }

    const sourceLRParent = findLRInvisibleParent(sourceNode.id, nodeMap);
    let updatedNodes: Node<NodeData>[] = [];
    let newInvisibleNode: Node<NodeData> | null = null;

    // If source node has an LR parent, add new node to it
    if (sourceLRParent) {
      const updatedNewNode = {
        ...newNode,
        parentId: sourceLRParent.id,
        extent: "parent" as const
      };
      updatedNodes = [updatedNewNode];
    } 
    // Otherwise, create a new LR container for both nodes
    else {
      const containerPosition = calculateInvisibleNodePosition([sourceNode, newNode]);
      newInvisibleNode = createInvisibleNodeForHorizontalConnection(sourceNode, containerPosition);
      
      if (newInvisibleNode) {
        const updatedSourceNode = {
          ...sourceNode,
          parentId: newInvisibleNode.id,
          extent: "parent" as const
        };
        
        const updatedNewNode = {
          ...newNode,
          parentId: newInvisibleNode.id,
          extent: "parent" as const
        };
        
        updatedNodes = [updatedSourceNode, updatedNewNode];
      } else {
        updatedNodes = [newNode];
      }
    }

    return { updatedNodes, newInvisibleNode };
  }, [nodeMap]);

  /**
   * Check if an invisible node should be removed when connections are deleted
   */
  const handleConnectionRemovalCleanup = useCallback((
    removedEdge: Edge
  ) => {
    if (!isHorizontalConnection(removedEdge.sourceHandle, removedEdge.targetHandle)) {
      return { shouldRemoveNodes: [] };
    }

    const sourceNode = nodeMap.get(removedEdge.source);
    const targetNode = nodeMap.get(removedEdge.target);
    
    if (!sourceNode || !targetNode) {
      return { shouldRemoveNodes: [] };
    }

    const sourceLRParent = findLRInvisibleParent(sourceNode.id, nodeMap);
    
    if (!sourceLRParent) {
      return { shouldRemoveNodes: [] };
    }

    // Check if there are still horizontal connections between siblings
    const siblings = getSiblingNodes(sourceNode.id, nodeMap, nodeParentIdMapWithChildIdSet);
    const allSiblingIds = [sourceNode.id, targetNode.id, ...siblings.map((s: Node<NodeData>) => s.id)];
    
    const remainingHorizontalEdges = edges.filter((edge: Edge) => 
      edge.id !== removedEdge.id &&
      allSiblingIds.includes(edge.source) && 
      allSiblingIds.includes(edge.target) &&
      isHorizontalConnection(edge.sourceHandle, edge.targetHandle)
    );

    // If no horizontal connections remain, remove the invisible container
    if (remainingHorizontalEdges.length === 0) {
      return { shouldRemoveNodes: [sourceLRParent.id] };
    }

    return { shouldRemoveNodes: [] };
  }, [nodeMap, nodeParentIdMapWithChildIdSet, edges]);

  /**
   * Execute invisible node operations within a transaction
   */
  const executeInvisibleNodeOperation = useCallback((
    operation: () => {
      updatedNodes: Node<NodeData>[];
      newInvisibleNode: Node<NodeData> | null;
      shouldRemoveNodes?: string[];
    },
    description: string
  ) => {
    withTransaction(() => {
      const result = operation();
      
      // Add new invisible node if created
      if (result.newInvisibleNode) {
        addNode(result.newInvisibleNode);
      }
      
      // Update existing nodes
      result.updatedNodes.forEach(node => {
        updateNode(node);
      });
      
      // Remove nodes if needed
      if (result.shouldRemoveNodes && result.shouldRemoveNodes.length > 0) {
        // First reparent children
        const nodesToRemove: Node<NodeData>[] = [];
        result.shouldRemoveNodes.forEach(nodeId => {
          const nodeToRemove = nodeMap.get(nodeId);
          if (nodeToRemove) {
            // Reparent children before removing
            const children = removeInvisibleNodeAndReparentChildren(
              nodeId, 
              undefined, 
              nodeMap, 
              nodeParentIdMapWithChildIdSet
            );
            children.forEach((child: Node<NodeData>) => updateNode(child));
            nodesToRemove.push(nodeToRemove);
          }
        });
        
        // Then remove the invisible nodes
        if (nodesToRemove.length > 0) {
          removeNodes(nodesToRemove);
        }
      }
    }, description);
  }, [withTransaction, addNode, updateNode, removeNodes, nodeMap, nodeParentIdMapWithChildIdSet]);

  return {
    handleConnectionWithInvisibleNode,
    handleDragToCreateWithInvisibleNode,
    handleConnectionRemovalCleanup,
    executeInvisibleNodeOperation,
    isHorizontalConnection
  };
};