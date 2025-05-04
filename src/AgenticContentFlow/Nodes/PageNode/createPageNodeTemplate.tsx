import { Node } from "@xyflow/react";
import { NodeData } from "../../types";

/**
 * Creates a template for a new page node
 *
 * @param params Object containing node creation parameters
 * @returns A new page node configuration
 */
export const createPageNodeTemplate = (
  params: {
    id: string;
    position: { x: number; y: number };
    eventNode?: Node<NodeData>;
  } & Record<string, any>
): Node<NodeData> => {
  const { id, position, eventNode } = params;

  // Get parent level if available
  const level = eventNode?.data.level;

  return {
    id,
    type: "pagenode",
    data: {
      label: params.label || "Page",
      level,
      parent: eventNode?.id,
      subject: eventNode?.data.subject || "content",
      nodeLevel: params.nodeLevel || "intermediate",
      details: params.details || "Add page content here",
      isParent: true,
      expanded: false
    },
    style: {
      width: 300,
      height: 200,
    },
    position,
    parentId: eventNode?.parentId,
    // Add extent property at the node level to match the data structure
    extent: eventNode?.parentId ? "parent" : undefined,
  };
};