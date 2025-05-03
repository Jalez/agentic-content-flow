import { Node } from "@xyflow/react";

/**
 * Recursively updates the visibility of nodes in a hierarchy when a parent node is expanded or collapsed
 * 
 * @param parentNode The node being expanded or collapsed
 * @param nodeMap Map of all nodes by their ID
 * @param nodeParentIdMapWithChildIdSet Map of parent node IDs to their set of child node IDs
 * @param isExpanded Whether the parent node is being expanded (true) or collapsed (false)
 * @returns An array of updated child nodes with their visibility status set
 */
export const updateNodeHierarchyVisibility = (
  parentNode: Node, 
  nodeMap: Map<string, Node>,
  nodeParentIdMapWithChildIdSet: Map<string, Set<string>>,
  isExpanded: boolean
): Node[] => {
  // First check if the parent node is in the nodeParentMap (is a parent)
  if (!nodeParentIdMapWithChildIdSet.has(parentNode.id)) {
    return [];
  }
  
  // Get the direct children of this parent
  const childNodeIds = nodeParentIdMapWithChildIdSet.get(parentNode.id) || [];
  let updatedChildNodes: Node[] = [];
  
  // If parent is being collapsed or expanded, deal with its direct children
  for (const childNodeId of childNodeIds) {
    const childNode = nodeMap.get(childNodeId);
    if (!childNode) {
        console.warn(`Child node with ID ${childNodeId} not found in node map.`);
        continue;
        }
    // Update the direct child's visibility based on the parent's new state
    const updatedChildNode = {
      ...childNode,
      hidden: !isExpanded,
    };
    updatedChildNodes.push(updatedChildNode);

    if (nodeParentIdMapWithChildIdSet.has(childNode.id)) {
        // By default, assume the child node is expanded. This is a fallback
        // in case the child node does not have an "expanded" property.
        // This is a bit of a hack, but it works for our use case because we 
        // currently do not on render set the "expanded" nor the "hidden" property on any nodes, so by default
        // we assume they are all expanded.
        // In the future, we might be tempted to set some child elements to be collapsed and 
        // Some to be hidden by default, so we need to return to this
        // code if we ever do that. Perhaps some kind of a reminder would be good? 
        let isChildExpanded = true;
        if( Object.prototype.hasOwnProperty.call(childNode.data, "expanded") ) {
            isChildExpanded = childNode.data.expanded as boolean;
        }
        console.log("Child node expanded interpret value", isChildExpanded);
        console.log("Child node expanded direct value", childNode.data?.expanded);
        
        if (isChildExpanded) {
        
          const grandchildUpdates = updateNodeHierarchyVisibility(childNode, nodeMap, nodeParentIdMapWithChildIdSet, isExpanded);
          updatedChildNodes.push(...grandchildUpdates);
        }
    } 
  }

  return updatedChildNodes;
}

// For backward compatibility with existing code
/**
 * @deprecated Use updateNodeHierarchyVisibility instead
 */
export const updateParentIdChildren = updateNodeHierarchyVisibility;