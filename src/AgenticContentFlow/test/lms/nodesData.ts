import { Node } from "@xyflow/react";

// Course nodes (top-level container)
export const lmsParentNodesData: Array<Node> = [
  {
    id: 'container-course-lr-lms', // ID for the container
    type: 'invisiblenode', 
    position: { x: 0, y: 0 }, // Initial position doesn't matter, layout will set it
    data: {
      label: 'LR Container',
      // *** Set data property to tell getContainerLayoutDirection this should be LR ***
      layoutDirection: 'LR', // Your getContainerLayoutDirection helper should look for this
      isContainer: true, // Or use a type check in isContainer
      expanded: true

    },
    style: { width: 250, height: 100 }, // Container needs initial dimensions for rendering
  },
  {
    id: "course-0-lms",
    type: "pagenode",
    data: {
      label: "Course 0",
      details: "Main course container",
      level: "advanced",
      subject: "education",
      expanded: true,
      depth: 0,
      isParent: true // Explicitly mark this node as a parent
    },
    position: { x: 700, y: 100 },
    parentId: "container-course-lr-lms", // *** Set the parentId ***
    extent: "parent",
  },

  {
    id: "instance-0",
    type: "pagenode",
    data: {
      label: "Instance 0",
      details: "First course instance",
      level: "intermediate",
      subject: "education",
      expanded: true,
      depth: 1,
      isParent: true // Explicitly mark this node as a parent
    },
    position: { x: 300, y: 200 },
    parentId: "course-0-lms",
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
      expanded: true,
      depth: 1,
      isParent: true // Explicitly mark this node as a parent
      
    },
    position: { x: 900, y: 200 },
    parentId: "course-0-lms",
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
      expanded: true,
      depth: 2,
      isParent: true // Explicitly mark this node as a parent
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
      expanded: true,
      depth: 2,
      isParent: true // Explicitly mark this node as a parent
    },
    position: { x: 300, y: 450 },
    parentId: "instance-0",
    extent: "parent",
  },
  {
    id: 'container-instance-1-module-1-data-lr', // ID for the container
    type: 'invisiblenode', 
    position: { x: 0, y: 0 }, // Initial position doesn't matter, layout will set it
    data: {
      label: 'LR Container',
      // *** Set data property to tell getContainerLayoutDirection this should be LR ***
      layoutDirection: 'LR', // Your getContainerLayoutDirection helper should look for this
      isContainer: true, // Or use a type check in isContainer
      expanded: true,
      depth: 3,
      isParent: true // Explicitly mark this node as a parent

    },
    style: { width: 250, height: 100 }, // Container needs initial dimensions for rendering
    parentId: "module-1-instance-0", // Set the parentId to the course node
    extent: "parent",
  },
  {
    id: 'container-instance-0-module-2-data-lr', // ID for the container
    type: 'invisiblenode', 
    position: { x: 0, y: 0 }, // Initial position doesn't matter, layout will set it
    data: {
      label: 'LR Container',
      // *** Set data property to tell getContainerLayoutDirection this should be LR ***
      layoutDirection: 'LR', // Your getContainerLayoutDirection helper should look for this
      isContainer: true, // Or use a type check in isContainer
      expanded: true,
      depth: 3,
      isParent: true // Explicitly mark this node as a parent

    },
    style: { width: 250, height: 100 }, // Container needs initial dimensions for rendering
    parentId: "module-2-instance-0", // Set the parentId to the course node
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
      expanded: false,
      depth: 2,
      isParent: true // Explicitly mark this node as a parent
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
      expanded: false,
      depth: 2,
      isParent: true // Explicitly mark this node as a parent
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
      expanded: false,
      depth: 2,
      isParent: true // Explicitly mark this node as a parent
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
      depth: 0,
      isParent: true // Explicitly mark this node as a parent
    },
    position: { x: 280, y: 350 },
    parentId: "container-course-lr-lms", // Set the parentId to the container
    extent: "parent",
  },
  {
    id: "course-1",
    type: "pagenode",
    data: {
      label: "Course 1",
      details: "Dependent course",
      level: "advanced",
      subject: "education",
      depth: 0,
      isParent: true // Explicitly mark this node as a parent
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
      subject: "education",
      depth: 0,
      isParent: true // Explicitly mark this node as a parent
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
      subject: "data",
      depth: 3,
      isParent: true // Explicitly mark this node as a parent
    },
    position: { x: 250, y: 340 },
    parentId: "container-instance-1-module-1-data-lr",
    extent: "parent",
  },
  {
    id: "view-module-1",
    type: "viewnode",
    data: {
      label: "Module 1",
      details: "Module 1 visualization",
      level: "basic",
      subject: "visualization",
      depth: 3,
      isParent: true // Explicitly mark this node as a parent
    },
    position: { x: 350, y: 340 },
    parentId: "container-instance-1-module-1-data-lr",
    extent: "parent",
  },
  {
    id: "data-module-2",
    type: "datanode",
    data: {
      label: "Data 1",
      details: "Module 2 data source 1",
      level: "basic",
      subject: "data",
      depth: 3,
      isParent: true // Explicitly mark this node as a parent
    },
    position: { x: 250, y: 500 },
    parentId: "container-instance-0-module-2-data-lr",
    extent: "parent",
  },
  {
    id: "data-2-module-2",
    type: "datanode",
    data: {
      label: "Data 2",
      details: "Module 2 data source 2",
      level: "basic",
      subject: "data",
      depth: 3,
      isParent: true // Explicitly mark this node as a parent
    },
    position: { x: 350, y: 500 },
    parentId: "container-instance-0-module-2-data-lr",
    extent: "parent",
  },
  {
    id: "view-module-2",
    type: "viewnode",
    data: {
      label: "Module 2",
      details: "Module 2 visualization",
      level: "basic",
      subject: "visualization",
      depth: 3,
      isParent: true // Explicitly mark this node as a parent
    },
    position: { x: 300, y: 550 },
    parentId: "container-instance-0-module-2-data-lr",
    extent: "parent",
  },
  {
    id: "points-check",
    type: "conditionalnode",
    data: {
      label: "> 50% points",
      details: "Check if student has more than 50% points",
      level: "basic",
      subject: "logic",
      depth: 3,
    },
    position: { x: 900, y: 400 },
    parentId: "instance-1",
    extent: "parent",
  }
];

// Combined nodes for easy import - CRITICAL: parent nodes MUST come before child nodes
export const lmsNodesData = [...lmsParentNodesData, ...lmsChildNodesData];