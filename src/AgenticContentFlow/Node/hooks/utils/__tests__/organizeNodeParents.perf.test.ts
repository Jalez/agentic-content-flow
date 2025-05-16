import { describe, it, expect } from 'vitest';
import { Node } from '@xyflow/react';
import { NodeData } from '../../../../types';
import { getOrganizedNodeParents } from '../../../store/utils/getOrganizedNodeParents';

/**
 * Original implementation of getOrganizedNodeParents without optimization
 * Used for performance comparison
 */
const getOrganizedNodeParentsOriginal = (
  parentIdWithChildren: Map<string, Node<NodeData>[]>,
  poolOfAllNodes: Map<string, Node<NodeData>>,
): Node[] => {
  // Helper to compute how many levels a node is from the root
  const getLevelFromRoot = (nodeId: string, visited = new Set<string>()): number => {
    if (visited.has(nodeId)) return 0; // Prevent cycles
    visited.add(nodeId);

    const node = poolOfAllNodes.get(nodeId);
    if (!node?.parentId) return 0; // Root level
    if (!poolOfAllNodes.has(node.parentId)) return 0; // Parent doesn't exist

    // Add 1 to parent's level (recursively)
    return 1 + getLevelFromRoot(node.parentId, new Set(visited));
  };

  // Get all parent node IDs (keys of parentIdWithChildren)
  const parentIds = Array.from(parentIdWithChildren.keys());
  // Map each parent node to its level from root
  const parentLevels = parentIds
    .map(id => ({
      node: poolOfAllNodes.get(id),
      level: getLevelFromRoot(id)
    }))
    .filter(entry => entry.node);

  // Sort by level ascending (root first), then by ID for stability
  parentLevels.sort((a, b) => {
    const levelDiff = a.level - b.level;
    return levelDiff !== 0 ? levelDiff : a.node!.id.localeCompare(b.node!.id);
  });
  
  return parentLevels.map(entry => entry.node!);
};

// Helper to create random test node
const createNode = (
  id: string,
  parentId?: string
): Node<NodeData> => ({
  id,
  type: 'default',
  position: { x: 0, y: 0 },
  data: { label: `Node ${id}` },
  parentId
});

/**
 * Generate a hierarchical structure of nodes with the given depth and branching factor
 * @param depth How many levels deep the tree should go
 * @param branchingFactor How many children each node should have
 * @returns Maps needed for organizing nodes
 */
const generateNodeHierarchy = (depth: number, branchingFactor: number) => {
  const poolOfAllNodes = new Map<string, Node<NodeData>>();
  const parentIdWithChildren = new Map<string, Node<NodeData>[]>();
  
  // Create root node
  const rootNode = createNode('root');
  poolOfAllNodes.set('root', rootNode);
  parentIdWithChildren.set('root', []);
  
  // Helper function to recursively generate children
  const generateChildren = (parentId: string, currentDepth: number) => {
    if (currentDepth >= depth) return;
    
    const childrenArray: Node<NodeData>[] = [];
    for (let i = 0; i < branchingFactor; i++) {
      const childId = `${parentId}-child-${i}`
      const childNode = createNode(childId, parentId);
      
      poolOfAllNodes.set(childId, childNode);
      childrenArray.push(childNode);
      
      // Create an entry for this child if it's not at the max depth
      if (currentDepth < depth - 1) {
        parentIdWithChildren.set(childId, []);
        generateChildren(childId, currentDepth + 1);
      }
    }
    
    // Add all children to the parent's entry
    parentIdWithChildren.get(parentId)?.push(...childrenArray);
  };
  
  // Generate the hierarchy starting from the root
  generateChildren('root', 0);
  
  return { poolOfAllNodes, parentIdWithChildren };
};

// Helper function to convert array-based parent-child map to Set-based map
const convertToSetMap = (arrayMap: Map<string, Node<NodeData>[]>): Map<string, Set<string>> => {
  const setMap = new Map<string, Set<string>>();
  
  // Ensure we include an entry for each parent, even if it has no children
  arrayMap.forEach((_, parentId) => {
    if (!setMap.has(parentId)) {
      setMap.set(parentId, new Set<string>());
    }
  });
  
  // Now add all child relationships
  arrayMap.forEach((children, parentId) => {
    const childIdSet = setMap.get(parentId) || new Set<string>();
    children.forEach((child: Node<NodeData>) => childIdSet.add(child.id));
    setMap.set(parentId, childIdSet);
  });
  
  // Add "no-parent" entry which is expected by the implementation
  if (!setMap.has("no-parent")) {
    setMap.set("no-parent", new Set<string>());
  }
  
  return setMap;
};

/**
 * Time the execution of a function
 * @param fn Function to time
 * @returns The result and time taken in milliseconds
 */
const timeExecution = <T>(fn: () => T): { result: T, timeMs: number } => {
  const start = performance.now();
  const result = fn();
  const timeMs = performance.now() - start;
  return { result, timeMs };
};

