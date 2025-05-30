/** @format */
import { NodeHandleConfiguration } from '../../types/handleTypes';

export const dataNodeConfig: NodeHandleConfiguration = {
  nodeType: 'datanode',
  category: 'data',
  handles: [
    {
      position: 'right',
      type: 'source',
      dataFlow: 'data',
      connectsTo: ['view', 'logic', 'page'],
      icon: 'package',
      edgeType: 'package'
    },
    {
      position: 'top',
      type: 'target',
      dataFlow: 'control',
      acceptsFrom: ['logic', 'container'],
      icon: 'arrow-down',
      edgeType: 'default'
    }
    ,
    {
      position: 'bottom',
      type: 'source',
      dataFlow: 'control',
      connectsTo: ['logic', 'container', 'page'],
      icon: 'arrow-down',
      edgeType: 'default'
    }
    ,
    {
      position: 'left',
      type: 'target',
      dataFlow: 'reference',
      acceptsFrom: ['logic'],
      icon: 'link',
      edgeType: 'default'
    }
  ]
};