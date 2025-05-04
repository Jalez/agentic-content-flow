import { Node } from "@xyflow/react";
import { NodeData } from "../../types";

/**
 * Creates a template for a new data node
 *
 * @param params Object containing node creation parameters
 * @returns A new data node configuration
 */
export const createDataNodeTemplate = (
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
    type: "datanode",
    data: {
      label: params.label || "Data Source",
      level,
      parent: eventNode?.id,
      subject: eventNode?.data.subject || "data",
      nodeLevel: params.nodeLevel || "basic",
      details: params.details || "Define data source configuration",
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