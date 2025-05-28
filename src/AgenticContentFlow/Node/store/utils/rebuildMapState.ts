import { Node } from "@xyflow/react";
import { NodeStoreState } from "../useNodeContext";
import { isParentNodeType } from "./nodeTypeCheck";
import { normalizeNodeExpandedState } from "./normalizeNodeExpandedState";

export const rebuildMapState = (nodes: Node<any>[]): Omit<NodeStoreState, 'nodes' | 'parentNodes' | 'childNodes' | 'isNewState' > => {
    const nodeMap = new Map<string, Node<any>>();
    const nodeParentIdMapWithChildIdSet = new Map<string, Set<string>>();
    const pureChildIdSet = new Set<string>();

    // Ensure "no-parent" category exists.
    nodeParentIdMapWithChildIdSet.set("no-parent", new Set());

    nodes.forEach((node) => {
        addSingleNode(node, nodeMap, nodeParentIdMapWithChildIdSet, pureChildIdSet);
    });

    return { nodeMap, nodeParentIdMapWithChildIdSet, pureChildIdSet };
};

export const addSingleNode = (node: Node<any>, nodeMap: Map<string, Node<any>>, nodeParentIdMapWithChildIdSet: Map<string, Set<string>>, pureChildIdSet: Set<string>) => {
    normalizeNodeExpandedState(node);
    nodeMap.set(node.id, node);
    if (node.parentId) {
        if (!nodeParentIdMapWithChildIdSet.has(node.parentId)) {
            nodeParentIdMapWithChildIdSet.set(node.parentId, new Set());
        }
        nodeParentIdMapWithChildIdSet.get(node.parentId)!.add(node.id);
    } else {
        nodeParentIdMapWithChildIdSet.get("no-parent")!.add(node.id);
    }

    // Also check if this node itself is a parent type and ensure it has an entry
    // in the nodeParentIdMapWithChildIdSet (even if it has no children yet)
    if (node.type && (node.data?.isParent || isParentNodeType(node))) {
        if (!nodeParentIdMapWithChildIdSet.has(node.id)) {
            nodeParentIdMapWithChildIdSet.set(node.id, new Set());
        }
    } else {
        // If it's not a parent node, add it to the pureChildIdSet
        pureChildIdSet.add(node.id);
    }
}