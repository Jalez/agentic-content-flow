import { describe, it, expect } from 'vitest';
import { Node } from '@xyflow/react';
import { NodeData } from '../../../../types';
import { getPotentialParent } from '../getPotentialParents';

describe('getPotentialParent', () => {
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

    it('should exclude children and grandchildren as potential parents', () => {
        const node = createNode('node-1000');
        const child = createNode('node-1001', 'node-1000');
        const grandChild = createNode('node-1002', 'node-1001');
        const unrelatedNode = createNode('node-1003');

        const parentIdWithChildren = new Map<string, Node<NodeData>[]>([
            ['node-1000', [child]],
            ['node-1001', [grandChild]]
        ]);

        const poolOfAllNodes = new Map([
            ['node-1000', node],
            ['node-1001', child],
            ['node-1002', grandChild],
            ['node-1003', unrelatedNode]
        ]);

        const result = getPotentialParent(
            node,
            [child, grandChild, unrelatedNode],
            parentIdWithChildren,
            poolOfAllNodes
        );

        expect(result).toBe(unrelatedNode);
    });

    it('should prefer younger nodes among equal depth candidates', () => {
        const node = createNode('node-1000');
        const olderSibling = createNode('node-1001', 'parent-1');
        const youngerSibling = createNode('node-1002', 'parent-1');

        const parentIdWithChildren = new Map<string, Node<NodeData>[]>([
            ['parent-1', [node, olderSibling, youngerSibling]]
        ]);

        const poolOfAllNodes = new Map([
            ['node-1000', node],
            ['node-1001', olderSibling],
            ['node-1002', youngerSibling]
        ]);

        const result = getPotentialParent(
            node,
            [olderSibling, youngerSibling],
            parentIdWithChildren,
            poolOfAllNodes
        );

        expect(result).toBe(youngerSibling);
    });

    it('should prefer siblings over parents', () => {
        const node = createNode('node-1000', 'parent-1');
        const sibling = createNode('node-1001', 'parent-1');
        const parent = createNode('parent-1');
        const grandParent = createNode('grandparent-1');

        const parentIdWithChildren = new Map<string, Node<NodeData>[]>([
            ['grandparent-1', [parent]],
            ['parent-1', [node, sibling]]
        ]);

        const poolOfAllNodes = new Map([
            ['node-1000', node],
            ['node-1001', sibling],
            ['parent-1', parent],
            ['grandparent-1', grandParent]
        ]);

        const result = getPotentialParent(
            node,
            [sibling, parent, grandParent],
            parentIdWithChildren,
            poolOfAllNodes
        );

        expect(result).toBe(sibling);
    });

    it('should return undefined if no valid candidates are found', () => {
        const node = createNode('node-1000');
        const child = createNode('node-1001', 'node-1000');

        const parentIdWithChildren = new Map<string, Node<NodeData>[]>([
            ['node-1000', [child]]
        ]);

        const poolOfAllNodes = new Map([
            ['node-1000', node],
            ['node-1001', child]
        ]);

        const result = getPotentialParent(
            node,
            [child], // Only candidate is a child
            parentIdWithChildren,
            poolOfAllNodes
        );

        expect(result).toBeUndefined();
    });

    it('should prefer overlapping nodes over non-overlapping ones', () => {
        const node = createNode('node-1000', undefined, { x: 100, y: 100 });
        const overlappingNode = createNode('node-1001', undefined, { x: 150, y: 150 });
        const nonOverlappingNode = createNode('node-1002', undefined, { x: 300, y: 300 });

        const parentIdWithChildren = new Map<string, Node<NodeData>[]>();
        const poolOfAllNodes = new Map([
            ['node-1000', node],
            ['node-1001', overlappingNode],
            ['node-1002', nonOverlappingNode]
        ]);

        const result = getPotentialParent(
            node,
            [overlappingNode, nonOverlappingNode],
            parentIdWithChildren,
            poolOfAllNodes
        );

        expect(result).toBe(overlappingNode);
    });

    it('should prefer closer nodes when none overlap', () => {
        const node = createNode('node-1000', undefined, { x: 100, y: 100 });
        const closerNode = createNode('node-1001', undefined, { x: 250, y: 250 });
        const fartherNode = createNode('node-1002', undefined, { x: 500, y: 500 });

        const parentIdWithChildren = new Map<string, Node<NodeData>[]>();
        const poolOfAllNodes = new Map([
            ['node-1000', node],
            ['node-1001', closerNode],
            ['node-1002', fartherNode]
        ]);

        const result = getPotentialParent(
            node,
            [closerNode, fartherNode],
            parentIdWithChildren,
            poolOfAllNodes
        );

        expect(result).toBe(closerNode);
    });

    it('should prefer node with more overlap area', () => {
        const node = createNode('node-1000', undefined, { x: 100, y: 100 });
        const moreOverlap = createNode('node-1001', undefined, { x: 150, y: 150 });
        const lessOverlap = createNode('node-1002', undefined, { x: 190, y: 190 });

        const parentIdWithChildren = new Map<string, Node<NodeData>[]>();
        const poolOfAllNodes = new Map([
            ['node-1000', node],
            ['node-1001', moreOverlap],
            ['node-1002', lessOverlap]
        ]);

        const result = getPotentialParent(
            node,
            [moreOverlap, lessOverlap],
            parentIdWithChildren,
            poolOfAllNodes
        );

        expect(result).toBe(moreOverlap);
    });
});