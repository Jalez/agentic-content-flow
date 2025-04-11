import { Node } from "@xyflow/react";
import { NodeData } from "../../../types";


/**
 * Gets the most suitable potential parent from a list of candidates.
 * Selection criteria (in order):
 * 1. Excludes any nodes that are children/grandchildren of the given node
 * 2. Prefers siblings over other relationships
 * 3. For nodes of equal relationship level (siblings or same-depth parents):
 *    - Prefers nodes that overlap with the current node's position
 *    - If multiple nodes overlap, selects the one that contains more of the node's area
 *    - If no overlap, selects the closest node
 * 4. If all else is equal, prefers younger nodes (more recently created)
 */
export const getPotentialParent = (
    node: Node<NodeData>, 
    potentialParentCandidates: Node[],
    parentIdWithChildren: Map<string, Node<NodeData>[]>, 
    poolOfAllNodes: Map<string, Node<NodeData>>
): Node| undefined => {
    // Helper function to check if a node is a descendant
    const isDescendant = (potentialChildId: string, ancestorId: string, visited = new Set<string>()): boolean => {
        if (potentialChildId === ancestorId) return true;
        if (visited.has(potentialChildId)) return false;
        visited.add(potentialChildId);

        // Check if the child is in the ancestor's children
        const ancestorChildren = parentIdWithChildren.get(ancestorId) || [];
        if (ancestorChildren.some(child => child.id === potentialChildId)) {
            return true;
        }

        // Recursively check all children
        return ancestorChildren.some((child: Node<NodeData>) => 
            isDescendant(potentialChildId, child.id, visited)
        );
    };

    // Helper function to check if nodes are siblings
    const areSiblings = (nodeA: Node, nodeB: Node): boolean => {
        return nodeA.parentId != null && nodeA.parentId === nodeB.parentId;
    };

    // Helper function to calculate overlap area between two nodes
    const getOverlapArea = (nodeA: Node, nodeB: Node): number => {
        const aWidth = nodeA.width || nodeA.measured?.width || 0;
        const aHeight = nodeA.height || nodeA.measured?.height || 0;
        const bWidth = nodeB.width || nodeB.measured?.width || 0;
        const bHeight = nodeB.height || nodeB.measured?.height || 0;

        const left = Math.max(nodeA.position.x, nodeB.position.x);
        const right = Math.min(nodeA.position.x + aWidth, nodeB.position.x + bWidth);
        const top = Math.max(nodeA.position.y, nodeB.position.y);
        const bottom = Math.min(nodeA.position.y + aHeight, nodeB.position.y + bHeight);

        if (right < left || bottom < top) return 0;
        return (right - left) * (bottom - top);
    };

    // Helper function to get the center-to-center distance between nodes
    const getDistance = (nodeA: Node, nodeB: Node): number => {
        const aWidth = nodeA.width || nodeA.measured?.width || 0;
        const aHeight = nodeA.height || nodeA.measured?.height || 0;
        const bWidth = nodeB.width || nodeB.measured?.width || 0;
        const bHeight = nodeB.height || nodeB.measured?.height || 0;

        const aCenterX = nodeA.position.x + aWidth / 2;
        const aCenterY = nodeA.position.y + aHeight / 2;
        const bCenterX = nodeB.position.x + bWidth / 2;
        const bCenterY = nodeB.position.y + bHeight / 2;

        return Math.sqrt(
            Math.pow(bCenterX - aCenterX, 2) + 
            Math.pow(bCenterY - aCenterY, 2)
        );
    };

    // Filter out descendants and self
    const validCandidates = potentialParentCandidates.filter(
        candidate => !isDescendant(candidate.id, node.id) && candidate.id !== node.id
    );

    if (validCandidates.length === 0) return undefined;

    // Sort candidates by priority:
    // 1. Siblings first
    // 2. Overlapping area (more overlap = higher priority)
    // 3. Distance (closer = higher priority)
    // 4. Node age (younger = higher priority)
    return validCandidates.sort((a, b) => {
        // First priority: siblings
        const aIsSibling = areSiblings(a, node);
        const bIsSibling = areSiblings(b, node);
        if (aIsSibling !== bIsSibling) {
            return aIsSibling ? -1 : 1;
        }

        // Second priority: overlap area
        const aOverlap = getOverlapArea(node, a);
        const bOverlap = getOverlapArea(node, b);
        if (aOverlap !== bOverlap) {
            return bOverlap - aOverlap; // More overlap wins
        }

        // Third priority: distance (only if no overlap)
        if (aOverlap === 0 && bOverlap === 0) {
            const aDist = getDistance(node, a);
            const bDist = getDistance(node, b);
            if (Math.abs(aDist - bDist) > 0.001) { // Use small epsilon for float comparison
                return aDist - bDist; // Closer wins
            }
        }

        // Final tiebreaker: node age
        const aNum = parseInt(a.id.match(/\d+/)?.[0] || '0');
        const bNum = parseInt(b.id.match(/\d+/)?.[0] || '0');
        return bNum - aNum; // Higher numbers (more recent) come first
    })[0];
};