import { Node } from "@xyflow/react";
import { NodeData } from "../../types";

/**
 * Creates a template for a new statistics node
 *
 * @param params Object containing node creation parameters
 * @returns A new statistics node configuration
 */
export const createStatisticsNodeTemplate = (
  params: {
    id: string;
    position: { x: number; y: number };
    eventNode?: Node<NodeData>;
  } & Record<string, any>
): Node<NodeData> => {
  const { id, position, eventNode } = params;

  // Get parent level if available
  const level = eventNode?.data.level;
  const depth = eventNode?.data.depth || 0;

  return {
    id,
    type: "statisticsnode",
    data: {
      label: params.label || "Statistics",
      level,
      parent: eventNode?.id,
      subject: eventNode?.data.subject || "analytics",
      nodeLevel: params.nodeLevel || "intermediate",
      details: params.details || "Statistical analysis and metrics",
      isParent: false,
      expanded: false,
      depth: Number(depth) + 1, // Statistics nodes are one level deeper than their parent
      metrics: params.metrics || "Views: 0, Clicks: 0, Duration: 0s",
      chartType: params.chartType || "bar"
    },
    style: {
      width: 280,
      height: 160,
    },
    position,
    parentId: eventNode?.parentId,
    extent: eventNode?.parentId ? "parent" : undefined,
  };
};