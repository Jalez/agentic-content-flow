import { Node } from "@xyflow/react";
import { NodeData } from "../../../types";
import { getNodeDepth } from "./getNodeDepth";

/**
 * Organizes parent nodes with root nodes first, followed by intermediate nodes, and leaf nodes last.
 * Example: For a tree root->a->b, the order would be [root, a, b]
 */
export const getOrganizedNodeParents = (
    nodeParentIdMapWithChildIdSet: Map<string, Set<string>>,
    poolOfAllNodes: Map<string, Node<NodeData>>,
): Node[] => {
    // Map to store nodes by level: { level -> set of nodes at that level }
    const nodesByLevel = new Map<number, Set<Node<NodeData>>>();
    
    // Track the maximum level we encounter
    let maxLevel = 0;
    
    // Process all parent IDs in a single pass
    for (const id of nodeParentIdMapWithChildIdSet.keys()) {
        const node = poolOfAllNodes.get(id);
        
        // Skip hidden nodes
        if (!node || node.hidden) continue;
        
        // Calculate the node's level
        const level = getNodeDepth(poolOfAllNodes, id);
        
        // Update max level if needed
        if (level > maxLevel) {
            maxLevel = level;
        }
        
        // Add node to the appropriate level set
        if (!nodesByLevel.has(level)) {
            nodesByLevel.set(level, new Set());
        }
        nodesByLevel.get(level)!.add(node);
    }
    
    // Collect nodes in order by level (from lowest to highest)
    const organizedNodes: Node[] = [];
    for (let level = 0; level <= maxLevel; level++) {
        const nodesAtLevel = nodesByLevel.get(level);
        if (nodesAtLevel) {
            organizedNodes.push(...Array.from(nodesAtLevel));
        }
    }
    
    return organizedNodes;
};