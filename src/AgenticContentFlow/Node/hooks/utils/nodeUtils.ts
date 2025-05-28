import { NodeData } from "@/AgenticContentFlow/types";
import { Edge, Node } from "@xyflow/react";
import { createNodeFromTemplate } from "../../registry/nodeTypeRegistry";
import { isHorizontalConnection } from "./dragUtils";

/**
 * @description
 * Get the node's parent if it has a parent of a specific type
 * @param nodeId - ID of the node to check
 * @param nodeMap - Map of all nodes
 * @param type - Type of parent node to check for
 * @returns The parent node if it exists and matches the type, otherwise null
 */
export const getNodeParentIfType = (
    nodeId: string,
    nodeMap: Map<string, Node<NodeData>>,
    type: string
): Node<NodeData> | null => {
    const node = nodeMap.get(nodeId);
    if (!node?.parentId) return null;

    const parent = nodeMap.get(node.parentId);
    if (!parent) return null;

    if (parent.type === type) {
        return parent;
    }
    return null;
};

/**
 * @description
 * Get all sibling nodes of a given node
 * @param nodeId - ID of the node whose siblings to find
 * @param nodeMap - Map of all nodes
 * @param nodeParentIdMapWithChildIdSet - Map of parent IDs to sets of child IDs
 * @returns An array of sibling nodes, excluding the node itself
 * @remarks
 * This function retrieves all nodes that share the same parent as the specified node,
 * excluding the node itself. It uses a Map to efficiently find siblings based on parent-child relationships.
 */
export const getSiblingNodes = (
    nodeId: string,
    nodeMap: Map<string, Node<NodeData>>,
    nodeParentIdMapWithChildIdSet: Map<string, Set<string>>
): Node<NodeData>[] => {
    const node = nodeMap.get(nodeId);
    if (!node?.parentId) return [];

    const siblingIds = nodeParentIdMapWithChildIdSet.get(node.parentId) || new Set();
    return Array.from(siblingIds)
        .filter(id => id !== nodeId)
        .map(id => nodeMap.get(id))
        .filter((n): n is Node<NodeData> => !!n);
};

/**
    * @description  
    * Calculate the initial position of a container node that encompasses all given nodes
    * @param nodes - Array of nodes to encompass
    * @returns An object with x and y coordinates for the container node's position
    * @remarks
    * This function calculates the top-left corner position of a container node that should
    * encompass all provided nodes, with a padding of 50 pixels on each side.
 */
export const calculateInitialContainerNodePosition = (
    nodes: Node<NodeData>[]
): { x: number; y: number } => {
    if (nodes.length === 0) return { x: 0, y: 0 };

    // Calculate bounding box of all nodes
    const minX = Math.min(...nodes.map(n => n.position.x));
    const minY = Math.min(...nodes.map(n => n.position.y));

    // Position container to encompass all nodes with some padding
    return {
        x: minX - 50,
        y: minY - 50
    };
};

export const handleContainerization = (
    toNode: Node<NodeData>,
    fromNode: Node<NodeData>,
    edge: Edge,
    nodeMap: Map<string, Node<NodeData>>,
    nodeParentIdMapWithChildIdSet: Map<string, Set<string>>
) => {
    let containerToRemove: Node<NodeData> | undefined = undefined;
    let containerToAdd: Node<NodeData> | undefined = undefined;
    let updatedToNodeSiblings: Node<NodeData>[] = [];
    let updatedToNode: Node<NodeData> | undefined = undefined;
    let updatedFromNode: Node<NodeData> | undefined = undefined;

    if (!isHorizontalConnection(edge.sourceHandle, edge.targetHandle)) {
        const parentNode = nodeMap.get(fromNode.parentId || "");
        if (parentNode && parentNode.type !== 'invisiblenode') {
            updatedToNode = {
                ...toNode,
                parentId: fromNode.parentId,
                extent: "parent" as const
            };
        }
        else if (parentNode) {
            updatedToNode = {
                ...toNode,
                parentId: parentNode.parentId,
                extent: "parent" as const
            };
        }
        return { updatedToNode, updatedFromNode, containerToAdd: null, containerToRemove: undefined, updatedToNodeSiblings: [] };
    }

    //First, check if the toNode has a parent of type "invisiblenode"
    const toNodeParent = getNodeParentIfType(toNode?.id || "", nodeMap, "invisiblenode");
    const fromNodeParent = getNodeParentIfType(fromNode.id, nodeMap, "invisiblenode");

    if (toNodeParent && fromNodeParent) {
        const childrenSet = nodeParentIdMapWithChildIdSet.get(toNodeParent.id);
        //We change all of the children of the toNodeParent to be children of the sourceParent
        if (childrenSet) {
            //childrenSet.delete(updatedToNode.id);
            childrenSet.forEach(childId => {
                const childNode = nodeMap.get(childId);
                if (childNode) {
                    const updatedChildNode = {
                        ...childNode,
                        parentId: fromNodeParent.id,
                        extent: "parent" as const
                    };
                    updatedToNodeSiblings.push(updatedChildNode);
                }
            });
        }
        containerToRemove = toNodeParent;
    }
    else if (fromNodeParent || toNodeParent) {
        updatedToNode = {
            ...toNode,
            parentId: fromNodeParent?.id || toNodeParent?.id,
            extent: "parent" as const
        };
        updatedFromNode = {
            ...fromNode,
            parentId: fromNodeParent?.id || toNodeParent?.id,
            extent: "parent" as const
        };
    }
    // Otherwise, create a new LR container for both nodes
    else {
        const containerPosition = calculateInitialContainerNodePosition([fromNode, toNode]);
        containerToAdd = createNodeFromTemplate("invisiblenode", {
            id: `invisible-${Date.now()}`,
            position: containerPosition,
            data: {}
        });

        if (containerToAdd) {
            updatedFromNode = {
                ...fromNode,
                parentId: containerToAdd.id,
                extent: "parent" as const
            };

            updatedToNode = {
                ...toNode,
                parentId: containerToAdd.id,
                extent: "parent" as const
            };

        } else {
            console.error("Failed to create new invisible node for drag-to-create operation");
        }
    }

    return { updatedFromNode, updatedToNode, containerToAdd, containerToRemove, updatedToNodeSiblings };
}


/**
 * @description
 * Create a new connection node when a connection is made
 * @param updatedFromNode - The node that is being connected from
 * @param newNodeId - ID for the new node to be created
 * @param position - Position where the new node should be placed
 * @returns The newly created node, or null if creation failed
 * @remarks
 * This function uses the node registry to create a new node based on the type of the source node in the connection.
 */
export const createConnectionNode = (
    updatedFromNode: Node<NodeData>,
    newNodeId: string,
    position?: { x: number; y: number }
): any => {
    // Use the node registry to create a new node
    const newNodeFromTemplate = createNodeFromTemplate(updatedFromNode.type || "", {
        id: newNodeId,
        position: position || { x: 0, y: 0 },
        eventNode: updatedFromNode,
        details: "Add details about this concept",

    });

    if (!newNodeFromTemplate) {
        console.error("Failed to create new node on connect end: node type not registered");
        return null;
    }

    return newNodeFromTemplate;
}