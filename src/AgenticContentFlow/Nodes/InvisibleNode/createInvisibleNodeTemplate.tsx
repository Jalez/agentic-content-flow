import { Node } from "@xyflow/react";
import { NodeData } from "../../types";

/**
 * Creates a template for a new invisible container node
 *
 * @param params Object containing node creation parameters
 * @returns A new invisible node configuration
 */
export const createInvisibleNodeTemplate = (
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
    type: "invisiblenode",
    data: {
      label: params.label || "Container",
      level,
      parent: eventNode?.id,
      subject: eventNode?.data.subject || "container",
      nodeLevel: params.nodeLevel || "intermediate",
      details: params.details || "Invisible container for organizing content",
      isParent: true,
      expanded: false
    },
    style: {
      width: 300,
      height: 200,
    },
    position,
    parentId: eventNode?.parentId,
    extent: eventNode?.parentId ? "parent" : undefined,
  };
};