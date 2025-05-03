import { describe, it, expect } from 'vitest';
import { Node } from '@xyflow/react';
import { NodeData } from '../../../../types';
import { organizeNodeParents } from '../organizeNodeParents';

// Helper to create a node
const createNode = (
  id: string,
  parentId?: string,
  width = 100,
  height = 100
): Node<NodeData> & { width: number; height: number } => ({
  id,
  type: 'default',
  position: { x: 0, y: 0 },
  width,
  height,
  data: { label: id },
  parentId
});

describe('organizeNodeParents', () => {
  it('returns parents sorted from root to deepest', () => {
    // Tree: root -> a -> b, root -> c
    const root = createNode('root');
    const a = createNode('a', 'root');
    const b = createNode('b', 'a');
    const c = createNode('c', 'root');
    const parentIdWithChildren = new Map([
      ['root', [a, c]],
      ['a', [b]]
    ]);
    const pool = new Map([
      ['root', root],
      ['a', a],
      ['b', b],
      ['c', c]
    ]);
    const result = organizeNodeParents(parentIdWithChildren, pool);
    // 'root' is the top level, 'a' is intermediate level
    expect(result.map(n => n.id)).toEqual(['root', 'a']);
  });

  it('handles multiple roots and nested parents', () => {
    // Tree: r1 -> a1 -> b1, r2 -> a2
    const r1 = createNode('r1');
    const a1 = createNode('a1', 'r1');
    const b1 = createNode('b1', 'a1');
    const r2 = createNode('r2');
    const a2 = createNode('a2', 'r2');
    const parentIdWithChildren = new Map([
      ['r1', [a1]],
      ['a1', [b1]],
      ['r2', [a2]]
    ]);
    const pool = new Map([
      ['r1', r1],
      ['a1', a1],
      ['b1', b1],
      ['r2', r2],
      ['a2', a2]
    ]);
    const result = organizeNodeParents(parentIdWithChildren, pool);
    // r1 and r2 are root nodes, a1 is one level down
    expect(result.map(n => n.id)).toEqual(['r1', 'r2', 'a1']);
  });

  it('returns empty array if no parents', () => {
    const parentIdWithChildren = new Map();
    const pool = new Map();
    expect(organizeNodeParents(parentIdWithChildren, pool)).toEqual([]);
  });

  it('handles cycles gracefully', () => {
    // a -> b, b -> a (cycle)
    const a = createNode('a');
    const b = createNode('b', 'a');
    a.parentId = 'b'; // cycle
    const parentIdWithChildren = new Map([
      ['a', [b]],
      ['b', [a]]
    ]);
    const pool = new Map([
      ['a', a],
      ['b', b]
    ]);
    const result = organizeNodeParents(parentIdWithChildren, pool);
    // Both are in a cycle, should be consistently sorted
    expect(result.map(n => n.id).sort()).toEqual(['a', 'b']);
  });

  it('ignores non-parent nodes', () => {
    // Only parent nodes should be returned
    const a = createNode('a');
    const b = createNode('b', 'a');
    const c = createNode('c', 'b');
    const parentIdWithChildren = new Map([
      ['a', [b]],
      ['b', [c]]
    ]);
    const pool = new Map([
      ['a', a],
      ['b', b],
      ['c', c]
    ]);
    const result = organizeNodeParents(parentIdWithChildren, pool);
    // a is root, b is one level down
    expect(result.map(n => n.id)).toEqual(['a', 'b']);
  });
});
