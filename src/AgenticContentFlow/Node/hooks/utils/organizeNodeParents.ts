import { Node } from "@xyflow/react";
import { NodeData } from "../../../types";

/**
 * Organizes parent nodes with root nodes first, followed by intermediate nodes, and leaf nodes last.
 * Example: For a tree root->a->b, the order would be [root, a, b]
 */
export const organizeNodeParents = (
    nodeParentIdMapWithChildIdSet: Map<string, Set<string>>,
    poolOfAllNodes: Map<string, Node<NodeData>>,
): Node[] => {
    // Cache for already-computed node levels
    const levelCache = new Map<string, number>();
    // Global visited set to avoid recomputing already-visited nodes
    const globalVisited = new Set<string>();

    // Helper to compute how many levels a node is from the root
    const getLevelFromRoot = (nodeId: string, visited = new Set<string>()): number => {
        // Return cached value if available
        if (levelCache.has(nodeId)) return levelCache.get(nodeId)!;
        
        // Prevent cycles
        if (visited.has(nodeId)) return 0;
        visited.add(nodeId);
        globalVisited.add(nodeId);

        const node = poolOfAllNodes.get(nodeId);
        if (!node?.parentId) {
            levelCache.set(nodeId, 0);
            return 0; // Root level
        }
        if (!poolOfAllNodes.has(node.parentId)) {
            levelCache.set(nodeId, 0);
            return 0; // Parent doesn't exist
        }

        // Add 1 to parent's level (recursively)
        const level = 1 + getLevelFromRoot(node.parentId, visited);
        // Cache the result
        levelCache.set(nodeId, level);
        return level;
    };

    // Get all parent node IDs and precompute levels in one pass
    const parentIds = Array.from(nodeParentIdMapWithChildIdSet.keys());
    
    // Compute levels for all parent nodes
    for (const id of parentIds) {
        if (!globalVisited.has(id)) {
            getLevelFromRoot(id);
        }
    }

    // Map each parent node to its level from root
    const parentLevels = parentIds
        .map(id => ({
            node: poolOfAllNodes.get(id),
            level: levelCache.get(id) || 0
        }))
        .filter(entry => entry.node);

    // Sort by level ascending (root first), then by ID for stability
    parentLevels.sort((a, b) => {
        const levelDiff = a.level - b.level;
        return levelDiff !== 0 ? levelDiff : a.node!.id.localeCompare(b.node!.id);
    });
    
    return parentLevels.map(entry => entry.node!);
};