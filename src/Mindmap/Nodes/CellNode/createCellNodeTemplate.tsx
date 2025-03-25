import { Node } from "@xyflow/react";
import { NodeData } from "../../types";

/**
 * Creates a template for a new cell node
 *
 * @param params Object containing node creation parameters
 * @returns A new custom node configuration
 */
export const createCellNodeTemplate = (
  params: {
    id: string;
    position: { x: number; y: number };
    eventNode?: Node<NodeData>;
  } & Record<string, any>,
  type: string = "cellnode"
): Node<NodeData> => {
  const { id, position, eventNode } = params;

  // Determine the level based on parent node
  const level = eventNode?.data.level;

  console.log("position", position);
  // Create the node with proper structure
  return {
    id,
    type: type,
    data: {
      label: params.label || "New Concept",
      level,
      parent: eventNode?.id,
      subject: eventNode?.data.subject || "general",
      nodeLevel: params.nodeLevel || "basic",
      details: params.details || "Add details about this concept",
    },
    position,
    parentId: eventNode?.parentId,
    // Add extent property at the node level to match nodesData structure
    extent: eventNode?.parentId ? "parent" : undefined,
    origin: [0.0, 0.5],
  };
};
