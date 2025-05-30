import { Node, Edge } from '@xyflow/react';

export const restFlowNodesData: Node[] = [
  {
    id: 'data-source',
    type: 'datanode',
    position: { x: 100, y: 100 },
    data: {
      label: 'Request Parameters',
      details: 'Parameters for the API request',
      subject: 'data',
      nodeLevel: 'basic',
      expanded: true,
      depth: 0,
      isParent: false
    },
  },
  {
    id: 'api-get',
    type: 'restnode',
    position: { x: 400, y: 100 },
    data: {
      label: 'Get User Data',
      details: 'Fetch user data from API',
      subject: 'integration',
      nodeLevel: 'intermediate',
      expanded: true,
      depth: 0,
      isParent: false,
      method: 'GET',
      url: 'https://api.example.com/users',
      authentication: 'bearer',
      timeout: 30,
      retryAttempts: 3,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer {token}'
      }
    },
  },
  {
    id: 'content-display',
    type: 'contentnode',
    position: { x: 700, y: 100 },
    data: {
      label: 'Display Results',
      details: 'Display API response data',
      subject: 'visualization',
      nodeLevel: 'basic',
      expanded: true,
      depth: 0,
      isParent: false
    },
  }
];

export const restFlowEdgesData: Edge[] = [
  {
    id: 'edge-params-api',
    source: 'data-source',
    target: 'api-get',
    type: 'default',
    sourceHandle: 'right',
    targetHandle: 'left'
  },
  {
    id: 'edge-api-display',
    source: 'api-get',
    target: 'content-display',
    type: 'default',
    sourceHandle: 'right',
    targetHandle: 'left'
  }
];