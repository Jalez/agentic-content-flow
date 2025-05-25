import { Node, Edge } from "@xyflow/react";
import { NodeData } from "../../../types";
import { isHorizontalConnection, calculateInvisibleNodePosition } from "./invisibleNodeUtils";
import { createNodeFromTemplate } from "../../registry/nodeTypeRegistry";

interface ProcessedGraphData {
  nodes: Node<NodeData>[];
  edges: Edge[];
  newInvisibleNodes: Node<NodeData>[];
}

/**
 * Process initial graph data to automatically create invisible nodes for horizontal connections
 */
export const processInitialGraphData = (
  initialNodes: Node<NodeData>[],
  initialEdges: Edge[]
): ProcessedGraphData => {
  const processedNodes = [...initialNodes];
  const processedEdges = [...initialEdges];
  const newInvisibleNodes: Node<NodeData>[] = [];
  const nodeMap = new Map(initialNodes.map(node => [node.id, node]));
  
  // Group horizontal edges by their connected nodes
  const horizontalEdgeGroups = new Map<string, {
    nodes: Set<string>;
    edges: Edge[];
  }>();

  // Find all horizontal connections
  const horizontalEdges = initialEdges.filter(edge =>
    isHorizontalConnection(edge.sourceHandle, edge.targetHandle)
  );

  // Group connected horizontal nodes
  horizontalEdges.forEach(edge => {
    const sourceNode = nodeMap.get(edge.source);
    const targetNode = nodeMap.get(edge.target);
    
    if (!sourceNode || !targetNode) return;

    // Find existing group or create new one
    let groupKey: string | null = null;
    
    // Check if either node is already in a group
    for (const [key, group] of horizontalEdgeGroups) {
      if (group.nodes.has(edge.source) || group.nodes.has(edge.target)) {
        groupKey = key;
        break;
      }
    }

    if (groupKey) {
      // Add to existing group
      const group = horizontalEdgeGroups.get(groupKey)!;
      group.nodes.add(edge.source);
      group.nodes.add(edge.target);
      group.edges.push(edge);
    } else {
      // Create new group
      const newGroupKey = `group-${Date.now()}-${Math.random()}`;
      horizontalEdgeGroups.set(newGroupKey, {
        nodes: new Set([edge.source, edge.target]),
        edges: [edge]
      });
    }
  });

  // Create invisible containers for each group
  horizontalEdgeGroups.forEach((group, groupKey) => {
    const groupNodes = Array.from(group.nodes).map(id => nodeMap.get(id)).filter(Boolean) as Node<NodeData>[];
    
    if (groupNodes.length < 2) return;

    // Check if nodes already have a common LR invisible parent
    const parentIds = groupNodes.map(node => node.parentId).filter(Boolean) as string[];
    const uniqueParents = [...new Set(parentIds)];
    
    // If all nodes have the same parent and it's an LR invisible node, skip
    if (uniqueParents.length === 1 && uniqueParents[0]) {
      const commonParent = nodeMap.get(uniqueParents[0]);
      if (commonParent?.type === 'invisiblenode' && commonParent.data.layoutDirection === 'LR') {
        return;
      }
    }

    // Calculate position for the invisible container
    const containerPosition = calculateInvisibleNodePosition(groupNodes);
    
    // Create invisible container
    const containerId = `container-lr-auto-${Date.now()}-${groupKey}`;
    const invisibleContainer = createNodeFromTemplate('invisiblenode', {
      id: containerId,
      position: containerPosition,
      eventNode: groupNodes[0],
      label: 'LR Container',
      layoutDirection: 'LR',
      isContainer: true,
      expanded: true,
      depth: Math.min(...groupNodes.map(n => (typeof n.data.depth === 'number' ? n.data.depth : 0))),
      isParent: true
    });

    if (!invisibleContainer) return;

    // Determine the common parent for the container
    const commonAncestors = findCommonAncestor(groupNodes, nodeMap);
    if (commonAncestors) {
      invisibleContainer.parentId = commonAncestors;
      invisibleContainer.extent = "parent" as const;
    }

    newInvisibleNodes.push(invisibleContainer as Node<NodeData>);
    nodeMap.set(containerId, invisibleContainer as Node<NodeData>);

    // Update all nodes in the group to be children of the container
    group.nodes.forEach(nodeId => {
      const nodeIndex = processedNodes.findIndex(n => n.id === nodeId);
      if (nodeIndex >= 0) {
        processedNodes[nodeIndex] = {
          ...processedNodes[nodeIndex],
          parentId: containerId,
          extent: "parent" as const
        };
        nodeMap.set(nodeId, processedNodes[nodeIndex]);
      }
    });
  });

  return {
    nodes: [...processedNodes, ...newInvisibleNodes],
    edges: processedEdges,
    newInvisibleNodes
  };
};

