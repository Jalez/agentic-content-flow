import { Node } from "@xyflow/react";

export const getPureNodeChildren = (
    pureChildIdSet: Set<string>,
    nodeMap: Map<string, Node<any>>
): Node<any>[] => {

    const childNodeIds = pureChildIdSet.size > 0 ? Array.from(pureChildIdSet) : []; 
    const childNodes = [];
    for (const childId of childNodeIds) {
        const childNode = nodeMap.get(childId);
        //if its hidden, skip it
        if (childNode && childNode.hidden) {
            continue;
        }
        if (childNode) {
            childNodes.push(childNode);
        }
    }
    return childNodes;
}