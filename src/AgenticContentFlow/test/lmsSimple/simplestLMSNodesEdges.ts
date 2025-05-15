// testGraphData.ts

// testGraphData.ts (for testing nested LR layout within a TB context)

import { Node, Edge } from '@xyflow/react';

export const testNodesMinimalSiblingNested: Node[] = [
  // *** Add a container node ***
  // {
  //   id: 'container-sibling-lr', // ID for the container
  //   type: 'invisiblenode', 
  //   position: { x: 0, y: 0 }, // Initial position doesn't matter, layout will set it
  //   data: {
  //     label: 'LR Container',
  //     // *** Set data property to tell getContainerLayoutDirection this should be LR ***
  //     layoutDirection: 'LR', // Your getContainerLayoutDirection helper should look for this
  //     isContainer: true, // Or use a type check in isContainer
  //     expanded: true

  //   },
  //   style: { width: 250, height: 100 }, // Container needs initial dimensions for rendering
  // },
  // *** Make the blue and orange nodes children of the container ***
  {
    id: 'node-blue-data',
    type: 'datanode',
    position: { x: 0, y: 0 }, // Positions inside container are relative after layout
    data: { label: 'Data Node (Blue)', isParent: true },
    style: { width: 250, height: 100 }, // Container needs initial dimensions for rendering
    //parentId: 'container-sibling-lr', // *** Set the parentId ***
  },
  {
    id: 'node-orange-view',
    type: 'viewnode',
    position: { x: 0, y: 0 }, // Positions inside container are relative after layout
    data: { label: 'View Node (Orange)', isParent: true },
    style: { width: 250, height: 100 }, // Container needs initial dimensions for rendering
    //parentId: 'container-sibling-lr', // *** Set the parentId ***
  },
];

// The edge remains the same, connecting the two child nodes
export const testEdgesMinimalSiblingNested: Edge[] = [
  {
    id: 'edge-data-view',
    source: 'node-blue-data',
    target: 'node-orange-view',
    sourceHandle: 'right',
    targetHandle: 'left',
    type: 'default',
  },
];
