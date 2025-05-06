import { Node } from "@xyflow/react";
import { NodeData } from "../../types";

// Course nodes (top-level container)
export const lmsParentNodesData: Array<Node> = [
  {
    id: "course-0",
    type: "pagenode",
    data: {
      label: "Course 0",
      details: "Main course container",
      level: "advanced",
      subject: "education",
      expanded: true
    },
    position: { x: 700, y: 100 },
  },
  {
    id: "instance-0",
    type: "pagenode",
    data: {
      label: "Instance 0",
      details: "First course instance",
      level: "intermediate",
      subject: "education",
      expanded: true
    },
    position: { x: 300, y: 200 },
    parentId: "course-0",
    extent: "parent",
  },
  {
    id: "instance-1",
    type: "pagenode",
    data: {
      label: "Instance 1",
      details: "Second course instance",
      level: "intermediate",
      subject: "education",
      expanded: true
    },
    position: { x: 900, y: 200 },
    parentId: "course-0",
    extent: "parent",
  },
  {
    id: "module-1-instance-0",
    type: "pagenode", 
    data: {
      label: "Module 1",
      details: "First module of Instance 0",
      level: "basic",
      subject: "education",
      expanded: true
    },
    position: { x: 300, y: 300 },
    parentId: "instance-0",
    extent: "parent",
  },
  {
    id: "module-2-instance-0",
    type: "pagenode", 
    data: {
      label: "Module 2",
      details: "Module 2 content",
      level: "basic",
      subject: "education",
      expanded: true
    },
    position: { x: 300, y: 450 },
    parentId: "instance-0",
    extent: "parent",
  },
  {
    id: "module-1-instance-1",
    type: "pagenode", 
    data: {
      label: "Module 1",
      details: "First module of Instance 1",
      level: "basic",
      subject: "education",
      expanded: false
    },
    position: { x: 800, y: 300 },
    parentId: "instance-1",
    extent: "parent",
  },
  {
    id: "module-2-instance-1",
    type: "pagenode", 
    data: {
      label: "Module 2",
      details: "Second module of Instance 1",
      level: "basic",
      subject: "education",
      expanded: false
    },
    position: { x: 1000, y: 300 },
    parentId: "instance-1",
    extent: "parent",
  },
  {
    id: "module-3-instance-1",
    type: "pagenode", 
    data: {
      label: "Module 3",
      details: "Third module of Instance 1",
      level: "basic",
      subject: "education",
      expanded: false
    },
    position: { x: 900, y: 500 },
    parentId: "instance-1",
    extent: "parent",
  },
  {
    id: "course-stats",
    type: "datanode",
    data: {
      label: "Course Stats",
      details: "Course analytics data",
      level: "advanced",
      subject: "data",
    },
    position: { x: 280, y: 350 },
  },
  {
    id: "course-1",
    type: "pagenode",
    data: {
      label: "Course 1",
      details: "Dependent course",
      level: "advanced",
      subject: "education"
    },
    position: { x: 550, y: 700 },
  },
  {
    id: "course-2",
    type: "pagenode",
    data: {
      label: "Course 2",
      details: "Optional dependent course",
      level: "advanced",
      subject: "education"
    },
    position: { x: 850, y: 700 },
  }
];

// Child nodes (data nodes, modules, conditional nodes)
export const lmsChildNodesData: Array<Node> = [
  {
    id: "data-module-1",
    type: "datanode",
    data: {
      label: "Data",
      details: "Module 1 database connection",
      level: "basic",
      subject: "data"
    },
    position: { x: 250, y: 340 },
    parentId: "module-1-instance-0",
    extent: "parent",
  },
  {
    id: "view-module-1",
    type: "viewnode",
    data: {
      label: "Module 1",
      details: "Module 1 visualization",
      level: "basic",
      subject: "visualization"
    },
    position: { x: 350, y: 340 },
    parentId: "module-1-instance-0",
    extent: "parent",
  },
  {
    id: "data-module-2",
    type: "datanode",
    data: {
      label: "Data 1",
      details: "Module 2 data source 1",
      level: "basic",
      subject: "data"
    },
    position: { x: 250, y: 500 },
    parentId: "module-2-instance-0",
    extent: "parent",
  },
  {
    id: "data-2-module-2",
    type: "datanode",
    data: {
      label: "Data 2",
      details: "Module 2 data source 2",
      level: "basic",
      subject: "data"
    },
    position: { x: 350, y: 500 },
    parentId: "module-2-instance-0",
    extent: "parent",
  },
  {
    id: "view-module-2",
    type: "viewnode",
    data: {
      label: "Module 2",
      details: "Module 2 visualization",
      level: "basic",
      subject: "visualization"
    },
    position: { x: 300, y: 550 },
    parentId: "module-2-instance-0",
    extent: "parent",
  },
  {
    id: "points-check",
    type: "conditionalnode",
    data: {
      label: "> 50% points",
      details: "Check if student has more than 50% points",
      level: "basic",
      subject: "logic"
    },
    position: { x: 900, y: 400 },
    parentId: "instance-1",
    extent: "parent",
  }
];

// Combined nodes for easy import - CRITICAL: parent nodes MUST come before child nodes
export const lmsNodesData = [...lmsParentNodesData, ...lmsChildNodesData];