import { Node } from "@xyflow/react";
import { NodeData } from "../../types";

/**
 * Creates a template for a new view node
 *
 * @param params Object containing node creation parameters
 * @returns A new view node configuration
 */
export const createContentNodeTemplate = (
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
    type: "contentnode",
    data: {
      label: params.label || "View",
      level,
      parent: eventNode?.id,
      subject: eventNode?.data.subject || "visualization",
      nodeLevel: params.nodeLevel || "advanced",
      details: params.details || "Configure visualization parameters",
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