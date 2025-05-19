import { Edge } from "@xyflow/react";

// Edge connections for the LMS diagram
export const lmsEdgesData: Edge[] = [
  // Connect data to Module 1 view
  {
    id: "e-data-module1-view",
    source: "data-module-1",
    target: "view-module-1",
    sourceHandle: "right", // Right side of data node
    targetHandle: "left",  // Left side of view node
  },
  
  // Connect data sources to Module 2 view
  {
    id: "e-data1-module2-view",
    source: "data-module-2",
    target: "view-module-2",
    sourceHandle: "right", // Right side of data node
    targetHandle: "left",  // Left side of view node
  },
  {
    id: "e-data2-module2-view",
    source: "data-2-module-2",
    target: "view-module-2",
    sourceHandle: "right", // Right side of data node
    targetHandle: "left",  // Left side of view node
  },
  
  // Connect instance-1 modules to conditional node - UPDATED to use bottom-to-top
  {
    id: "e-module1-i1-points",
    source: "module-1-instance-1",
    target: "points-check",
    sourceHandle: "bottom", // Bottom of module (for routing)
    targetHandle: "top", // Top of conditional node (default input)
  },
  {
    id: "e-module2-i1-points",
    source: "module-2-instance-1",
    target: "points-check",
    sourceHandle: "bottom", // Bottom of module (for routing)
    targetHandle: "top", // Top of conditional node (default input)
  },
  
  // Connect conditional node to Module 3 - "OK" path - UPDATED
  {
    id: "e-points-module3",
    source: "points-check",
    target: "module-3-instance-1",
    sourceHandle: "bottom",  // Bottom of conditional (OK)
    targetHandle: "top",  // Top of module (for routing)
  },
  
  // Connect Course Stats to Course 0 - This is DATA flow, so left/right is correct
  {
    id: "e-stats-course0",
    source: "course-stats",
    target: "course-0-lms",
    sourceHandle: "right", // Right side of data node
    targetHandle: "left",  // Left side of course
  },
  
  // Connect Course 0 to dependent courses - UPDATED for routing
  {
    id: "e-course0-course1",
    source: "course-0-lms",
    target: "course-1",
    sourceHandle: "bottom", // Bottom of course (for routing)
    targetHandle: "top",  // Top of dependent course (for routing)
  },
  {
    id: "e-course0-course2",
    source: "course-0-lms",
    target: "course-2",
    sourceHandle: "bottom", // Bottom of course (for routing)
    targetHandle: "top",  // Top of dependent course (for routing)
  },
];