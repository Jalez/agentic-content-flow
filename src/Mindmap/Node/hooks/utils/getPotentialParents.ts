import { Node } from "@xyflow/react";
import { NodeData } from "../../../types";


/**
 * Gets the most suitable potential parent from a list of candidates.
 * Only nodes that are already parents (exist in parentIdWithChildren) or are the current parent of the node
 * can be suggested as potential parents.
 * 
 * Selection criteria (in order):
 * 1. Excludes any nodes that are children/grandchildren of the given node to prevent cycles
 * 2. Must be either an existing parent (has children) or be the current parent of the node
 * 3. Prefers siblings that are parents over other relationships
 * 4. Prefers current parent if it's among valid candidates
 * 5. For other valid parent candidates:
 *    - Prefers nodes that overlap with the current node's position
 *    - If multiple nodes overlap, selects the one that contains more of the node's area
 *    - If no overlap, selects the closest node
 * 6. If all else is equal, prefers younger nodes (more recently created)
 * 
 * @param {Node<NodeData>} node - The node being dragged
 * @param {Node[]} potentialParentCandidates - List of nodes that intersect with the dragged node
 * @param {Map<string, Node<NodeData>[]>} parentIdWithChildren - Map of parent IDs to their children, defines which nodes can be parents
 * @param {Map<string, Node<NodeData>>} poolOfAllNodes - Map of all nodes in the workspace for ancestry checks
 * @returns {Node | undefined} The most suitable parent candidate, or undefined if no valid candidates found
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

        const nodeParentId = poolOfAllNodes.get(potentialChildId)?.parentId;
        if (!nodeParentId) return false;
        
        return isDescendant(nodeParentId, ancestorId, visited);
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

    // Filter out descendants and self, and only allow existing parents or current parent
    const validCandidates = potentialParentCandidates.filter(
        candidate => !isDescendant(candidate.id, node.id) && 
                    candidate.id !== node.id &&
                    (parentIdWithChildren.has(candidate.id) || // is already a parent
                     candidate.id === node.parentId) // or is the current parent
    );

    if (validCandidates.length === 0) return undefined;

    // First check for siblings
    const siblings = validCandidates.filter(candidate => areSiblings(candidate, node));
    if (siblings.length > 0) {
        return siblings.sort((a, b) => {
            // For siblings, prefer by overlap then distance then age
            const aOverlap = getOverlapArea(node, a);
            const bOverlap = getOverlapArea(node, b);
            if (aOverlap !== bOverlap) {
                return bOverlap - aOverlap;
            }

            if (aOverlap === 0 && bOverlap === 0) {
                const aDist = getDistance(node, a);
                const bDist = getDistance(node, b);
                if (Math.abs(aDist - bDist) > 0.001) {
                    return aDist - bDist;
                }
            }

            const aNum = parseInt(a.id.match(/\d+/)?.[0] || '0');
            const bNum = parseInt(b.id.match(/\d+/)?.[0] || '0');
            return bNum - aNum;
        })[0];
    }

    // Then check if current parent is among valid candidates
    if (node.parentId) {
        const currentParentCandidate = validCandidates.find(
            candidate => candidate.id === node.parentId
        );
        if (currentParentCandidate) {
            return currentParentCandidate;
        }
    }

    // If no siblings or current parent, sort remaining candidates by overlap/distance/age
    return validCandidates.sort((a, b) => {
        // Same sorting logic for remaining candidates
        const aOverlap = getOverlapArea(node, a);
        const bOverlap = getOverlapArea(node, b);
        if (aOverlap !== bOverlap) {
            return bOverlap - aOverlap;
        }

        if (aOverlap === 0 && bOverlap === 0) {
            const aDist = getDistance(node, a);
            const bDist = getDistance(node, b);
            if (Math.abs(aDist - bDist) > 0.001) {
                return aDist - bDist;
            }
        }

        const aNum = parseInt(a.id.match(/\d+/)?.[0] || '0');
        const bNum = parseInt(b.id.match(/\d+/)?.[0] || '0');
        return bNum - aNum;
    })[0];
};