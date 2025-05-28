/** @format */
import { handleRegistry } from './handleTypeRegistry';
import { NodeHandleConfiguration } from '../../types/handleTypes';

// Track initialization state
let registered = false;

/**
 * Register basic handle configurations for all node types
 */
export function ensureHandleTypesRegistered(): void {
  if (registered) return;
  registered = true;

  console.log('🔧 Starting handle type registration...');

  // Data Node - outputs data via package edges, accepts control from logic/container
  const dataNodeConfig: NodeHandleConfiguration = {
    nodeType: 'datanode',
    category: 'data',
    handles: [
      {
        position: 'right',
        type: 'source',
        dataFlow: 'data',
        connectsTo: ['view', 'logic', 'page'],
        icon: 'package',
        color: '#10b981', // emerald-500
        edgeType: 'package'
      },
      {
        position: 'top',
        type: 'target',
        dataFlow: 'control',
        acceptsFrom: ['logic', 'container'],
        icon: 'arrow-down',
        color: '#6b7280', // gray-500
        edgeType: 'default'
      }
    ]
  };

  // View Node - accepts data from data nodes, outputs control to logic
  const viewNodeConfig: NodeHandleConfiguration = {
    nodeType: 'viewnode',
    category: 'view',
    handles: [
      {
        position: 'left',
        type: 'target',
        dataFlow: 'data',
        acceptsFrom: ['data'],
        icon: 'package',
        color: '#10b981', // emerald-500
        edgeType: 'package'
      },
      {
        position: 'bottom',
        type: 'source',
        dataFlow: 'control',
        connectsTo: ['logic'],
        icon: 'arrow-down',
        color: '#6b7280', // gray-500
        edgeType: 'default'
      }
    ]
  };

  // Conditional Node (logic) - accepts control, outputs control with branching
  const conditionalNodeConfig: NodeHandleConfiguration = {
    nodeType: 'conditionalnode',
    category: 'logic',
    handles: [
      {
        position: 'top',
        type: 'target',
        dataFlow: 'control',
        acceptsFrom: ['view', 'logic', 'container'],
        icon: 'arrow-down',
        color: '#6b7280', // gray-500
        edgeType: 'default'
      },
      {
        position: 'bottom',
        type: 'source',
        dataFlow: 'control',
        connectsTo: ['logic', 'container', 'page'],
        icon: 'arrow-down',
        color: '#6b7280', // gray-500
        edgeType: 'default'
      }
    ]
  };

  // Page Node - accepts control/dependencies, represents final destinations
  const pageNodeConfig: NodeHandleConfiguration = {
    nodeType: 'pagenode',
    category: 'page',
    handles: [
      {
        position: 'top',
        type: 'target',
        dataFlow: 'control',
        acceptsFrom: ['logic', 'container'],
        icon: 'arrow-down',
        color: '#6b7280', // gray-500
        edgeType: 'default'
      },
      {
        position: 'bottom',
        type: 'source',
        dataFlow: 'control',
        connectsTo: ['logic', 'container', 'page'],
        icon: 'arrow-down',
        color: '#6b7280', // gray-500
        edgeType: 'default'
      },
      {
        position: 'left',
        type: 'target',
        dataFlow: 'data',
        acceptsFrom: ['data'],
        icon: 'package',
        color: '#10b981', // emerald-500
        edgeType: 'package'
      },
      {
        position: 'right',
        type: 'source',
        dataFlow: 'analytics',
        connectsTo: ['statistics'],
        icon: 'chart',
        color: '#f59e0b', // amber-500
        edgeType: 'default'
      }
    ]
  };

  // Container Nodes (course/module) - manage hierarchical relationships
  const containerNodeConfig: NodeHandleConfiguration = {
    nodeType: 'coursenode',
    category: 'container',
    handles: [
      {
        position: 'top',
        type: 'target',
        dataFlow: 'dependency',
        acceptsFrom: ['container'],
        icon: 'link',
        color: '#8b5cf6', // violet-500
        edgeType: 'default'
      },
      {
        position: 'bottom',
        type: 'source',
        dataFlow: 'control',
        connectsTo: ['container', 'logic', 'page'],
        icon: 'arrow-down',
        color: '#6b7280', // gray-500
        edgeType: 'default'
      }
    ]
  };

  // Module Node (similar to course but different hierarchy level)
  const moduleNodeConfig: NodeHandleConfiguration = {
    nodeType: 'modulenode',
    category: 'container',
    handles: [
      {
        position: 'top',
        type: 'target',
        dataFlow: 'control',
        acceptsFrom: ['container'],
        icon: 'arrow-down',
        color: '#6b7280', // gray-500
        edgeType: 'default'
      },
      {
        position: 'bottom',
        type: 'source',
        dataFlow: 'control',
        connectsTo: ['logic', 'view'],
        icon: 'arrow-down',
        color: '#6b7280', // gray-500
        edgeType: 'default'
      }
    ]
  };

  // Cell Node - general purpose, flexible connections
  const cellNodeConfig: NodeHandleConfiguration = {
    nodeType: 'cellnode',
    category: 'logic',
    handles: [
      {
        position: 'top',
        type: 'target',
        dataFlow: 'control',
        acceptsFrom: ['logic', 'container'],
        icon: 'arrow-down',
        color: '#6b7280', // gray-500
        edgeType: 'default'
      },
      {
        position: 'bottom',
        type: 'source',
        dataFlow: 'control',
        connectsTo: ['logic', 'page'],
        icon: 'arrow-down',
        color: '#6b7280', // gray-500
        edgeType: 'default'
      },
      {
        position: 'left',
        type: 'target',
        dataFlow: 'reference',
        acceptsFrom: ['logic'],
        icon: 'link',
        color: '#8b5cf6', // violet-500
        edgeType: 'default'
      },
      {
        position: 'right',
        type: 'source',
        dataFlow: 'reference',
        connectsTo: ['logic'],
        icon: 'link',
        color: '#8b5cf6', // violet-500
        edgeType: 'default'
      }
    ]
  };

  // Invisible Node - used for layout, minimal handles
  const invisibleNodeConfig: NodeHandleConfiguration = {
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

  // Statistics Node - accepts analytics data from pages
  const statisticsNodeConfig: NodeHandleConfiguration = {
    nodeType: 'statisticsnode',
    category: 'statistics',
    handles: [
      {
        position: 'left',
        type: 'target',
        dataFlow: 'analytics',
        acceptsFrom: ['page'],
        icon: 'chart',
        color: '#f59e0b', // amber-500
        edgeType: 'default'
      }
    ]
  };

  // Register all configurations
  console.log('📝 Registering handle configurations...');
  handleRegistry.registerNodeHandles(dataNodeConfig);
  handleRegistry.registerNodeHandles(viewNodeConfig);
  handleRegistry.registerNodeHandles(conditionalNodeConfig);
  handleRegistry.registerNodeHandles(pageNodeConfig);
  handleRegistry.registerNodeHandles(containerNodeConfig);
  handleRegistry.registerNodeHandles(moduleNodeConfig);
  handleRegistry.registerNodeHandles(cellNodeConfig);
  handleRegistry.registerNodeHandles(invisibleNodeConfig);
  handleRegistry.registerNodeHandles(statisticsNodeConfig);
  
  console.log('✅ Handle types registered. Total configurations:', handleRegistry.getRegisteredNodeTypes().length);
  console.log('📋 Registered node types:', handleRegistry.getRegisteredNodeTypes());
}