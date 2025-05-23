import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Node, Edge, Connection } from '@xyflow/react';
import { useConnectionOperations } from '../useConnectionOperations';
import { NodeData } from '../../../types';

// Mock the external dependencies
vi.mock('@xyflow/react', () => ({
  useReactFlow: vi.fn(),
}));

vi.mock('../../registry/nodeTypeRegistry', () => ({
  createNodeFromTemplate: vi.fn(),
}));

vi.mock('../../store/useNodeContext', () => ({
  useNodeContext: vi.fn(),
}));

vi.mock('../../../Edge/store/useEdgeContext', () => ({
  useEdgeContext: vi.fn(),
}));

vi.mock('@jalez/react-state-history', () => ({
  useTransaction: vi.fn(),
}));

vi.mock('../../../utils/withErrorHandler', () => ({
  withErrorHandler: vi.fn((_name, fn) => fn),
}));

// Import the mocked modules for type checking
import { useReactFlow } from '@xyflow/react';
import { createNodeFromTemplate } from '../../registry/nodeTypeRegistry';
import { useNodeContext } from '../../store/useNodeContext';
import { useEdgeContext } from '../../../Edge/store/useEdgeContext';
import { useTransaction } from '@jalez/react-state-history';

// Helper function to create mock nodes
const createMockNode = (
  id: string,
  type = 'cellnode',
  position = { x: 100, y: 100 },
  parentId?: string,
  data?: Partial<NodeData>
): Node<NodeData> => ({
  id,
  type,
  position,
  data: {
    label: `Node ${id}`,
    details: 'Test details',
    nodeLevel: 'basic',
    subject: 'test',
    parent: parentId,
    ...data,
  },
  parentId,
});

