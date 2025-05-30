/** @format */
import { NodeHandleConfiguration } from '../../types/handleTypes';

export const statisticsNodeConfig: NodeHandleConfiguration = {
  nodeType: 'statisticsnode',
  category: 'statistics',
  handles: [
    {
      position: 'left',
      type: 'target',
      dataFlow: 'analytics',
      acceptsFrom: ['page'],
      icon: 'chart',
      edgeType: 'default'
    }
  ]
};