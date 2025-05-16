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
    // Cache for already-computed node levels
    const levelCache = new Map<string, number>();

    // Get all parent node IDs and precompute levels in one pass
    const parentIds = Array.from(nodeParentIdMapWithChildIdSet.keys());

    // Compute levels for all parent nodes
    for (const id of parentIds) {
        if (levelCache.has(id)) continue; // Skip if already cached
        const level = getNodeDepth(poolOfAllNodes, id);
        levelCache.set(id, level);
    }


    // Sort by level ascending (root first), then by ID for stability
    parentIds.sort((a, b) => {
        const levelDiff = levelCache.get(a)! - levelCache.get(b)!;
        return levelDiff !== 0 ? levelDiff : a.localeCompare(b);
    });
    
    let parentNodes: Node[] = [];

    parentIds.map(id => {
        const node = poolOfAllNodes.get(id);
        node && parentNodes.push(node)
    });

    return parentNodes;
};