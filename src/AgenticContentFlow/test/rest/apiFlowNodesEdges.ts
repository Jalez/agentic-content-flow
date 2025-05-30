import { Node, Edge } from '@xyflow/react';

export const apiFlowNodesData: Node[] = [
  {
    id: 'config-data',
    type: 'datanode',
    position: { x: 100, y: 100 },
    data: {
      label: 'API Configuration',
      details: 'Contains API configuration and parameters',
      subject: 'data',
      nodeLevel: 'basic',
      expanded: true,
      depth: 0,
      isParent: false
    },
  },
  {
    id: 'api-request',
    type: 'restnode',
    position: { x: 400, y: 100 },
    data: {
      label: 'Get Posts',
      details: 'Fetch posts from JSONPlaceholder API',
      subject: 'integration',
      nodeLevel: 'intermediate',
      expanded: true,
      depth: 0,
      isParent: false,
      method: 'GET',
      url: 'https://jsonplaceholder.typicode.com/posts',
      authentication: 'none',
      timeout: 30,
      retryAttempts: 3,
      headers: {
        'Content-Type': 'application/json'
      }
    },
  },
  {
    id: 'display-posts',
    type: 'contentnode',
    position: { x: 700, y: 100 },
    data: {
      label: 'Posts Display',
      details: 'Display fetched posts in a formatted view',
      subject: 'view',
      nodeLevel: 'basic',
      expanded: true,
      depth: 0,
      isParent: false
    },
  },
  {
    id: 'stats-node',
    type: 'statisticsnode',
    position: { x: 400, y: 300 },
    data: {
      label: 'API Analytics',
      details: 'Track API response times and success rates',
      subject: 'analytics',
      nodeLevel: 'advanced',
      expanded: true,
      depth: 0,
      isParent: false,
      metrics: 'Response Time: 150ms\nSuccess Rate: 99%\nTotal Requests: 1250'
    },
  }
];

export const apiFlowEdgesData: Edge[] = [
  {
    id: 'edge-config-api',
    source: 'config-data',
    target: 'api-request',
    type: 'default',
    sourceHandle: 'right',
    targetHandle: 'left'
  },
  {
    id: 'edge-api-display',
    source: 'api-request',
    target: 'display-posts',
    type: 'default',
    sourceHandle: 'right',
    targetHandle: 'left'
  },
  {
    id: 'edge-api-stats',
    source: 'api-request',
    target: 'stats-node',
    type: 'default',
    sourceHandle: 'bottom',
    targetHandle: 'left'
  }
];