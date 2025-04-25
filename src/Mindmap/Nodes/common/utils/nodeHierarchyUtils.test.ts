import { describe, it, expect, beforeEach } from 'vitest';
import { Node } from "@xyflow/react";
// Import only updateParentIdChildren
import { updateParentIdChildren } from "./nodeHierarchyUtils"; 

// Mock data for testing
const createMockNode = (id: string, expanded = false): Node => ({
  id,
  type: "default",
  position: { x: 0, y: 0 },
  data: { label: `Node ${id}`, expanded },
  hidden: false
});

describe("nodeHierarchyUtils", () => {
  describe("updateParentIdChildren", () => {
    let nodeMap: Map<string, Node>;
    let nodeParentIdMapWithChildIdSet: Map<string, Set<string>>;
    let root: Node, child1: Node, child2: Node, grandchild1: Node, grandchild2: Node, grandchild3: Node, grandchild4: Node;
    
    beforeEach(() => {
      // Set up a hierarchy:
      // root
      // ├── child1
      // │   ├── grandchild1
      // │   └── grandchild2
      // └── child2
      //     ├── grandchild3
      //     └── grandchild4

      root = createMockNode("root");
      child1 = createMockNode("child1");
      child2 = createMockNode("child2");
      grandchild1 = createMockNode("grandchild1");
      grandchild2 = createMockNode("grandchild2");
      grandchild3 = createMockNode("grandchild3");
      grandchild4 = createMockNode("grandchild4");
      
      // Create node map (id -> node)
      nodeMap = new Map();
      nodeMap.set("root", root);
      nodeMap.set("child1", child1);
      nodeMap.set("child2", child2);
      nodeMap.set("grandchild1", grandchild1);
      nodeMap.set("grandchild2", grandchild2);
      nodeMap.set("grandchild3", grandchild3);
      nodeMap.set("grandchild4", grandchild4);
      
      // Create parent-to-children map (parentId -> Set of childIds)
      nodeParentIdMapWithChildIdSet = new Map();
      nodeParentIdMapWithChildIdSet.set("root", new Set(["child1", "child2"]));
      nodeParentIdMapWithChildIdSet.set("child1", new Set(["grandchild1", "grandchild2"]));
      nodeParentIdMapWithChildIdSet.set("child2", new Set(["grandchild3", "grandchild4"]));
    });

    it("should hide direct children and recursively hide children of *expanded* children when collapsing", () => {
      // Make child1 expanded, child2 unexpanded
      child1.data.expanded = true;
      child2.data.expanded = false;
      
      // Prepare a root node that is currently expanded
      const rootNode = {
        ...root,
        data: { ...root.data, expanded: true }
      };
      
      // Collapse the node
      const result = updateParentIdChildren(rootNode, nodeMap, nodeParentIdMapWithChildIdSet, false);
      
      // Should return direct children (child1, child2) and grandchildren of expanded child1 (grandchild1, grandchild2)
      expect(result.length).toBe(4); 
      
      // All returned nodes should be hidden
      result.forEach(node => {
        expect(node.hidden).toBe(true);
      });
      
      // Verify we have the expected nodes
      const nodeIds = result.map(node => node.id);
      expect(nodeIds).toContain("child1");
      expect(nodeIds).toContain("child2");
      expect(nodeIds).toContain("grandchild1");
      expect(nodeIds).toContain("grandchild2");
      // Grandchildren of unexpanded child2 should NOT be included
      expect(nodeIds).not.toContain("grandchild3"); 
      expect(nodeIds).not.toContain("grandchild4");
    });

    it("should show only direct children when expanding an unexpanded node (children also unexpanded)", () => {
      // All children are unexpanded by default in beforeEach
      
      // Prepare a root node that is currently collapsed
      const rootNode = {
        ...root,
        data: { ...root.data, expanded: false }
      };
      
      // Expand the node
      const result = updateParentIdChildren(rootNode, nodeMap, nodeParentIdMapWithChildIdSet, true);
      
      // Should only return direct children (2) since they are not expanded
      expect(result.length).toBe(2);
      
      // All returned nodes should be visible
      result.forEach(node => {
        expect(node.hidden).toBe(false);
      });
      
      // Verify we only have the direct children
      const nodeIds = result.map(node => node.id);
      expect(nodeIds).toContain("child1");
      expect(nodeIds).toContain("child2");
      expect(nodeIds).not.toContain("grandchild1");
      expect(nodeIds).not.toContain("grandchild2");
      expect(nodeIds).not.toContain("grandchild3");
      expect(nodeIds).not.toContain("grandchild4");
    });

    it("should show direct children and recursively show children of *expanded* children when expanding", () => {
      // Make only child1 expanded
      child1.data.expanded = true;
      child2.data.expanded = false;
      
      // Prepare a root node that is currently collapsed
      const rootNode = {
        ...root,
        data: { ...root.data, expanded: false }
      };
      
      // Expand the parent node
      const result = updateParentIdChildren(rootNode, nodeMap, nodeParentIdMapWithChildIdSet, true);
      
      // We should have: 2 direct children + 2 grandchildren from expanded child1
      expect(result.length).toBe(4);
      
      // All returned nodes should be visible
      result.forEach(node => {
        expect(node.hidden).toBe(false);
      });
      
      // Validate that the grandchildren from child1 (expanded) are included
      // but not from child2 (unexpanded)
      const nodeIds = result.map(node => node.id);
      expect(nodeIds).toContain("child1");
      expect(nodeIds).toContain("child2");
      expect(nodeIds).toContain("grandchild1");
      expect(nodeIds).toContain("grandchild2");
      expect(nodeIds).not.toContain("grandchild3");
      expect(nodeIds).not.toContain("grandchild4");
    });
    
    it("should return empty array if parent is not in nodeParentMap", () => {
      const unknownNode = createMockNode("unknown");
      
      const result = updateParentIdChildren(unknownNode, nodeMap, nodeParentIdMapWithChildIdSet, true);
      
      expect(result).toEqual([]);
    });

    it("should hide direct children and recursively hide children of *all expanded* children when collapsing", () => {
      // Both child1 and child2 are expanded
      child1.data.expanded = true;
      child2.data.expanded = true;
      
      // Prepare a root node that is currently expanded
      const rootNode = {
        ...root,
        data: { ...root.data, expanded: true }
      };
      
      // Collapse the node
      const result = updateParentIdChildren(rootNode, nodeMap, nodeParentIdMapWithChildIdSet, false);
      
      // Should return all 6 nodes (2 children + 4 grandchildren) because both children were expanded
      expect(result.length).toBe(6);
      
      // ALL returned nodes should be hidden
      result.forEach(node => {
        expect(node.hidden).toBe(true);
      });
      
      // Make sure we have all the expected nodes
      const nodeIds = result.map(node => node.id);
      expect(nodeIds).toContain("child1");
      expect(nodeIds).toContain("child2");
      expect(nodeIds).toContain("grandchild1");
      expect(nodeIds).toContain("grandchild2");
      expect(nodeIds).toContain("grandchild3");
      expect(nodeIds).toContain("grandchild4");
    });

    // Verify that when child nodes are hidden by parent being collapsed,
    // they maintain their own internal expanded/collapsed state
    it("should not change the expanded state of children when hiding/showing them", () => {
      // Set initial expanded state: child1 is expanded, child2 is not
      child1.data.expanded = true;
      child2.data.expanded = false;
      
      const rootNode = {
        ...root,
        data: { ...root.data, expanded: true } // Start with expanded root
      };
      
      // First collapse the root node
      const collapsedResults = updateParentIdChildren(rootNode, nodeMap, nodeParentIdMapWithChildIdSet, false);
      
      // Verify children are hidden but expanded state is preserved
      const child1Result = collapsedResults.find(node => node.id === "child1");
      const child2Result = collapsedResults.find(node => node.id === "child2");
      
      expect(child1Result?.hidden).toBe(true);
      expect(child1Result?.data.expanded).toBe(true); // Still expanded internally
      
      expect(child2Result?.hidden).toBe(true);
      expect(child2Result?.data.expanded).toBe(false); // Still collapsed internally

      // Now expand the root again
      const expandedResults = updateParentIdChildren(rootNode, nodeMap, nodeParentIdMapWithChildIdSet, true);
      
      // Verify children are visible and expanded state is still preserved
      const child1Expanded = expandedResults.find(node => node.id === "child1");
      const child2Expanded = expandedResults.find(node => node.id === "child2");
      
      expect(child1Expanded?.hidden).toBe(false);
      expect(child1Expanded?.data.expanded).toBe(true); // Still expanded
      
      expect(child2Expanded?.hidden).toBe(false);
      expect(child2Expanded?.data.expanded).toBe(false); // Still collapsed
    });
    
    // Verify that when a parent is collapsed, its children's visibility isn't considered for the result
    it("should not include children of collapsed parents in the results", () => {
      // Setup a test case where child1 is collapsed and has its own expanded children
      child1.data.expanded = false; // child1 is collapsed
      child2.data.expanded = true;  // child2 is expanded
      
      // Let's assume grandchild1 was previously expanded 
      grandchild1.data.expanded = true;
      
      const rootNode = {
        ...root,
        data: { ...root.data, expanded: true } // Root starts expanded
      };
      
      // Collapse the root
      const result = updateParentIdChildren(rootNode, nodeMap, nodeParentIdMapWithChildIdSet, false);
      
      // We should have:
      // - Both direct children (child1, child2)
      // - Grandchildren of expanded child2 (grandchild3, grandchild4)
      // - BUT NOT grandchildren of collapsed child1, even though grandchild1 was "expanded"
      expect(result.length).toBe(4);
      
      const nodeIds = result.map(node => node.id);
      expect(nodeIds).toContain("child1");
      expect(nodeIds).toContain("child2");
      expect(nodeIds).not.toContain("grandchild1"); // Not included because child1 is collapsed
      expect(nodeIds).not.toContain("grandchild2"); // Not included because child1 is collapsed
      expect(nodeIds).toContain("grandchild3");     // Included because child2 is expanded
      expect(nodeIds).toContain("grandchild4");     // Included because child2 is expanded
      
      // All returned nodes should be hidden
      result.forEach(node => {
        expect(node.hidden).toBe(true);
      });
    });
  });
});