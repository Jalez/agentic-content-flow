/** @format */
import { NodeHandleConfiguration } from '../../types/handleTypes';

export const containerNodeConfig: NodeHandleConfiguration = {
  nodeType: 'coursenode',
  category: 'container',
  handles: [
    {
      position: 'top',
      type: 'target',
      dataFlow: 'dependency',
      acceptsFrom: ['container'],
      icon: 'link',
      edgeType: 'default'
    },
    {
      position: 'bottom',
      type: 'source',
      dataFlow: 'control',
      connectsTo: ['container', 'logic', 'page'],
      icon: 'arrow-down',
      edgeType: 'default'
    }
  ]
};