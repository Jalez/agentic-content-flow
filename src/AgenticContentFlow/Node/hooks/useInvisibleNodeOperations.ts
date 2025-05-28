import { useCallback } from "react";
import { Node, Edge } from "@xyflow/react";
import { NodeData } from "../../types";
import { useNodeContext } from "../store/useNodeContext";
import { useEdgeContext } from "../../Edge/store/useEdgeContext";
import { useTransaction } from "@jalez/react-state-history";
import {
  removeInvisibleNodeAndReparentChildren
} from "./utils/invisibleNodeUtils";
import { isHorizontalConnection } from "./utils/dragUtils";
import { calculateInitialContainerNodePosition, getNodeParentIfType, getSiblingNodes } from "./utils/nodeUtils";
import { createNodeFromTemplate } from "../registry/nodeTypeRegistry";

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

    const sourceParent = getNodeParentIfType(sourceNode.id, nodeMap, "invisiblenode")
    const targetParent = getNodeParentIfType(targetNode.id, nodeMap, "invisiblenode");

    let updatedNodes: Node<NodeData>[] = [];
    let newInvisibleNode: Node<NodeData> | undefined = undefined;
    let shouldRemoveNodes: string[] = [];

    // Case 1: Neither node has an invisible parent - create one
    if (!sourceParent && !targetParent) {
      const containerPosition = calculateInitialContainerNodePosition([sourceNode, targetNode]);
      newInvisibleNode = createNodeFromTemplate("invisiblenode", {
        id: `invisible-${Date.now()}`,
        position: containerPosition,

      });

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
    else if (sourceParent && !targetParent) {
      const updatedTargetNode = {
        ...targetNode,
        parentId: sourceParent.id,
        extent: "parent" as const
      };
      updatedNodes = [updatedTargetNode];
    }
    else if (!sourceParent && targetParent) {
      const updatedSourceNode = {
        ...sourceNode,
        parentId: targetParent.id,
        extent: "parent" as const
      };
      updatedNodes = [updatedSourceNode];
    }

    // Case 3: Both nodes have different LR parents - merge containers
    else if (sourceParent && targetParent && sourceParent.id !== targetParent.id) {
      // Move all children from target's parent to source's parent
      const targetParentChildren = removeInvisibleNodeAndReparentChildren(
        targetParent.id,
        sourceParent.id,
        nodeMap,
        nodeParentIdMapWithChildIdSet
      );

      updatedNodes = targetParentChildren;
      shouldRemoveNodes = [targetParent.id];
    }

    return { updatedNodes, newInvisibleNode, shouldRemoveNodes };
  }, [nodeMap, nodeParentIdMapWithChildIdSet]);

  /**
   * Process drag-to-create operation with invisible node management
   */


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

    const sourceLRParent = getNodeParentIfType(sourceNode.id, nodeMap, "invisiblenode");

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
    handleConnectionRemovalCleanup,
    executeInvisibleNodeOperation,
    isHorizontalConnection
  };
};