describe('useConnectionOperations', () => {
  // Mock implementations
  const mockScreenToFlowPosition = vi.fn();
  const mockFitView = vi.fn();
  const mockAddNode = vi.fn();
  const mockUpdateNode = vi.fn();
  const mockOnEdgeAdd = vi.fn();
  const mockWithTransaction = vi.fn((callback) => callback());
  const mockCreateNodeFromTemplate = vi.fn();

  // Mock data
  const mockNodeMap = new Map<string, Node<NodeData>>();
  const mockNodeParentIdMapWithChildIdSet = new Map<string, Set<string>>();
  const mockEdges: Edge[] = [];
  const mockEdgeMap = new Map<string, Edge>();

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Setup mock implementations
    (useReactFlow as any).mockReturnValue({
      screenToFlowPosition: mockScreenToFlowPosition,
      fitView: mockFitView,
    });

    (useNodeContext as any).mockReturnValue({
      addNode: mockAddNode,
      nodeMap: mockNodeMap,
      updateNode: mockUpdateNode,
      nodeParentIdMapWithChildIdSet: mockNodeParentIdMapWithChildIdSet,
    });

    (useEdgeContext as any).mockReturnValue({
      edges: mockEdges,
      onEdgeAdd: mockOnEdgeAdd,
      edgeMap: mockEdgeMap,
    });

    (useTransaction as any).mockReturnValue({
      withTransaction: mockWithTransaction,
    });

    (createNodeFromTemplate as any).mockImplementation(mockCreateNodeFromTemplate);

    // Clear mock data
    mockNodeMap.clear();
    mockNodeParentIdMapWithChildIdSet.clear();
    mockEdges.length = 0;
    mockEdgeMap.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('addSourceNode', () => {
    it('should create a source node and connect it to the child node', () => {
      // Arrange
      const childNode = createMockNode('child-1', 'cellnode', { x: 300, y: 200 });
      const newSourceNode = createMockNode('source-1', 'cellnode', { x: 0, y: 200 });
      
      mockNodeMap.set('child-1', childNode);
      mockCreateNodeFromTemplate.mockReturnValue(newSourceNode);

      // Mock Date.now for consistent ID generation
      const mockDateNow = vi.spyOn(Date, 'now').mockReturnValue(123456789);

      const { result } = renderHook(() => useConnectionOperations());

      // Act
      act(() => {
        result.current.addSourceNode(childNode);
      });

      // Assert
      expect(mockCreateNodeFromTemplate).toHaveBeenCalledWith('cellnode', {
        id: 'node-123456789',
        position: { x: 0, y: 200 }, // 300px to the left of child
        nodeLevel: childNode.data.nodeLevel,
        subject: childNode.data.subject,
      });

      expect(mockWithTransaction).toHaveBeenCalledWith(
        expect.any(Function),
        'addSourceNodeTransaction'
      );

      expect(mockUpdateNode).toHaveBeenCalledWith({
        ...childNode,
        data: {
          ...childNode.data,
          parent: 'node-123456789',
        },
      });

      expect(mockAddNode).toHaveBeenCalledWith(newSourceNode);
      expect(mockOnEdgeAdd).toHaveBeenCalledWith({
        id: 'e-source-1-child-1',
        source: 'source-1',
        target: 'child-1',
        sourceHandle: 'right',
        targetHandle: 'left',
      });

      expect(mockFitView).toHaveBeenCalledWith({
        nodes: [newSourceNode, expect.objectContaining({ id: 'child-1' })],
        duration: 500,
        padding: 0.2,
      });

      mockDateNow.mockRestore();
    });

    it('should handle missing child node gracefully', () => {
      // Arrange
      const childNode = createMockNode('missing-child');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { result } = renderHook(() => useConnectionOperations());

      // Act
      act(() => {
        result.current.addSourceNode(childNode);
      });

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Child node not found in nodeMap');
      expect(mockCreateNodeFromTemplate).not.toHaveBeenCalled();
      expect(mockAddNode).not.toHaveBeenCalled();
      expect(mockOnEdgeAdd).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should handle failed node template creation', () => {
      // Arrange
      const childNode = createMockNode('child-1');
      mockNodeMap.set('child-1', childNode);
      mockCreateNodeFromTemplate.mockReturnValue(null);

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { result } = renderHook(() => useConnectionOperations());

      // Act
      act(() => {
        result.current.addSourceNode(childNode);
      });

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Failed to create parent node: node type not registered');
      expect(mockAddNode).not.toHaveBeenCalled();
      expect(mockOnEdgeAdd).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('addTargetNode', () => {
    it('should create a target node and connect it to the parent node', () => {
      // Arrange
      const parentNode = createMockNode('parent-1', 'cellnode', { x: 100, y: 100 });
      const newTargetNode = createMockNode('target-1', 'cellnode', { x: 550, y: 100 });
      
      mockNodeParentIdMapWithChildIdSet.set('parent-1', new Set());
      mockCreateNodeFromTemplate.mockReturnValue(newTargetNode);

      const mockDateNow = vi.spyOn(Date, 'now').mockReturnValue(123456789);
      const { result } = renderHook(() => useConnectionOperations());

      // Act
      act(() => {
        result.current.addTargetNode(parentNode);
      });

      // Assert
      expect(mockCreateNodeFromTemplate).toHaveBeenCalledWith('cellnode', {
        id: 'node-123456789',
        position: { x: 550, y: 100 }, // 450px to the right of parent
        eventNode: parentNode,
        label: 'New Concept',
        details: 'Add details about this concept',
      });

      expect(mockWithTransaction).toHaveBeenCalledWith(
        expect.any(Function),
        'addTargetNodeTransaction'
      );

      expect(mockAddNode).toHaveBeenCalledWith(newTargetNode);
      expect(mockOnEdgeAdd).toHaveBeenCalledWith({
        id: 'e-parent-1-node-123456789',
        source: 'parent-1',
        target: 'node-123456789',
        sourceHandle: 'bottom', // cellnode uses bottom
        targetHandle: 'top',    // cellnode uses top
      });

      mockDateNow.mockRestore();
    });

    it('should position new node considering existing children', () => {
      // Arrange
      const parentNode = createMockNode('parent-1', 'cellnode', { x: 100, y: 100 });
      const existingChild1 = createMockNode('child-1', 'cellnode', { x: 550, y: 80 });
      const existingChild2 = createMockNode('child-2', 'cellnode', { x: 550, y: 200 });
      const newTargetNode = createMockNode('target-1', 'cellnode', { x: 550, y: 140 });

      mockNodeMap.set('child-1', existingChild1);
      mockNodeMap.set('child-2', existingChild2);
      mockNodeParentIdMapWithChildIdSet.set('parent-1', new Set(['child-1', 'child-2']));
      mockCreateNodeFromTemplate.mockReturnValue(newTargetNode);

      const { result } = renderHook(() => useConnectionOperations());

      // Act
      act(() => {
        result.current.addTargetNode(parentNode);
      });

      // Assert - should position in the gap between existing children
      expect(mockCreateNodeFromTemplate).toHaveBeenCalledWith('cellnode', 
        expect.objectContaining({
          position: { x: 550, y: 140 }, // In the middle of the gap
        })
      );
    });

    it('should handle datanode with correct handles', () => {
      // Arrange
      const dataNode = createMockNode('data-1', 'datanode', { x: 100, y: 100 });
      const newTargetNode = createMockNode('target-1', 'datanode', { x: 550, y: 100 });
      
      mockNodeParentIdMapWithChildIdSet.set('data-1', new Set());
      mockCreateNodeFromTemplate.mockReturnValue(newTargetNode);

      const { result } = renderHook(() => useConnectionOperations());

      // Act
      act(() => {
        result.current.addTargetNode(dataNode);
      });

      // Assert - datanode should use right/left handles
      expect(mockOnEdgeAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          sourceHandle: 'right',
          targetHandle: 'left',
        })
      );
    });

    it('should handle failed node template creation', () => {
      // Arrange
      const parentNode = createMockNode('parent-1');
      mockNodeParentIdMapWithChildIdSet.set('parent-1', new Set());
      mockCreateNodeFromTemplate.mockReturnValue(null);

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { result } = renderHook(() => useConnectionOperations());

      // Act
      act(() => {
        result.current.addTargetNode(parentNode);
      });

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Failed to create child node: node type not registered');
      expect(mockAddNode).not.toHaveBeenCalled();
      expect(mockOnEdgeAdd).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('onConnect', () => {
    it('should create connection with appropriate target handle', () => {
      // Arrange
      const connection: Connection = {
        source: 'node-1',
        target: 'node-2',
        sourceHandle: 'right',
        targetHandle: null, // Add required property
      };

      const { result } = renderHook(() => useConnectionOperations());

      // Act
      act(() => {
        result.current.onConnect(connection);
      });

      // Assert
      expect(mockOnEdgeAdd).toHaveBeenCalledWith({
        source: 'node-1',
        target: 'node-2',
        sourceHandle: 'right',
        targetHandle: 'left', // Should be opposite of source
      });
    });

    it('should handle different source handle orientations', () => {
      const { result } = renderHook(() => useConnectionOperations());

      const testCases = [
        { sourceHandle: 'left', expectedTarget: 'right' },
        { sourceHandle: 'right', expectedTarget: 'left' },
        { sourceHandle: 'top', expectedTarget: 'bottom' },
        { sourceHandle: 'bottom', expectedTarget: 'top' },
        { sourceHandle: null, expectedTarget: 'left' }, // default - use null instead of undefined
      ];

      testCases.forEach(({ sourceHandle, expectedTarget }) => {
        const connection: Connection = {
          source: 'node-1',
          target: 'node-2',
          sourceHandle,
          targetHandle: null, // Add required property
        };

        act(() => {
          result.current.onConnect(connection);
        });

        expect(mockOnEdgeAdd).toHaveBeenCalledWith(
          expect.objectContaining({
            targetHandle: expectedTarget,
          })
        );

        mockOnEdgeAdd.mockClear();
      });
    });
  });

  describe('onConnectEnd', () => {
    beforeEach(() => {
      mockScreenToFlowPosition.mockReturnValue({ x: 200, y: 150 });
    });

    it('should create new node when dragging to empty space', () => {
      // Arrange
      const fromNode = createMockNode('from-1', 'cellnode', { x: 100, y: 100 });
      const newNode = createMockNode('new-1', 'cellnode', { x: 200, y: 150 });
      
      mockCreateNodeFromTemplate.mockReturnValue(newNode);
      mockNodeMap.set('from-1', fromNode);

      const mockEvent = {
        clientX: 300,
        clientY: 250,
      } as MouseEvent;

      const connectionState = {
        fromNode,
        toNode: null,
        fromPosition: 'right',
      };

      const mockDateNow = vi.spyOn(Date, 'now').mockReturnValue(123456789);
      const { result } = renderHook(() => useConnectionOperations());

      // Act
      act(() => {
        result.current.onConnectEnd(mockEvent, connectionState);
      });

      // Assert
      expect(mockScreenToFlowPosition).toHaveBeenCalledWith({ x: 300, y: 250 });
      expect(mockCreateNodeFromTemplate).toHaveBeenCalledWith('cellnode', {
        id: 'node-123456789',
        position: { x: 200, y: 150 }, // Using the screen-to-flow position directly
        eventNode: fromNode,
        details: 'Add details about this concept',
      });

      expect(mockWithTransaction).toHaveBeenCalledWith(
        expect.any(Function),
        'onConnectEndTransaction'
      );

      expect(mockAddNode).toHaveBeenCalledWith(newNode);
      expect(mockOnEdgeAdd).toHaveBeenCalledWith({
        id: 'e-from-1-node-123456789',
        source: 'from-1',
        target: 'node-123456789',
        sourceHandle: 'right',
        targetHandle: 'left',
      });

      mockDateNow.mockRestore();
    });

    it('should handle left handle drag (target to source)', () => {
      // Arrange
      const fromNode = createMockNode('from-1', 'cellnode', { x: 100, y: 100 });
      const newNode = createMockNode('new-1', 'cellnode', { x: 200, y: 150 });
      
      mockCreateNodeFromTemplate.mockReturnValue(newNode);
      mockNodeMap.set('from-1', fromNode);

      const mockEvent = {
        clientX: 300,
        clientY: 250,
      } as MouseEvent;

      const connectionState = {
        fromNode,
        toNode: null,
        fromPosition: 'left', // Dragging from left handle
      };

      const mockDateNow = vi.spyOn(Date, 'now').mockReturnValue(123456789);
      const { result } = renderHook(() => useConnectionOperations());

      // Act
      act(() => {
        result.current.onConnectEnd(mockEvent, connectionState);
      });

      // Assert - should create edge with new node as source
      expect(mockOnEdgeAdd).toHaveBeenCalledWith({
        id: 'e-node-123456789-from-1',
        source: 'node-123456789', // New node becomes source
        target: 'from-1',          // Original node becomes target
        sourceHandle: 'right',     // Corresponding handle on new node
        targetHandle: 'left',      // The dragged handle
      });

      mockDateNow.mockRestore();
    });

    it('should handle touch events', () => {
      // Arrange
      const fromNode = createMockNode('from-1', 'cellnode', { x: 100, y: 100 });
      const newNode = createMockNode('new-1', 'cellnode', { x: 200, y: 150 });
      
      mockCreateNodeFromTemplate.mockReturnValue(newNode);
      mockNodeMap.set('from-1', fromNode);

      const mockTouchEvent = {
        changedTouches: [{ clientX: 300, clientY: 250 }],
      } as unknown as TouchEvent;

      const connectionState = {
        fromNode,
        toNode: null,
        fromPosition: 'right',
      };

      const { result } = renderHook(() => useConnectionOperations());

      // Act
      act(() => {
        result.current.onConnectEnd(mockTouchEvent, connectionState);
      });

      // Assert
      expect(mockScreenToFlowPosition).toHaveBeenCalledWith({ x: 300, y: 250 });
      expect(mockAddNode).toHaveBeenCalled();
      expect(mockOnEdgeAdd).toHaveBeenCalled();
    });

    it('should not create node when toNode exists', () => {
      // Arrange
      const fromNode = createMockNode('from-1');
      const toNode = createMockNode('to-1');

      const mockEvent = {
        clientX: 300,
        clientY: 250,
      } as MouseEvent;

      const connectionState = {
        fromNode,
        toNode, // Connection to existing node
        fromPosition: 'right',
      };

      const { result } = renderHook(() => useConnectionOperations());

      // Act
      act(() => {
        result.current.onConnectEnd(mockEvent, connectionState);
      });

      // Assert
      expect(mockCreateNodeFromTemplate).not.toHaveBeenCalled();
      expect(mockAddNode).not.toHaveBeenCalled();
      expect(mockOnEdgeAdd).not.toHaveBeenCalled();
    });

    it('should handle failed node creation', () => {
      // Arrange
      const fromNode = createMockNode('from-1');
      mockCreateNodeFromTemplate.mockReturnValue(null);
      mockNodeMap.set('from-1', fromNode);

      const mockEvent = {
        clientX: 300,
        clientY: 250,
      } as MouseEvent;

      const connectionState = {
        fromNode,
        toNode: null,
        fromPosition: 'right',
      };

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { result } = renderHook(() => useConnectionOperations());

      // Act
      act(() => {
        result.current.onConnectEnd(mockEvent, connectionState);
      });

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to create new node on connect end: node type not registered'
      );
      expect(mockAddNode).not.toHaveBeenCalled();
      expect(mockOnEdgeAdd).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('getCumulativeParentOffset', () => {
    it('should calculate cumulative offset correctly', () => {
      // This is tested indirectly through onConnectEnd
      // We can verify the position calculation includes parent offset adjustment
      
      // Arrange - create a node hierarchy
      const grandParent = createMockNode('grandparent', 'cellnode', { x: 50, y: 50 });
      const parent = createMockNode('parent', 'cellnode', { x: 100, y: 100 }, 'grandparent');
      const child = createMockNode('child', 'cellnode', { x: 150, y: 150 }, 'parent');
      const newNode = createMockNode('new-1', 'cellnode', { x: 200, y: 150 });

      mockNodeMap.set('grandparent', grandParent);
      mockNodeMap.set('parent', parent);
      mockNodeMap.set('child', child);
      mockCreateNodeFromTemplate.mockReturnValue(newNode);
      mockScreenToFlowPosition.mockReturnValue({ x: 400, y: 300 });

      const mockEvent = {
        clientX: 400,
        clientY: 300,
      } as MouseEvent;

      const connectionState = {
        fromNode: child,
        toNode: null,
        fromPosition: 'right',
      };

      const { result } = renderHook(() => useConnectionOperations());

      // Act
      act(() => {
        result.current.onConnectEnd(mockEvent, connectionState);
      });

      // Assert - position should be adjusted by cumulative parent offset
      expect(mockCreateNodeFromTemplate).toHaveBeenCalledWith('cellnode',
        expect.objectContaining({
          position: { x: 250, y: 150 }, // 400 - (50 + 100), 300 - (50 + 100)
        })
      );
    });
  });
});