describe('getOrganizedNodeParents performance', () => {
  it('should handle small hierarchies efficiently', () => {
    // Small hierarchy: depth 3, branching 3 (1 root + 3 + 9 + 27 = 40 nodes total)
    const { poolOfAllNodes, parentIdWithChildren } = generateNodeHierarchy(3, 3);
    const setBasedMap = convertToSetMap(parentIdWithChildren);
    
    // Time both implementations
    const originalTime = timeExecution(() => 
      getOrganizedNodeParentsOriginal(parentIdWithChildren, poolOfAllNodes));
    const optimizedTime = timeExecution(() => 
      getOrganizedNodeParents(setBasedMap, poolOfAllNodes));
    
    // Verify both implementations return the same result
    expect(optimizedTime.result.map(node => node.id).sort())
      .toEqual(originalTime.result.map(node => node.id).sort());
  });

  it('should handle medium hierarchies with significant performance improvement', () => {
    // Medium hierarchy: depth 4, branching 4 (1 + 4 + 16 + 64 + 256 = 341 nodes total)
    const { poolOfAllNodes, parentIdWithChildren } = generateNodeHierarchy(4, 4);
    const setBasedMap = convertToSetMap(parentIdWithChildren);
    
    // Time both implementations
    const originalTime = timeExecution(() => 
      getOrganizedNodeParentsOriginal(parentIdWithChildren, poolOfAllNodes));
    const optimizedTime = timeExecution(() => 
      getOrganizedNodeParents(setBasedMap, poolOfAllNodes));
    
    // Verify both implementations return the same result
    expect(optimizedTime.result.map(node => node.id).sort())
      .toEqual(originalTime.result.map(node => node.id).sort());
  });

  it('should handle large hierarchies much more efficiently', () => {
    // Large hierarchy: depth 5, branching 5 (1 + 5 + 25 + 125 + 625 + 3125 = 3906 nodes total)
    const { poolOfAllNodes, parentIdWithChildren } = generateNodeHierarchy(5, 5);
    const setBasedMap = convertToSetMap(parentIdWithChildren);
    
    // Time both implementations
    const originalTime = timeExecution(() => 
      getOrganizedNodeParentsOriginal(parentIdWithChildren, poolOfAllNodes));
    const optimizedTime = timeExecution(() => 
      getOrganizedNodeParents(setBasedMap, poolOfAllNodes));
    
    // Verify both implementations return the same result
    expect(optimizedTime.result.map(node => node.id).sort())
      .toEqual(originalTime.result.map(node => node.id).sort());
  });

  it('should handle hierarchies with shared paths efficiently', () => {
    // Create a hierarchy with multiple paths leading to the same nodes
    const poolOfAllNodes = new Map<string, Node<NodeData>>();
    const parentIdWithChildren = new Map<string, Node<NodeData>[]>();
    
    // Create a diamond pattern: root → (A, B) → C
    const root = createNode('root');
    const nodeA = createNode('A', 'root');
    const nodeB = createNode('B', 'root');
    const nodeC = createNode('C', 'A'); // C has A as parent
    nodeC.parentId = 'A'; // Explicitly set to ensure it's there
    
    // Add nodes to pool
    poolOfAllNodes.set('root', root);
    poolOfAllNodes.set('A', nodeA);
    poolOfAllNodes.set('B', nodeB);
    poolOfAllNodes.set('C', nodeC);
    
    // Setup parent-child relationships
    parentIdWithChildren.set('root', [nodeA, nodeB]);
    parentIdWithChildren.set('A', [nodeC]);
    parentIdWithChildren.set('B', [nodeC]); // This creates the shared path
    parentIdWithChildren.set('C', []);
    
    // Add more complex shared paths
    for (let i = 0; i < 100; i++) {
      const id = `shared-${i}`;
      const node = createNode(id, 'C');
      poolOfAllNodes.set(id, node);
      parentIdWithChildren.get('C')!.push(node);
      
      // Make each of these nodes a parent too
      parentIdWithChildren.set(id, []);
      
      // Add children to these nodes that reference other parts of the tree
      const childId = `shared-child-${i}`;
      const childNode = createNode(childId, id);
      poolOfAllNodes.set(childId, childNode);
      parentIdWithChildren.get(id)!.push(childNode);
      
      // Make 25% of them reference back to higher nodes (creates many shared paths)
      if (i % 4 === 0) {
        const deepSharedId = `deep-shared-${i}`;
        const deepNode = createNode(deepSharedId, 'root');
        poolOfAllNodes.set(deepSharedId, deepNode);
        parentIdWithChildren.get('root')!.push(deepNode);
        parentIdWithChildren.get(id)!.push(deepNode); // Creates complex shared paths
      }
    }
    
    const setBasedMap = convertToSetMap(parentIdWithChildren);
    
    // Time both implementations
    const originalTime = timeExecution(() => 
      getOrganizedNodeParentsOriginal(parentIdWithChildren, poolOfAllNodes));
    const optimizedTime = timeExecution(() => 
      getOrganizedNodeParents(setBasedMap, poolOfAllNodes));

    // Verify both implementations return the same result
    expect(optimizedTime.result.map(node => node.id).sort())
      .toEqual(originalTime.result.map(node => node.id).sort());
  });
});