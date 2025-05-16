import { Node } from "@xyflow/react";

  // Helper to ensure node data has proper expanded property
 export const normalizeNodeExpandedState = (node: Node<any>): Node<any> => {
    if (!node) return node;
  
    // Create a new copy of the node
    return {
      ...node,
      data: {
        ...node.data,
        // Ensure expanded property is explicitly a boolean
        expanded: typeof node.data?.expanded === 'boolean' ? node.data.expanded : false
      },
      // Ensure position and other critical properties are present if they might be missing
      position: node.position || { x: 0, y: 0 },
      type: node.type || 'default', // Provide a default type if needed
      // Add other essential properties if necessary
    };
  };
  