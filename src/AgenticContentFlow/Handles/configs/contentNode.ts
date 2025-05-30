/** @format */
import { NodeHandleConfiguration } from '../../types/handleTypes';

export const contentNodeConfig: NodeHandleConfiguration = {
  nodeType: 'contentnode',
  category: 'view',
  handles: [
    {
        position: 'top',
        type: 'target',
        dataFlow: 'control',
        acceptsFrom: ['logic', 'container'],
        icon: 'arrow-down',
        edgeType: 'default'
      },
      {
        position: 'bottom',
        type: 'source',
        dataFlow: 'control',
        connectsTo: ['logic', 'container', 'page'],
        icon: 'arrow-down',
        edgeType: 'default'
      },
      {
        position: 'left',
        type: 'target',
        dataFlow: 'data',
        acceptsFrom: ['data'],
        icon: 'package',
        edgeType: 'package'
      },
      {
        position: 'right',
        type: 'source',
        dataFlow: 'analytics',
        connectsTo: ['statistics'],
        icon: 'chart',
        edgeType: 'default'
      }
  ]
};