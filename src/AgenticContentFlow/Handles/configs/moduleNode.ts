/** @format */
import { NodeHandleConfiguration } from '../../types/handleTypes';

export const moduleNodeConfig: NodeHandleConfiguration = {
  nodeType: 'modulenode',
  category: 'container',
  handles: [
    {
      position: 'top',
      type: 'target',
      dataFlow: 'control',
      acceptsFrom: ['container'],
      icon: 'arrow-down',
      edgeType: 'default'
    },
    {
      position: 'bottom',
      type: 'source',
      dataFlow: 'control',
      connectsTo: ['logic', 'view'],
      icon: 'arrow-down',
      edgeType: 'default'
    }
  ]
};