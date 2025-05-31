import { Node } from "@xyflow/react";
import { NodeData } from "../../types";

/**
 * Creates a template for a new REST API node
 *
 * @param params Object containing node creation parameters
 * @returns A new REST node configuration
 */
export const createRestNodeTemplate = (
  params: {
    id: string;
    position: { x: number; y: number };
    eventNode?: Node<NodeData>;
  } & Record<string, any>
): Node<NodeData> => {
  const { id, position, eventNode } = params;

  // Get parent level if available
  const level = eventNode?.data.level;
  const eventDepth = typeof eventNode?.data.depth === 'number' ? eventNode.data.depth : 0;

  return {
    id,
    type: "restnode",
    data: {
      label: params.label || "REST API",
      level,
      parent: eventNode?.id,
      subject: eventNode?.data.subject || "integration",
      nodeLevel: params.nodeLevel || "intermediate",
      details: params.details || "Configure REST API endpoint",
      isParent: false,
      expanded: false,
      depth: eventDepth + 1,
      method: params.method || "GET",
      url: params.url || "",
      authentication: params.authentication || "none",
      timeout: params.timeout || 30,
      retryAttempts: params.retryAttempts || 3,
      headers: params.headers || {
        "Content-Type": "application/json"
      }
    },
    style: {
      width: 200,
      height: 200,
    },
    position,
    parentId: eventNode?.parentId,
    extent: eventNode?.parentId ? "parent" : undefined,
  };
};