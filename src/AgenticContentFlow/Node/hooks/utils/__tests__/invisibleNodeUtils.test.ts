/**
 * Unit tests for invisible node utility functions
 */
import { describe, test, expect, beforeEach } from 'vitest';
import { Node, Edge } from '@xyflow/react';
import { NodeData } from '../../../../types';
import {

  removeInvisibleNodeAndReparentChildren,
  shouldCreateInvisibleContainer
} from '../invisibleNodeUtils';
import {
  testNodesForHorizontalConnections,
  testNodesWithExistingLRContainers,
  testNodesForContainerMerging,
} from './testData';
import { calculateInitialContainerNodePosition, getNodeParentIfType, getSiblingNodes } from '../nodeUtils';
import { createNodeFromTemplate } from '@/AgenticContentFlow/Node/registry/nodeTypeRegistry';

describe('invisibleNodeUtils', () => {

  describe('getNodeParentIfType', () => {
    let nodeMap: Map<string, Node<NodeData>>;

    beforeEach(() => {
      nodeMap = new Map(testNodesWithExistingLRContainers.map(node => [node.id, node]));
    });

    test('should find LR invisible parent', () => {
      const parent = getNodeParentIfType('node-in-container-1', nodeMap, 'invisiblenode');
      expect(parent?.id).toBe('container-lr-existing');
      expect(parent?.data.layoutDirection).toBe('LR');
    });

    test('should return null for nodes without LR parent', () => {
      const parent = getNodeParentIfType('node-outside-container', nodeMap, 'invisiblenode');
      expect(parent).toBeNull();
    });

    test('should return null for non-existent nodes', () => {
      const parent = getNodeParentIfType('non-existent', nodeMap, 'invisiblenode');
      expect(parent).toBeNull();
    });
  });

  describe('createInvisibleNodeForHorizontalConnection', () => {
    test('should create LR invisible container with correct properties', () => {
      const container = createNodeFromTemplate("invisiblenode", {
        id: `invisible-${Date.now()}`,
        position: { x: 0, y: 0 },
        data: {
        }
      });

      expect(container).not.toBeNull();
      expect(container?.type).toBe('invisiblenode');
      expect(container?.data.layoutDirection).toBe('LR');
      expect(container?.data.isContainer).toBe(true);
      expect(container?.data.expanded).toBe(true);
      expect(container?.data.isParent).toBe(true);
    });

    test('should use custom position if provided', () => {
      const customPosition = { x: 500, y: 600 };
      const container = createNodeFromTemplate("invisiblenode", {
        id: `invisible-${Date.now()}`,
        position: customPosition,
      });

      expect(container?.position).toEqual(customPosition);
    });

    test('should set depth based on base node', () => {
      const container = createNodeFromTemplate("invisiblenode", {
        id: `invisible-${Date.now()}`,
        position: { x: 0, y: 0 },
        data: {
          depth: 2
        }
      });

      expect(container?.data.depth).toBe(2);
    });
  });

  describe('calculateInvisibleNodePosition', () => {
    test('should calculate position with padding', () => {
      const nodes = [
        { ...testNodesForHorizontalConnections[0], position: { x: 100, y: 200 } },
        { ...testNodesForHorizontalConnections[1], position: { x: 300, y: 150 } }
      ];

      const position = calculateInitialContainerNodePosition(nodes);
      expect(position.x).toBe(50); // min x (100) - 50 padding
      expect(position.y).toBe(100); // min y (150) - 50 padding
    });

    test('should handle empty node array', () => {
      const position = calculateInitialContainerNodePosition([]);
      expect(position).toEqual({ x: 0, y: 0 });
    });
  });

  describe('getSiblingNodes', () => {
    let nodeMap: Map<string, Node<NodeData>>;
    let parentIdMap: Map<string, Set<string>>;

    beforeEach(() => {
      nodeMap = new Map(testNodesWithExistingLRContainers.map(node => [node.id, node]));
      
      // Create parent-child mapping
      parentIdMap = new Map();
      testNodesWithExistingLRContainers.forEach(node => {
        if (node.parentId) {
          if (!parentIdMap.has(node.parentId)) {
            parentIdMap.set(node.parentId, new Set());
          }
          parentIdMap.get(node.parentId)!.add(node.id);
        }
      });
    });

    test('should return sibling nodes', () => {
      const siblings = getSiblingNodes('node-in-container-1', nodeMap, parentIdMap);
      expect(siblings).toHaveLength(1);
      expect(siblings[0].id).toBe('node-in-container-2');
    });

    test('should return empty array for nodes without siblings', () => {
      const siblings = getSiblingNodes('node-outside-container', nodeMap, parentIdMap);
      expect(siblings).toHaveLength(0);
    });

    test('should return empty array for nodes without parent', () => {
      const siblings = getSiblingNodes('container-lr-existing', nodeMap, parentIdMap);
      expect(siblings).toHaveLength(0);
    });
  });

  describe('removeInvisibleNodeAndReparentChildren', () => {
    let nodeMap: Map<string, Node<NodeData>>;
    let parentIdMap: Map<string, Set<string>>;

    beforeEach(() => {
      nodeMap = new Map(testNodesWithExistingLRContainers.map(node => [node.id, node]));
      
      // Create parent-child mapping
      parentIdMap = new Map();
      testNodesWithExistingLRContainers.forEach(node => {
        if (node.parentId) {
          if (!parentIdMap.has(node.parentId)) {
            parentIdMap.set(node.parentId, new Set());
          }
          parentIdMap.get(node.parentId)!.add(node.id);
        }
      });
    });

    test('should reparent children with new parent', () => {
      const updatedNodes = removeInvisibleNodeAndReparentChildren(
        'container-lr-existing',
        'new-parent',
        nodeMap,
        parentIdMap
      );

      expect(updatedNodes).toHaveLength(2);
      expect(updatedNodes.every(node => node.parentId === 'new-parent')).toBe(true);
      expect(updatedNodes.every(node => node.extent === 'parent')).toBe(true);
    });

    test('should reparent children to root level', () => {
      const updatedNodes = removeInvisibleNodeAndReparentChildren(
        'container-lr-existing',
        undefined,
        nodeMap,
        parentIdMap
      );

      expect(updatedNodes).toHaveLength(2);
      expect(updatedNodes.every(node => node.parentId === undefined)).toBe(true);
      expect(updatedNodes.every(node => node.extent === undefined)).toBe(true);
    });
  });

  describe('shouldCreateInvisibleContainer', () => {
    test('should return true for horizontal connections between uncontained nodes', () => {
      const sourceNode = testNodesForHorizontalConnections[0];
      const targetNode = testNodesForHorizontalConnections[1];
      const edge: Edge = {
        id: 'test',
        source: sourceNode.id,
        target: targetNode.id,
        sourceHandle: 'right',
        targetHandle: 'left'
      };

      const result = shouldCreateInvisibleContainer(sourceNode, targetNode, edge);
      expect(result).toBe(true);
    });

    test('should return false for vertical connections', () => {
      const sourceNode = testNodesForHorizontalConnections[0];
      const targetNode = testNodesForHorizontalConnections[1];
      const edge: Edge = {
        id: 'test',
        source: sourceNode.id,
        target: targetNode.id,
        sourceHandle: 'bottom',
        targetHandle: 'top'
      };

      const result = shouldCreateInvisibleContainer(sourceNode, targetNode, edge);
      expect(result).toBe(false);
    });

    test('should return false for nodes already in same LR container', () => {
      const sourceNode = testNodesWithExistingLRContainers.find(n => n.id === 'node-in-container-1')!;
      const targetNode = testNodesWithExistingLRContainers.find(n => n.id === 'node-in-container-2')!;
      const edge: Edge = {
        id: 'test',
        source: sourceNode.id,
        target: targetNode.id,
        sourceHandle: 'right',
        targetHandle: 'left'
      };

      const result = shouldCreateInvisibleContainer(sourceNode, targetNode, edge);
      expect(result).toBe(false);
    });

    test('should return false when source has LR parent but target does not (add to existing scenario)', () => {
      const sourceNode = testNodesWithExistingLRContainers.find(n => n.id === 'node-in-container-1')!;
      const targetNode = testNodesWithExistingLRContainers.find(n => n.id === 'node-outside-container')!;
      const edge: Edge = {
        id: 'test',
        source: sourceNode.id,
        target: targetNode.id,
        sourceHandle: 'right',
        targetHandle: 'left'
      };

      const result = shouldCreateInvisibleContainer(sourceNode, targetNode, edge);
      expect(result).toBe(false);
    });

    test('should return false when target has LR parent but source does not (add to existing scenario)', () => {
      const sourceNode = testNodesWithExistingLRContainers.find(n => n.id === 'node-outside-container')!;
      const targetNode = testNodesWithExistingLRContainers.find(n => n.id === 'node-in-container-1')!;
      const edge: Edge = {
        id: 'test',
        source: sourceNode.id,
        target: targetNode.id,
        sourceHandle: 'right',
        targetHandle: 'left'
      };

      const result = shouldCreateInvisibleContainer(sourceNode, targetNode, edge);
      expect(result).toBe(false);
    });

    test('should return false when both nodes have different LR parents (merge scenario)', () => {
      const sourceNode = testNodesForContainerMerging.find(n => n.id === 'node-container1-a')!;
      const targetNode = testNodesForContainerMerging.find(n => n.id === 'node-container2-a')!;
      const edge: Edge = {
        id: 'test',
        source: sourceNode.id,
        target: targetNode.id,
        sourceHandle: 'right',
        targetHandle: 'left'
      };

      const result = shouldCreateInvisibleContainer(sourceNode, targetNode, edge);
      expect(result).toBe(false);
    });
  });
});