/**
 * Find the common ancestor of a group of nodes
 */
const findCommonAncestor = (
  nodes: Node<NodeData>[],
  nodeMap: Map<string, Node<NodeData>>
): string | undefined => {
  if (nodes.length === 0) return undefined;
  if (nodes.length === 1) return nodes[0].parentId;

  // Get all parent chains
  const parentChains = nodes.map(node => getParentChain(node, nodeMap));
  
  // Find the common ancestor by comparing chains
  let commonAncestor: string | undefined = undefined;
  const shortestChain = parentChains.reduce((shortest, chain) => 
    chain.length < shortest.length ? chain : shortest
  );

  for (let i = 0; i < shortestChain.length; i++) {
    const candidate = shortestChain[i];
    const isCommon = parentChains.every(chain => chain.includes(candidate));
    
    if (isCommon) {
      commonAncestor = candidate;
      break;
    }
  }

  return commonAncestor;
};

/**
 * Get the parent chain for a node (from immediate parent to root)
 */
const getParentChain = (
  node: Node<NodeData>,
  nodeMap: Map<string, Node<NodeData>>
): string[] => {
  const chain: string[] = [];
  let currentNode = node;

  while (currentNode.parentId) {
    chain.push(currentNode.parentId);
    const parent = nodeMap.get(currentNode.parentId);
    if (!parent) break;
    currentNode = parent;
  }

  return chain;
};

/**
 * Validate that processed graph data maintains consistency
 */
export const validateProcessedGraphData = (
  processed: ProcessedGraphData
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const nodeIds = new Set(processed.nodes.map(n => n.id));

  // Check that all parent references are valid
  processed.nodes.forEach(node => {
    if (node.parentId && !nodeIds.has(node.parentId)) {
      errors.push(`Node ${node.id} has invalid parentId: ${node.parentId}`);
    }
  });

  // Check that all edge references are valid
  processed.edges.forEach(edge => {
    if (!nodeIds.has(edge.source)) {
      errors.push(`Edge ${edge.id} has invalid source: ${edge.source}`);
    }
    if (!nodeIds.has(edge.target)) {
      errors.push(`Edge ${edge.id} has invalid target: ${edge.target}`);
    }
  });

  // Check that horizontal connections are properly contained
  const horizontalEdges = processed.edges.filter(edge =>
    isHorizontalConnection(edge.sourceHandle, edge.targetHandle)
  );

  const nodeMap = new Map(processed.nodes.map(n => [n.id, n]));
  horizontalEdges.forEach(edge => {
    const sourceNode = nodeMap.get(edge.source);
    const targetNode = nodeMap.get(edge.target);
    
    if (sourceNode && targetNode) {
      // Check if they have a common LR invisible parent
      const sourceLRParent = findLRInvisibleParentInChain(sourceNode, nodeMap);
      const targetLRParent = findLRInvisibleParentInChain(targetNode, nodeMap);
      
      if (!sourceLRParent || !targetLRParent || sourceLRParent !== targetLRParent) {
        errors.push(`Horizontal edge ${edge.id} nodes are not properly contained in an LR invisible node`);
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Helper to find LR invisible parent in the parent chain
 */
const findLRInvisibleParentInChain = (
  node: Node<NodeData>,
  nodeMap: Map<string, Node<NodeData>>
): string | null => {
  let currentNode = node;
  
  while (currentNode.parentId) {
    const parent = nodeMap.get(currentNode.parentId);
    if (!parent) break;
    
    if (parent.type === 'invisiblenode' && parent.data.layoutDirection === 'LR') {
      return parent.id;
    }
    
    currentNode = parent;
  }
  
  return null;
};