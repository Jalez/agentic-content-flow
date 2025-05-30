/** @format */
import { NodeHandleConfiguration } from '../../types/handleTypes';

export const cellNodeConfig: NodeHandleConfiguration = {
  nodeType: 'cellnode',
  category: 'logic',
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
      connectsTo: ['logic', 'page'],
      icon: 'arrow-down',
      edgeType: 'default'
    },
    {
      position: 'left',
      type: 'target',
      dataFlow: 'reference',
      acceptsFrom: ['logic'],
      icon: 'link',
      edgeType: 'default'
    },
    {
      position: 'right',
      type: 'source',
      dataFlow: 'reference',
      connectsTo: ['logic'],
      icon: 'link',
      edgeType: 'default'
    }
  ]
};