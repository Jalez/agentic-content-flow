import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NodeData } from '../../../../types';
import { hasInfiniteExtent, isHorizontalConnection, updateNodeExtentInLocalNodes } from '../dragUtils';
import { getDragResistance, dragStartTimes } from '../getDragResistance';
import test from 'node:test';

// Mock the Node type from React Flow
const createMockNode = (id: string, width = 100, height = 40, position = { x: 0, y: 0 }) => ({
  id,
  width,
  height,
  position,
  data: {} as NodeData
});

describe('dragUtils', () => {

  describe('isHorizontalConnection', () => {
    test('should return true for left/right connections', () => {
      expect(isHorizontalConnection('left', 'right')).toBe(true);
      expect(isHorizontalConnection('right', 'left')).toBe(true);
      expect(isHorizontalConnection('left', null)).toBe(true);
      expect(isHorizontalConnection(null, 'right')).toBe(true);
    });

    test('should return false for top/bottom connections', () => {
      expect(isHorizontalConnection('top', 'bottom')).toBe(false);
      expect(isHorizontalConnection('bottom', 'top')).toBe(false);
      expect(isHorizontalConnection('top', null)).toBe(false);
      expect(isHorizontalConnection(null, 'bottom')).toBe(false);
    });

    test('should return false for null/undefined handles', () => {
      expect(isHorizontalConnection(null, null)).toBe(false);
      expect(isHorizontalConnection(undefined, undefined)).toBe(false);
    });
  });

  describe('hasInfiniteExtent', () => {
    it('should return false for undefined node', () => {
      const result = hasInfiniteExtent(undefined);
      expect(result).toBe(false);
    });

    it('should return false for node without extent', () => {
      const node = { id: 'node1' } as any;
      expect(hasInfiniteExtent(node)).toBe(false);
    });

    it('should return false for node with non-infinite extent', () => {
      const node = { 
        id: 'node1',
        extent: [[0, 0], [100, 100]]
      } as any;
      expect(hasInfiniteExtent(node)).toBe(false);
    });

    it('should return true for node with infinite extent', () => {
      const node = { 
        id: 'node1',
        extent: [[-Infinity, -Infinity], [Infinity, Infinity]]
      } as any;
      expect(hasInfiniteExtent(node)).toBe(true);
    });
  });

  describe('updateNodeExtentInLocalNodes', () => {
    it('should update a node extent to infinite', () => {
      const localNodes = [
        { id: 'node1', extent: [[0, 0], [100, 100]] },
        { id: 'node2', extent: [[0, 0], [100, 100]] }
      ] as any[];

      const result = updateNodeExtentInLocalNodes(localNodes, 'node1', true);
      expect(result[0].extent).toEqual([[-Infinity, -Infinity], [Infinity, Infinity]]);
      expect(result[1].extent).toEqual([[0, 0], [100, 100]]);
    });
  });

  describe('getDragResistance', () => {
    beforeEach(() => {
      // Reset the dragStartTimes map before each test
      dragStartTimes.clear();
      
      // Mock Date.now() for predictable tests
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-04-12T12:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return shouldBreakFree=true when there is no parent', () => {
      const node = createMockNode('node1');
      const mousePosition = { x: 50, y: 20 };

      const result = getDragResistance(node, mousePosition);
      expect(result.shouldBreakFree).toBe(true);
    });

    it('should return shouldBreakFree=false when drag duration is below threshold', () => {
      const node = createMockNode('node1');
      const parentNode = createMockNode('parent1', 300, 200);
      const mousePosition = { x: 200, y: 100 }; // Even far away

      const result = getDragResistance(node, mousePosition, parentNode);
      expect(result.shouldBreakFree).toBe(false);
      expect(dragStartTimes.has('node1')).toBe(true);
    });

    it('should return shouldBreakFree=false when distance is below threshold even after time threshold', () => {
      const node = createMockNode('node1');
      const parentNode = createMockNode('parent1', 300, 200);
      const mousePosition = { x: 60, y: 20 }; // Close to node center
      
      // Set drag start time to the past (beyond the time threshold)
      dragStartTimes.set('node1', Date.now() - 600);
      
      const result = getDragResistance(node, mousePosition, parentNode);
      expect(result.shouldBreakFree).toBe(false);
    });

    it('should return shouldBreakFree=true when distance exceeds threshold and time exceeds threshold', () => {
      const node = createMockNode('node1');
      const parentNode = createMockNode('parent1', 300, 200);
      const mousePosition = { x: 200, y: 100 }; // Far from node center (distance > 100)
      
      // Set drag start time to the past (beyond the time threshold)
      dragStartTimes.set('node1', Date.now() - 600);
      
      const result = getDragResistance(node, mousePosition, parentNode);
      expect(result.shouldBreakFree).toBe(true);
    });

    it('should calculate distance from node center correctly', () => {
      const node = createMockNode('node1', 100, 40, { x: 50, y: 30 });
      const parentNode = createMockNode('parent1', 300, 200);
      
      // Set drag start time to the past (beyond the time threshold)
      dragStartTimes.set('node1', Date.now() - 600);
      
      // Node center is at (50 + 100/2, 30 + 40/2) = (100, 50)
      // Distance to (180, 90) should be sqrt((180-100)^2 + (90-50)^2) = ~94.34
      const mousePosition = { x: 180, y: 90 };
      const result = getDragResistance(node, mousePosition, parentNode);
      expect(result.shouldBreakFree).toBe(false);
      
      // Distance to (210, 90) should be sqrt((210-100)^2 + (90-50)^2) = ~118.32
      const mousePosition2 = { x: 210, y: 90 };
      const result2 = getDragResistance(node, mousePosition2, parentNode);
      expect(result2.shouldBreakFree).toBe(true);
    });
  });
});