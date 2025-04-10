import { HTMLAttributes } from "react";

/**
 * Common type definitions for container nodes
 */

/**
 * Data structure for container nodes
 */
export interface UnifiedNodeData {
  label: string;
  details?: string;
  nodeLevel?: "basic" | "intermediate" | "advanced";
  level: number;
  parent?: string;
  courseCode?: string;
  subject?: string;
  nodeType?: "course" | "module";
  position: { x: number; y: number };
  [key: string]: unknown;
}

/**
 * Props for node label component
 */
export type NodeLabelProps = HTMLAttributes<HTMLDivElement>;

/**
 * Determine the node type based on data
 */
export const getNodeType = (data: UnifiedNodeData): "course" | "module" => {
  return data.nodeType || (data.courseCode ? "course" : "module");
};

/**
 * Check if a node is a course node
 */
export const isCourseNode = (data: UnifiedNodeData): boolean => {
  return getNodeType(data) === "course";
};