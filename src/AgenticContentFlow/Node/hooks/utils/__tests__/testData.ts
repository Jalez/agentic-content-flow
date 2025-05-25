import { Node, Edge } from "@xyflow/react";
import { NodeData } from "../../../../types";

/**
 * Test data for horizontal connection scenarios
 */

// Base nodes for testing
export const testNodesForHorizontalConnections: Node<NodeData>[] = [
  {
    id: "node-a",
    type: "pagenode",
    position: { x: 100, y: 100 },
    data: {
      label: "Node A",
      details: "Test node A",
      level: "basic",
      subject: "test",
      depth: 0
    }
  },
  {
    id: "node-b", 
    type: "pagenode",
    position: { x: 300, y: 100 },
    data: {
      label: "Node B",
      details: "Test node B", 
      level: "basic",
      subject: "test",
      depth: 0
    }
  },
  {
    id: "node-c",
    type: "datanode",
    position: { x: 500, y: 100 },
    data: {
      label: "Node C",
      details: "Test data node C",
      level: "basic", 
      subject: "data",
      depth: 0
    }
  },
  {
    id: "node-d",
    type: "viewnode",
    position: { x: 700, y: 100 },
    data: {
      label: "Node D",
      details: "Test view node D",
      level: "basic",
      subject: "visualization", 
      depth: 0
    }
  }
];

// Test horizontal connections
export const testHorizontalEdges: Edge[] = [
  {
    id: "edge-a-b-horizontal",
    source: "node-a",
    target: "node-b", 
    sourceHandle: "right",
    targetHandle: "left"
  },
  {
    id: "edge-c-d-horizontal",
    source: "node-c",
    target: "node-d",
    sourceHandle: "right", 
    targetHandle: "left"
  }
];

// Test vertical connections (should not trigger invisible nodes)
export const testVerticalEdges: Edge[] = [
  {
    id: "edge-a-c-vertical",
    source: "node-a",
    target: "node-c",
    sourceHandle: "bottom",
    targetHandle: "top" 
  }
];

// Mixed connections for complex scenarios
export const testMixedEdges: Edge[] = [
  ...testHorizontalEdges,
  ...testVerticalEdges,
  {
    id: "edge-b-c-horizontal", 
    source: "node-b",
    target: "node-c",
    sourceHandle: "right",
    targetHandle: "left"
  }
];

// Nodes with existing LR containers
export const testNodesWithExistingLRContainers: Node<NodeData>[] = [
  {
    id: "container-lr-existing",
    type: "invisiblenode",
    position: { x: 50, y: 50 },
    data: {
      label: "LR Container",
      layoutDirection: "LR",
      isContainer: true,
      expanded: true,
      depth: 0,
      isParent: true,
      level: "basic",
      subject: "container"
    }
  },
  {
    id: "node-in-container-1",
    type: "pagenode", 
    position: { x: 100, y: 100 },
    parentId: "container-lr-existing",
    extent: "parent" as const,
    data: {
      label: "Node In Container 1",
      details: "Already in LR container",
      level: "basic",
      subject: "test", 
      depth: 1
    }
  },
  {
    id: "node-in-container-2",
    type: "pagenode",
    position: { x: 300, y: 100 },
    parentId: "container-lr-existing", 
    extent: "parent" as const,
    data: {
      label: "Node In Container 2", 
      details: "Already in LR container",
      level: "basic",
      subject: "test",
      depth: 1
    }
  },
  {
    id: "node-outside-container",
    type: "pagenode",
    position: { x: 500, y: 100 },
    data: {
      label: "Node Outside",
      details: "Not in any container",
      level: "basic", 
      subject: "test",
      depth: 0
    }
  }
];

// Edges for existing container scenario
export const testEdgesWithExistingContainer: Edge[] = [
  // Connection between nodes already in same LR container (should not create new container)
  {
    id: "edge-container-internal",
    source: "node-in-container-1", 
    target: "node-in-container-2",
    sourceHandle: "right",
    targetHandle: "left"
  },
  // Connection from container node to outside node (should add outside node to container)
  {
    id: "edge-container-to-outside",
    source: "node-in-container-2",
    target: "node-outside-container", 
    sourceHandle: "right",
    targetHandle: "left"
  }
];

// Test data for container merging scenario
export const testNodesForContainerMerging: Node<NodeData>[] = [
  // First LR container
  {
    id: "container-lr-1",
    type: "invisiblenode",
    position: { x: 50, y: 50 },
    data: {
      label: "LR Container 1",
      layoutDirection: "LR", 
      isContainer: true,
      expanded: true,
      depth: 0,
      isParent: true,
      level: "basic",
      subject: "container"
    }
  },
  {
    id: "node-container1-a",
    type: "pagenode",
    position: { x: 100, y: 100 },
    parentId: "container-lr-1",
    extent: "parent" as const,
    data: {
      label: "Container 1 Node A",
      details: "In first container", 
      level: "basic",
      subject: "test",
      depth: 1
    }
  },
  {
    id: "node-container1-b",
    type: "pagenode",
    position: { x: 200, y: 100 },
    parentId: "container-lr-1",
    extent: "parent" as const,
    data: {
      label: "Container 1 Node B",
      details: "Also in first container", 
      level: "basic",
      subject: "test",
      depth: 1
    }
  },
  // Second LR container  
  {
    id: "container-lr-2",
    type: "invisiblenode",
    position: { x: 350, y: 50 },
    data: {
      label: "LR Container 2",
      layoutDirection: "LR",
      isContainer: true, 
      expanded: true,
      depth: 0,
      isParent: true,
      level: "basic",
      subject: "container"
    }
  },
  {
    id: "node-container2-a", 
    type: "pagenode",
    position: { x: 400, y: 100 },
    parentId: "container-lr-2",
    extent: "parent" as const,
    data: {
      label: "Container 2 Node A",
      details: "In second container",
      level: "basic",
      subject: "test", 
      depth: 1
    }
  },
  {
    id: "node-container2-b", 
    type: "pagenode",
    position: { x: 500, y: 100 },
    parentId: "container-lr-2",
    extent: "parent" as const,
    data: {
      label: "Container 2 Node B",
      details: "Also in second container",
      level: "basic",
      subject: "test", 
      depth: 1
    }
  }
];

// Edge that should merge the two containers
export const testEdgeForContainerMerging: Edge[] = [
  {
    id: "edge-merge-containers",
    source: "node-container1-a",
    target: "node-container2-a",
    sourceHandle: "right", 
    targetHandle: "left"
  }
];

// Additional test data for drag-to-create scenarios
export const testNodesForDragToCreate: Node<NodeData>[] = [
  {
    id: "source-node-no-parent",
    type: "pagenode",
    position: { x: 100, y: 100 },
    data: {
      label: "Source Node",
      details: "Node without invisible parent",
      level: "basic",
      subject: "test",
      depth: 0
    }
  },
  {
    id: "container-lr-for-drag",
    type: "invisiblenode",
    position: { x: 250, y: 50 },
    data: {
      label: "LR Container For Drag",
      layoutDirection: "LR",
      isContainer: true,
      expanded: true,
      depth: 0,
      isParent: true,
      level: "basic",
      subject: "container"
    }
  },
  {
    id: "source-node-with-parent",
    type: "pagenode",
    position: { x: 300, y: 100 },
    parentId: "container-lr-for-drag",
    extent: "parent" as const,
    data: {
      label: "Source Node With Parent",
      details: "Node already in invisible container",
      level: "basic",
      subject: "test",
      depth: 1
    }
  }
];