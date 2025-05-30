/** @format */
import { NodeHandleConfiguration } from '../../types/handleTypes';

export const conditionalNodeConfig: NodeHandleConfiguration = {
  nodeType: 'conditionalnode',
  category: 'logic',
  handles: [
    {
      position: 'top',
      type: 'target',
      dataFlow: 'control',
      acceptsFrom: ['view', 'logic', 'container'],
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
    }
  ]
};