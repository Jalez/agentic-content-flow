/**
 * Integration tests for invisible node operations hook
 */
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Node, Edge } from '@xyflow/react';
import { NodeData } from '../../../types';

// Import and call node type registration BEFORE setting up mocks
import { ensureNodeTypesRegistered } from '../../../Nodes/registerBasicNodeTypes';

// Register node types immediately
ensureNodeTypesRegistered();

// Mock the dependencies AFTER registering node types
const mockAddNode = vi.fn();
const mockUpdateNode = vi.fn();
const mockRemoveNodes = vi.fn();
const mockWithTransaction = vi.fn((callback) => callback());

// Create mock node map
let mockNodeMap: Map<string, Node<NodeData>>;
let mockParentIdMap: Map<string, Set<string>>;

// Mock the context hooks with correct paths
vi.mock('../../store/useNodeContext', () => ({
  useNodeContext: () => ({
    addNode: mockAddNode,
    updateNode: mockUpdateNode,
    removeNodes: mockRemoveNodes,
    nodeMap: mockNodeMap,
    nodeParentIdMapWithChildIdSet: mockParentIdMap
  })
}));

vi.mock('../../../Edge/store/useEdgeContext', () => ({
  useEdgeContext: () => ({
    edges: []
  })
}));

vi.mock('@jalez/react-state-history', () => ({
  useTransaction: () => ({
    withTransaction: mockWithTransaction
  })
}));

// Import test data and the hook AFTER setting up mocks
import {
  testNodesForHorizontalConnections,
  testHorizontalEdges,
  testVerticalEdges,
  testNodesWithExistingLRContainers,
  testEdgesWithExistingContainer,
  testNodesForContainerMerging,
  testEdgeForContainerMerging,
  testNodesForDragToCreate
} from '../utils/__tests__/testData';

import { useInvisibleNodeOperations } from '../useInvisibleNodeOperations';

