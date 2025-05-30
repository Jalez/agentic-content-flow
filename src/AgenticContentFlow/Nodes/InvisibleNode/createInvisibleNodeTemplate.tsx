import { Node } from "@xyflow/react";
import { NodeData } from "../../types";

/**
 * Creates a template for a new invisible container node
 * Supports both regular containers and specialized LR containers for horizontal layouts
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
      subject: params.subject || eventNode?.data.subject || "container",
      nodeLevel: params.nodeLevel || "intermediate",
      details: params.details || "Invisible container for organizing content",
      isParent: params.isParent ?? true,
      expanded: params.expanded ?? true, // Default to expanded for containers
      // Support for LR container layout direction
      layoutDirection: params.layoutDirection || 'LR', // Default to TB if not specified
      isContainer: params.isContainer ?? true,
      depth: params.depth ?? (eventNode?.data.depth ? eventNode.data.depth : 0),
      deleteOnEmpty: params.deleteOnEmpty ?? true, // Default to true for invisible nodes
    },
    style: {
      width: params.width || 300,
      height: params.height || 200,
    },
    position,
    parentId: params.parentId || eventNode?.parentId,
    extent: (params.parentId || eventNode?.parentId) ? "parent" : undefined,
  };
};