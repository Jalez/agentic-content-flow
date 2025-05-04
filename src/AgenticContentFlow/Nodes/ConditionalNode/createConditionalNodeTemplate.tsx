import { Node } from "@xyflow/react";
import { NodeData } from "../../types";

/**
 * Creates a template for a new conditional node
 *
 * @param params Object containing node creation parameters
 * @returns A new conditional node configuration
 */
export const createConditionalNodeTemplate = (
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
    type: "conditionalnode",
    data: {
      label: params.label || "Condition",
      level,
      parent: eventNode?.id,
      subject: eventNode?.data.subject || "logic",
      nodeLevel: params.nodeLevel || "intermediate",
      details: params.details || "Define condition logic",
      // No isParent flag as conditional nodes don't support expand/collapse
    },
    // No style dimensions as conditional nodes have fixed diamond shape
    position,
    parentId: eventNode?.parentId,
    // Add extent property at the node level to match the data structure
    extent: eventNode?.parentId ? "parent" : undefined,
  };
};