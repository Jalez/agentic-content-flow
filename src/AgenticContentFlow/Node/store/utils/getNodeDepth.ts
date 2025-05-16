import { Node } from "@xyflow/react";

// Helper to compute how many levels a node is from the root
export const getNodeDepth = (
    poolOfAllNodes: Map<string, Node<any>>,
    nodeId: string, 
    visited = new Set<string>()
): number => {
    // Prevent cycles
    if (visited.has(nodeId)) return 0;
    visited.add(nodeId);
    const node = poolOfAllNodes.get(nodeId);
    if (!node?.parentId) {
        return 0;
    }
    if (!poolOfAllNodes.has(node.parentId)) {
        return 0;
    }
    const level = 1 + getNodeDepth(poolOfAllNodes, node.parentId, visited);

    return level;
};
