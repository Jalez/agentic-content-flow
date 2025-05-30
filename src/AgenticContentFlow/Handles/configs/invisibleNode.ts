/** @format */
import { NodeHandleConfiguration } from '../../types/handleTypes';

export const invisibleNodeConfig: NodeHandleConfiguration = {
  nodeType: 'invisiblenode',
  category: 'container',
  handles: [
    {
      position: 'top',
      type: 'target',
      dataFlow: 'control',
      acceptsFrom: ['container', 'logic'],
      edgeType: 'default'
    },
    {
      position: 'bottom',
      type: 'source',
      dataFlow: 'control',
      connectsTo: ['container', 'logic'],
      edgeType: 'default'
    }
  ]
};