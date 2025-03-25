/** @format */
import { Node } from "@xyflow/react";
import { NodeData } from "../../types";

/**
 * Creates a template for a unified node that can be either a course or module
 *
 * @param params Object containing node creation parameters
 * @returns A new node configuration
 */
export const createContainerNodeTemplate = (
  params: {
    id: string;
    position: { x: number; y: number };
    eventNode?: Node<NodeData>;
    courseCode?: string;
    moduleNumber?: number;
  } & Record<string, any>,
  type: string = "coursenode"
): Node<NodeData> => {
  const { id, position, eventNode, courseCode, moduleNumber = 1 } = params;

  // Determine the level based on parent node
  const level = eventNode?.data.level;

  const isCourse = Boolean(eventNode?.type);

  return {
    id,
    type: type,
    data: {
      label:
        params.label ||
        (isCourse
          ? `${courseCode || "COMP.CS.XXX"}: Course Title`
          : `Module ${moduleNumber}: Module Title`),
      level,
      parent: eventNode?.id,
      subject: eventNode?.data.subject || "COMP.CS",
      nodeLevel: params.nodeLevel || "basic",
      details:
        params.details ||
        (isCourse ? "Add course details" : "Module description and content."),
      ...(isCourse && { courseCode: courseCode || "COMP.CS.XXX" }),
    },
    position,
    parentId: eventNode?.parentId,
    // Add extent property at the node level to match nodesData structure
    extent: eventNode ? "parent" : undefined,
  };
};
