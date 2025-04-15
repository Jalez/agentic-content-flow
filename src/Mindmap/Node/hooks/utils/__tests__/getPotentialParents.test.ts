import { describe, it, expect } from 'vitest';
import { Node } from '@xyflow/react';
import { NodeData } from '../../../../types';
import { getPotentialParentId } from '../getPotentialParents';

describe('getPotentialParentId', () => {
    // Helper function to create test nodes with dimensions
    const createNode = (
        id: string, 
        parentId?: string, 
        position = { x: 0, y: 0 },
        width = 100,
        height = 100
    ): Node<NodeData> & { width: number; height: number } => ({
        id,
        type: 'default',
        position,
        width,
        height,
        data: {
            label: `Node ${id}`,
            details: '',
            type: 'default'
        },
        parentId
    });

    const ROOT_INDICATOR = "no-parent";

    it('should exclude children and grandchildren as potential parents', () => {
        const node = createNode('node-1000');
        const child = createNode('node-1001', 'node-1000');
        const grandChild = createNode('node-1002', 'node-1001');
        const unrelatedNode = createNode('node-1003');
        const unrelatedChild = createNode('node-1004', 'node-1003'); // Make unrelatedNode a parent

        const parentIdWithChildren = new Map<string, Node<NodeData>[]>([
            ['node-1000', [child]],
            ['node-1001', [grandChild]],
            ['node-1003', [unrelatedChild]] // Add unrelatedNode as a parent
        ]);

        const poolOfAllNodes = new Map([
            ['node-1000', node],
            ['node-1001', child],
            ['node-1002', grandChild],
            ['node-1003', unrelatedNode],
            ['node-1004', unrelatedChild]
        ]);

        const result = getPotentialParentId(
            node,
            [child, grandChild, unrelatedNode],
            parentIdWithChildren,
            poolOfAllNodes,
            ROOT_INDICATOR
        );

        expect(result).toBe('node-1003');
    });

    it('should prefer younger nodes among equal depth candidates', () => {
        const parent = createNode('parent-1');
        const node = createNode('node-1000', 'parent-1');
        const olderSibling = createNode('node-1001', 'parent-1');
        const youngerSibling = createNode('node-1002', 'parent-1');
        // Make both siblings parents by giving them children
        const olderSiblingChild = createNode('node-1003', 'node-1001');
        const youngerSiblingChild = createNode('node-1004', 'node-1002');

        const parentIdWithChildren = new Map<string, Node<NodeData>[]>([
            ['parent-1', [node, olderSibling, youngerSibling]],
            ['node-1001', [olderSiblingChild]],
            ['node-1002', [youngerSiblingChild]]
        ]);

        const poolOfAllNodes = new Map([
            ['parent-1', parent],
            ['node-1000', node],
            ['node-1001', olderSibling],
            ['node-1002', youngerSibling],
            ['node-1003', olderSiblingChild],
            ['node-1004', youngerSiblingChild]
        ]);

        const result = getPotentialParentId(
            node,
            [olderSibling, youngerSibling],
            parentIdWithChildren,
            poolOfAllNodes,
            ROOT_INDICATOR
        );

        expect(result).toBe('node-1002');
    });

    it('should prefer siblings over parents', () => {
        const grandParent = createNode('grandparent-1');
        const parent = createNode('parent-1', 'grandparent-1');
        const node = createNode('node-1000', 'parent-1');
        const sibling = createNode('node-1001', 'parent-1');
        // Make the sibling a parent by giving it a child
        const siblingChild = createNode('node-1002', 'node-1001');

        const parentIdWithChildren = new Map<string, Node<NodeData>[]>([
            ['grandparent-1', [parent]],
            ['parent-1', [node, sibling]],
            ['node-1001', [siblingChild]]
        ]);

        const poolOfAllNodes = new Map([
            ['grandparent-1', grandParent],
            ['parent-1', parent],
            ['node-1000', node],
            ['node-1001', sibling],
            ['node-1002', siblingChild]
        ]);

        const result = getPotentialParentId(
            node,
            [sibling, parent, grandParent],
            parentIdWithChildren,
            poolOfAllNodes,
            ROOT_INDICATOR
        );

        expect(result).toBe('node-1001');
    });

    it('should return ROOT_INDICATOR if no valid candidates are found', () => {
        const node = createNode('node-1000');
        const child = createNode('node-1001', 'node-1000');

        const parentIdWithChildren = new Map<string, Node<NodeData>[]>([
            ['node-1000', [child]]
        ]);

        const poolOfAllNodes = new Map([
            ['node-1000', node],
            ['node-1001', child]
        ]);

        const result = getPotentialParentId(
            node,
            [child], // Only candidate is a child
            parentIdWithChildren,
            poolOfAllNodes,
            ROOT_INDICATOR
        );

        expect(result).toBe(ROOT_INDICATOR);
    });

    it('should prefer overlapping nodes over non-overlapping ones', () => {
        const node = createNode('node-1000', undefined, { x: 100, y: 100 });
        const overlappingNode = createNode('node-1001', undefined, { x: 150, y: 150 });
        const nonOverlappingNode = createNode('node-1002', undefined, { x: 300, y: 300 });
        // Make both candidates parents
        const overlappingNodeChild = createNode('node-1003', 'node-1001');
        const nonOverlappingNodeChild = createNode('node-1004', 'node-1002');

        const parentIdWithChildren = new Map<string, Node<NodeData>[]>([
            ['node-1001', [overlappingNodeChild]],
            ['node-1002', [nonOverlappingNodeChild]]
        ]);

        const poolOfAllNodes = new Map([
            ['node-1000', node],
            ['node-1001', overlappingNode],
            ['node-1002', nonOverlappingNode],
            ['node-1003', overlappingNodeChild],
            ['node-1004', nonOverlappingNodeChild]
        ]);

        const result = getPotentialParentId(
            node,
            [overlappingNode, nonOverlappingNode],
            parentIdWithChildren,
            poolOfAllNodes,
            ROOT_INDICATOR
        );

        expect(result).toBe('node-1001');
    });

    it('should prefer closer nodes when none overlap', () => {
        const node = createNode('node-1000', undefined, { x: 100, y: 100 });
        const closerNode = createNode('node-1001', undefined, { x: 250, y: 250 });
        const fartherNode = createNode('node-1002', undefined, { x: 500, y: 500 });
        // Make both candidates parents
        const closerNodeChild = createNode('node-1003', 'node-1001');
        const fartherNodeChild = createNode('node-1004', 'node-1002');

        const parentIdWithChildren = new Map<string, Node<NodeData>[]>([
            ['node-1001', [closerNodeChild]],
            ['node-1002', [fartherNodeChild]]
        ]);

        const poolOfAllNodes = new Map([
            ['node-1000', node],
            ['node-1001', closerNode],
            ['node-1002', fartherNode],
            ['node-1003', closerNodeChild],
            ['node-1004', fartherNodeChild]
        ]);

        const result = getPotentialParentId(
            node,
            [closerNode, fartherNode],
            parentIdWithChildren,
            poolOfAllNodes,
            ROOT_INDICATOR
        );

        expect(result).toBe('node-1001');
    });

    it('should prefer node with more overlap area', () => {
        const node = createNode('node-1000', undefined, { x: 100, y: 100 });
        const moreOverlap = createNode('node-1001', undefined, { x: 150, y: 150 });
        const lessOverlap = createNode('node-1002', undefined, { x: 190, y: 190 });
        // Make both candidates parents
        const moreOverlapChild = createNode('node-1003', 'node-1001');
        const lessOverlapChild = createNode('node-1004', 'node-1002');

        const parentIdWithChildren = new Map<string, Node<NodeData>[]>([
            ['node-1001', [moreOverlapChild]],
            ['node-1002', [lessOverlapChild]]
        ]);

        const poolOfAllNodes = new Map([
            ['node-1000', node],
            ['node-1001', moreOverlap],
            ['node-1002', lessOverlap],
            ['node-1003', moreOverlapChild],
            ['node-1004', lessOverlapChild]
        ]);

        const result = getPotentialParentId(
            node,
            [moreOverlap, lessOverlap],
            parentIdWithChildren,
            poolOfAllNodes,
            ROOT_INDICATOR
        );

        expect(result).toBe('node-1001');
    });

    it('should prevent cycles by not allowing a node to become its own ancestor', () => {
        const grandparent = createNode('node-1000');
        const parent = createNode('node-1001', 'node-1000');
        const node = createNode('node-1002', 'node-1001');
        const child = createNode('node-1003', 'node-1002');
        const grandChild = createNode('node-1004', 'node-1003');

        const parentIdWithChildren = new Map<string, Node<NodeData>[]>([
            ['node-1000', [parent]],
            ['node-1001', [node]],
            ['node-1002', [child]],
            ['node-1003', [grandChild]]
        ]);

        const poolOfAllNodes = new Map([
            ['node-1000', grandparent],
            ['node-1001', parent],
            ['node-1002', node],
            ['node-1003', child],
            ['node-1004', grandChild]
        ]);

        // Try to make the grandparent a child of its grandchild
        const result1 = getPotentialParentId(
            grandparent,
            [grandChild],
            parentIdWithChildren,
            poolOfAllNodes,
            ROOT_INDICATOR
        );
        expect(result1).toBe(ROOT_INDICATOR);

        // Try to make the parent a child of its child
        const result2 = getPotentialParentId(
            parent,
            [child],
            parentIdWithChildren,
            poolOfAllNodes,
            ROOT_INDICATOR
        );
        expect(result2).toBe(ROOT_INDICATOR);

        // Try to make a node a child of its great-grandchild
        const result3 = getPotentialParentId(
            grandparent,
            [grandChild],
            parentIdWithChildren,
            poolOfAllNodes,
            ROOT_INDICATOR
        );
        expect(result3).toBe(ROOT_INDICATOR);
    });

    it('should prioritize current parent if it is among valid candidates', () => {
        const parent = createNode('node-1000');
        const node = createNode('node-1001', 'node-1000');
        const otherCandidate = createNode('node-1002');
        
        // Position otherCandidate to overlap more than parent
        parent.position = { x: 150, y: 150 };
        node.position = { x: 100, y: 100 };
        otherCandidate.position = { x: 110, y: 110 };

        const parentIdWithChildren = new Map<string, Node<NodeData>[]>([
            ['node-1000', [node]]
        ]);

        const poolOfAllNodes = new Map([
            ['node-1000', parent],
            ['node-1001', node],
            ['node-1002', otherCandidate]
        ]);

        const result = getPotentialParentId(
            node,
            [parent, otherCandidate],
            parentIdWithChildren,
            poolOfAllNodes,
            ROOT_INDICATOR
        );

        // Should return current parent even though otherCandidate has more overlap
        expect(result).toBe('node-1000');
    });

    it('should only suggest nodes that are already parents or the current parent', () => {
        const currentParent = createNode('node-1000');
        const node = createNode('node-1001', 'node-1000');
        const existingParent = createNode('node-1002');
        const nonParent = createNode('node-1003');
        const childOfExistingParent = createNode('node-1004', 'node-1002');
        
        // Position nodes so that existingParent has more overlap than nonParent
        node.position = { x: 100, y: 100 };
        currentParent.position = { x: 150, y: 150 };
        existingParent.position = { x: 110, y: 110 }; // More overlap with node
        nonParent.position = { x: 200, y: 200 }; // Less overlap with node

        const parentIdWithChildren = new Map<string, Node<NodeData>[]>([
            ['node-1000', [node]], // current parent
            ['node-1002', [childOfExistingParent]] // another parent
        ]);

        const poolOfAllNodes = new Map([
            ['node-1000', currentParent],
            ['node-1001', node],
            ['node-1002', existingParent],
            ['node-1003', nonParent],
            ['node-1004', childOfExistingParent]
        ]);

        // Test with all nodes as candidates
        const result = getPotentialParentId(
            node,
            [currentParent, existingParent, nonParent],
            parentIdWithChildren,
            poolOfAllNodes,
            ROOT_INDICATOR
        );

        // Should return current parent since it's the current parent
        expect(result).toBe('node-1000');

        // Test with current parent removed
        const resultWithoutCurrentParent = getPotentialParentId(
            node,
            [existingParent, nonParent],
            parentIdWithChildren,
            poolOfAllNodes,
            ROOT_INDICATOR
        );

        // Should return existingParent since it's in parentIdWithChildren
        expect(resultWithoutCurrentParent).toBe('node-1002');

        // Test with only non-parent candidate
        const resultOnlyNonParent = getPotentialParentId(
            node,
            [nonParent],
            parentIdWithChildren,
            poolOfAllNodes,
            ROOT_INDICATOR
        );

        // Should return ROOT_INDICATOR since nonParent is not in parentIdWithChildren
        expect(resultOnlyNonParent).toBe(ROOT_INDICATOR);
    });

    it('should allow root nodes to become children of other root nodes', () => {
        const rootNode1 = createNode('root-1');
        const rootNode2 = createNode('root-2');
        const child1 = createNode('child-1', 'root-1');
        const child2 = createNode('child-2', 'root-2');

        const parentIdWithChildren = new Map<string, Node<NodeData>[]>([
            ['root-1', [child1]],
            ['root-2', [child2]]
        ]);

        const poolOfAllNodes = new Map([
            ['root-1', rootNode1],
            ['root-2', rootNode2],
            ['child-1', child1],
            ['child-2', child2]
        ]);

        // Test that root-1 can become a child of root-2
        const result1 = getPotentialParentId(
            rootNode1,
            [rootNode2],
            parentIdWithChildren,
            poolOfAllNodes,
            ROOT_INDICATOR
        );

        expect(result1).toBe('root-2');

        // Test that root-2 can become a child of root-1
        const result2 = getPotentialParentId(
            rootNode2,
            [rootNode1],
            parentIdWithChildren,
            poolOfAllNodes,
            ROOT_INDICATOR
        );

        expect(result2).toBe('root-1');
    });
});