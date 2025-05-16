import { Node } from "@xyflow/react";

export const recursiveNodeRemoval = (
    nodeMap: Map<string, Node>,
    nodeParentIdMapWithChildIdSet: Map<string, Set<string>>,
    pureChildIdSet: Set<string>,
    nodesToRemove: Node[]
) => {
    for (const nodeToRemove of nodesToRemove) {
        const nodeId = nodeToRemove.id;
        nodeMap.delete(nodeId);

        // Remove the node from the parent-child relationships using the Set-based approach
        const parentId = nodeToRemove.parentId || "no-parent";
        nodeParentIdMapWithChildIdSet.get(parentId)?.delete(nodeId);
        const childrenIdsOfRemovedParent = nodeParentIdMapWithChildIdSet.get(nodeId);
        if (childrenIdsOfRemovedParent && childrenIdsOfRemovedParent.size > 0) {
            // If the removed node had children, we need to remove the children too, aka we call this function recursively
            recursiveNodeRemoval(nodeMap, nodeParentIdMapWithChildIdSet, pureChildIdSet, Array.from(childrenIdsOfRemovedParent).map(childId => nodeMap.get(childId)!));
        }
        // Remove the entry for the removed parent node itself from the parent map
        nodeParentIdMapWithChildIdSet.delete(nodeId);
        pureChildIdSet.delete(nodeId);
    }
};