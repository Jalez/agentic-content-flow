import { Node } from "@xyflow/react";
import { getNodeTypeInfo } from "../../registry/nodeTypeRegistry";

  // Helper to check if a node type is registered as a parent
  export const isParentNodeType = (node: Node<any>): boolean => {
    // Add a check for undefined or null node/node.type
    if (!node || !node.type) {
      return false;
    }
    const nodeTypeInfo = getNodeTypeInfo(node.type as string);
    if (!nodeTypeInfo) {
      return node.data?.isParent || false;
    }
    return !!nodeTypeInfo?.isParent;
  };