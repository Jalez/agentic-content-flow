/** @format */
// Node data with level and optional parent

import { Node } from "@xyflow/react";

export interface EditNodeDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (label: string, details: string) => void;
  initialLabel: string;
  initialDetails: string;
}

/**
 * Node data interface
 * @property {string} label - The label of the node
 * @property {string} subject - The subject of the node (optional)
 * @property {string} details - The details of the node (optional)
 * @property {string} [key: string] - Additional properties (optional)
 * @public
 */
export interface NodeData {
  label: string;
  subject?: string;
  details?: string;
  [key: string]: unknown; // Add this line to include an index signature
}

/**
 * Node data for a course node
 * @extends NodeData
 * @property {string} courseCode - The course code (optional)
 * @property {string} subject - The subject of the course (optional)
 * @property {string} level - The level of the course (optional)
 * @property {"basic" | "intermediate" | "advanced"} nodeLevel - The level of the course (optional)
 * @public
 */
export interface CourseNodeData extends NodeData {
  courseCode?: string;
  subject?: string;
  level?: "basic" | "intermediate" | "advanced";
}