describe('useInvisibleNodeOperations Integration', () => {
  beforeEach(() => {
    // Clear all mocks
    mockAddNode.mockClear();
    mockUpdateNode.mockClear();
    mockRemoveNodes.mockClear();
    mockWithTransaction.mockClear();

    // Setup node map with all test data
    const allTestNodes = [
      ...testNodesForHorizontalConnections,
      ...testNodesWithExistingLRContainers,
      ...testNodesForContainerMerging,
      ...testNodesForDragToCreate
    ];
    
    mockNodeMap = new Map(allTestNodes.map(node => [node.id, node]));
    
    // Setup parent-child mapping
    mockParentIdMap = new Map();
    allTestNodes.forEach(node => {
      if (node.parentId) {
        if (!mockParentIdMap.has(node.parentId)) {
          mockParentIdMap.set(node.parentId, new Set());
        }
        mockParentIdMap.get(node.parentId)!.add(node.id);
      }
    });
  });

  describe('Scenario 1: Creating invisible container for nodes without parent', () => {
    test('should create new invisible container when connecting two nodes without invisible parents', () => {
      const { result } = renderHook(() => useInvisibleNodeOperations());
      
      const sourceNode = testNodesForHorizontalConnections[0]; // node-a
      const targetNode = testNodesForHorizontalConnections[1]; // node-b
      const edge = testHorizontalEdges[0];

      const operationResult = result.current.handleConnectionWithInvisibleNode(
        edge,
        sourceNode,
        targetNode
      );

      // Verify that a new invisible container would be created
      expect(operationResult.newInvisibleNode).not.toBeNull();
      expect(operationResult.newInvisibleNode?.type).toBe('invisiblenode');
      expect(operationResult.newInvisibleNode?.data.layoutDirection).toBe('LR');
      expect(operationResult.newInvisibleNode?.data.isContainer).toBe(true);

      // Verify that both nodes would be updated to be children of the container
      expect(operationResult.updatedNodes).toHaveLength(2);
      expect(operationResult.updatedNodes.every((node: Node<NodeData>) => 
        node.parentId === operationResult.newInvisibleNode?.id
      )).toBe(true);
      expect(operationResult.updatedNodes.every((node: Node<NodeData>) => 
        node.extent === 'parent'
      )).toBe(true);
    });

    test('should create invisible container when dragging to create from node without parent', () => {
      const { result } = renderHook(() => useInvisibleNodeOperations());
      
      const sourceNode = testNodesForDragToCreate.find(n => n.id === 'source-node-no-parent')!;
      const newNode = {
        id: 'new-drag-node',
        type: 'pagenode',
        position: { x: 200, y: 100 },
        data: {
          label: 'New Dragged Node',
          level: 'basic',
          subject: 'test',
          depth: 0
        }
      } as Node<NodeData>;
      const edge = {
        id: 'edge-drag-create',
        source: sourceNode.id,
        target: newNode.id,
        sourceHandle: 'right',
        targetHandle: 'left'
      } as Edge;

      const operationResult = result.current.handleDragToCreateWithInvisibleNode(
        newNode,
        sourceNode,
        edge
      );

      // Should create a new invisible container
      expect(operationResult.newInvisibleNode).not.toBeNull();
      expect(operationResult.newInvisibleNode?.type).toBe('invisiblenode');
      expect(operationResult.newInvisibleNode?.data.layoutDirection).toBe('LR');

      // Should update both the source node and new node to be children
      expect(operationResult.updatedNodes).toHaveLength(2);
      expect(operationResult.updatedNodes.every((node: Node<NodeData>) => 
        node.parentId === operationResult.newInvisibleNode?.id
      )).toBe(true);
    });

    test('should not create container for vertical connections', () => {
      const { result } = renderHook(() => useInvisibleNodeOperations());
      
      const sourceNode = testNodesForHorizontalConnections[0];
      const targetNode = testNodesForHorizontalConnections[2];
      const edge = testVerticalEdges[0];

      const operationResult = result.current.handleConnectionWithInvisibleNode(
        edge,
        sourceNode,
        targetNode
      );

      expect(operationResult.newInvisibleNode).toBeNull();
      expect(operationResult.updatedNodes).toHaveLength(0);
      expect(operationResult.shouldRemoveNodes).toHaveLength(0);
    });
  });

  describe('Scenario 2: Adding node to existing invisible container', () => {
    test('should add outside node to existing LR container when connecting from inside', () => {
      const { result } = renderHook(() => useInvisibleNodeOperations());
      
      const sourceNode = testNodesWithExistingLRContainers.find(n => n.id === 'node-in-container-2')!;
      const targetNode = testNodesWithExistingLRContainers.find(n => n.id === 'node-outside-container')!;
      const edge = testEdgesWithExistingContainer[1];

      const operationResult = result.current.handleConnectionWithInvisibleNode(
        edge,
        sourceNode,
        targetNode
      );
      
      // Should only update the target node (no new container created)
      expect(operationResult.newInvisibleNode).toBeNull();
      expect(operationResult.updatedNodes).toHaveLength(1);
      expect(operationResult.updatedNodes[0].id).toBe('node-outside-container');
      expect(operationResult.updatedNodes[0].parentId).toBe('container-lr-existing');
      expect(operationResult.updatedNodes[0].extent).toBe('parent');
    });

    test('should add outside node to existing LR container when connecting from outside', () => {
      const { result } = renderHook(() => useInvisibleNodeOperations());
      
      const sourceNode = testNodesWithExistingLRContainers.find(n => n.id === 'node-outside-container')!;
      const targetNode = testNodesWithExistingLRContainers.find(n => n.id === 'node-in-container-1')!;
      const edge = {
        id: 'edge-outside-to-inside',
        source: 'node-outside-container',
        target: 'node-in-container-1',
        sourceHandle: 'right',
        targetHandle: 'left'
      } as Edge;

      const operationResult = result.current.handleConnectionWithInvisibleNode(
        edge,
        sourceNode,
        targetNode
      );
      
      // Should only update the source node (outside node joins existing container)
      expect(operationResult.newInvisibleNode).toBeNull();
      expect(operationResult.updatedNodes).toHaveLength(1);
      expect(operationResult.updatedNodes[0].id).toBe('node-outside-container');
      expect(operationResult.updatedNodes[0].parentId).toBe('container-lr-existing');
      expect(operationResult.updatedNodes[0].extent).toBe('parent');
    });

    test('should add new node to existing container when dragging from container node', () => {
      const { result } = renderHook(() => useInvisibleNodeOperations());
      
      const sourceNode = testNodesForDragToCreate.find(n => n.id === 'source-node-with-parent')!;
      const newNode = {
        id: 'new-node-join-container',
        type: 'pagenode',
        position: { x: 400, y: 100 },
        data: {
          label: 'New Node Joining Container',
          level: 'basic',
          subject: 'test',
          depth: 1
        }
      } as Node<NodeData>;
      const edge = {
        id: 'edge-drag-to-container',
        source: sourceNode.id,
        target: newNode.id,
        sourceHandle: 'right',
        targetHandle: 'left'
      } as Edge;

      const operationResult = result.current.handleDragToCreateWithInvisibleNode(
        newNode,
        sourceNode,
        edge
      );

      // Should not create new container, just update the new node
      expect(operationResult.newInvisibleNode).toBeNull();
      expect(operationResult.updatedNodes).toHaveLength(1);
      expect(operationResult.updatedNodes[0].id).toBe('new-node-join-container');
      expect(operationResult.updatedNodes[0].parentId).toBe('container-lr-for-drag');
      expect(operationResult.updatedNodes[0].extent).toBe('parent');
    });

    test('should not affect existing container for connections within same container', () => {
      const { result } = renderHook(() => useInvisibleNodeOperations());
      
      const sourceNode = testNodesWithExistingLRContainers.find(n => n.id === 'node-in-container-1')!;
      const targetNode = testNodesWithExistingLRContainers.find(n => n.id === 'node-in-container-2')!;
      const edge = testEdgesWithExistingContainer[0];

      const operationResult = result.current.handleConnectionWithInvisibleNode(
        edge,
        sourceNode,
        targetNode
      );
      
      // Should not create new nodes or update existing ones since they're already in same container
      expect(operationResult.newInvisibleNode).toBeNull();
      expect(operationResult.updatedNodes).toHaveLength(0);
      expect(operationResult.shouldRemoveNodes).toHaveLength(0);
    });
  });

  describe('Scenario 3: Merging two invisible containers', () => {
    test('should merge two LR containers when connecting their children', () => {
      const { result } = renderHook(() => useInvisibleNodeOperations());
      
      const sourceNode = testNodesForContainerMerging.find(n => n.id === 'node-container1-a')!;
      const targetNode = testNodesForContainerMerging.find(n => n.id === 'node-container2-a')!;
      const edge = testEdgeForContainerMerging[0];

      const operationResult = result.current.handleConnectionWithInvisibleNode(
        edge,
        sourceNode,
        targetNode
      );
      
      // Should remove one container and update children to move to the other container
      expect(operationResult.shouldRemoveNodes).toHaveLength(1);
      expect(operationResult.updatedNodes.length).toBeGreaterThan(0);
      
      // The removed container should be one of the two containers
      const removedId = operationResult.shouldRemoveNodes[0];
      expect(['container-lr-1', 'container-lr-2']).toContain(removedId);

      // All nodes from the removed container should be reparented to the surviving container
      const survivingContainerId = removedId === 'container-lr-1' ? 'container-lr-2' : 'container-lr-1';
      operationResult.updatedNodes.forEach((node: Node<NodeData>) => {
        expect(node.parentId).toBe(survivingContainerId);
        expect(node.extent).toBe('parent');
      });
    });

    test('should ensure all siblings are moved when merging containers', () => {
      const { result } = renderHook(() => useInvisibleNodeOperations());
      
      // Test with nodes that have siblings in their containers
      const sourceNode = testNodesForContainerMerging.find(n => n.id === 'node-container1-b')!;
      const targetNode = testNodesForContainerMerging.find(n => n.id === 'node-container2-b')!;
      const edge = {
        id: 'edge-merge-containers-siblings',
        source: 'node-container1-b',
        target: 'node-container2-b',
        sourceHandle: 'right',
        targetHandle: 'left'
      } as Edge;

      const operationResult = result.current.handleConnectionWithInvisibleNode(
        edge,
        sourceNode,
        targetNode
      );
      
      // Should remove one container
      expect(operationResult.shouldRemoveNodes).toHaveLength(1);
      
      // Should update all siblings from the removed container
      // Since each container has 2 nodes, we should see the siblings of the removed container being updated
      const removedContainerId = operationResult.shouldRemoveNodes[0];
      const survivingContainerId = removedContainerId === 'container-lr-1' ? 'container-lr-2' : 'container-lr-1';
      
      // Verify that children from the removed container are reparented
      operationResult.updatedNodes.forEach((node: Node<NodeData>) => {
        expect(node.parentId).toBe(survivingContainerId);
        expect(node.extent).toBe('parent');
      });
    });

    test('should prioritize source node container when merging (source container survives)', () => {
      const { result } = renderHook(() => useInvisibleNodeOperations());
      
      const sourceNode = testNodesForContainerMerging.find(n => n.id === 'node-container1-a')!;
      const targetNode = testNodesForContainerMerging.find(n => n.id === 'node-container2-a')!;
      const edge = testEdgeForContainerMerging[0];

      const operationResult = result.current.handleConnectionWithInvisibleNode(
        edge,
        sourceNode,
        targetNode
      );
      
      // The target's container should be removed (container-lr-2)
      expect(operationResult.shouldRemoveNodes).toContain('container-lr-2');
      
      // All updated nodes should be moved to the source's container (container-lr-1)
      operationResult.updatedNodes.forEach((node: Node<NodeData>) => {
        expect(node.parentId).toBe('container-lr-1');
      });
    });
  });

  describe('Edge cases and validation', () => {
    test('should handle mixed vertical and horizontal scenarios correctly', () => {
      const { result } = renderHook(() => useInvisibleNodeOperations());
      
      // Test vertical connection between nodes in different containers (should not merge)
      const sourceNode = testNodesForContainerMerging.find(n => n.id === 'node-container1-a')!;
      const targetNode = testNodesForContainerMerging.find(n => n.id === 'node-container2-a')!;
      const verticalEdge = {
        id: 'edge-vertical-no-merge',
        source: 'node-container1-a',
        target: 'node-container2-a',
        sourceHandle: 'bottom',
        targetHandle: 'top'
      } as Edge;

      const operationResult = result.current.handleConnectionWithInvisibleNode(
        verticalEdge,
        sourceNode,
        targetNode
      );

      // Should not trigger any operations for vertical connections
      expect(operationResult.newInvisibleNode).toBeNull();
      expect(operationResult.updatedNodes).toHaveLength(0);
      expect(operationResult.shouldRemoveNodes).toHaveLength(0);
    });

    test('should handle drag from top/bottom handles without creating containers', () => {
      const { result } = renderHook(() => useInvisibleNodeOperations());
      
      const sourceNode = testNodesForDragToCreate.find(n => n.id === 'source-node-no-parent')!;
      const newNode = {
        id: 'new-vertical-node',
        type: 'pagenode',
        position: { x: 100, y: 200 },
        data: {
          label: 'Vertical Connection Node',
          level: 'basic',
          subject: 'test',
          depth: 0
        }
      } as Node<NodeData>;
      const verticalEdge = {
        id: 'edge-vertical-drag',
        source: sourceNode.id,
        target: newNode.id,
        sourceHandle: 'bottom',
        targetHandle: 'top'
      } as Edge;

      const operationResult = result.current.handleDragToCreateWithInvisibleNode(
        newNode,
        sourceNode,
        verticalEdge
      );

      // Should not create invisible container for vertical connections
      expect(operationResult.newInvisibleNode).toBeNull();
      expect(operationResult.updatedNodes).toHaveLength(1);
      expect(operationResult.updatedNodes[0].id).toBe('new-vertical-node');
      expect(operationResult.updatedNodes[0].parentId).toBeUndefined();
    });

    test('should execute invisible node operations within transactions', () => {
      const { result } = renderHook(() => useInvisibleNodeOperations());
      
      const mockOperation = vi.fn(() => ({
        updatedNodes: [],
        newInvisibleNode: null,
        shouldRemoveNodes: []
      }));

      act(() => {
        result.current.executeInvisibleNodeOperation(
          mockOperation,
          "Test operation"
        );
      });

      expect(mockWithTransaction).toHaveBeenCalledTimes(1);
      expect(mockOperation).toHaveBeenCalledTimes(1);
    });
  });
});