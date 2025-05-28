/** @format */
import { describe, it, expect, beforeEach } from 'vitest';
import { HandleTypeRegistry } from '../handleTypeRegistry';
import { NodeHandleConfiguration } from '../../../types/handleTypes';

describe('HandleTypeRegistry', () => {
  let registry: HandleTypeRegistry;

  beforeEach(() => {
    registry = HandleTypeRegistry.getInstance();
    registry.clear();
  });

  const sampleDataNodeConfig: NodeHandleConfiguration = {
    nodeType: 'datanode',
    category: 'data',
    handles: [
      {
        position: 'right',
        type: 'source',
        dataFlow: 'data',
        connectsTo: ['view'],
        edgeType: 'package'
      },
      {
        position: 'top',
        type: 'target',
        dataFlow: 'control',
        acceptsFrom: ['logic'],
        edgeType: 'default'
      }
    ]
  };

  const sampleViewNodeConfig: NodeHandleConfiguration = {
    nodeType: 'viewnode',
    category: 'view',
    handles: [
      {
        position: 'left',
        type: 'target',
        dataFlow: 'data',
        acceptsFrom: ['data'],
        edgeType: 'package'
      }
    ]
  };

  describe('registration and retrieval', () => {
    it('should register and retrieve node handle configurations', () => {
      registry.registerNodeHandles(sampleDataNodeConfig);
      
      const handles = registry.getNodeHandles('datanode');
      expect(handles).toHaveLength(2);
      expect(handles[0].position).toBe('right');
      expect(handles[1].position).toBe('top');
    });

    it('should return empty array for unregistered node types', () => {
      const handles = registry.getNodeHandles('unknownnode');
      expect(handles).toHaveLength(0);
    });

    it('should get node category', () => {
      registry.registerNodeHandles(sampleDataNodeConfig);
      
      const category = registry.getNodeCategory('datanode');
      expect(category).toBe('data');
    });
  });

  describe('connection validation', () => {
    beforeEach(() => {
      registry.registerNodeHandles(sampleDataNodeConfig);
      registry.registerNodeHandles(sampleViewNodeConfig);
    });

    it('should allow valid connections', () => {
      const result = registry.canConnect('datanode', 'right', 'viewnode', 'left');
      
      expect(result.isValid).toBe(true);
      expect(result.edgeType).toBe('package');
    });

    it('should reject invalid connections', () => {
      const result = registry.canConnect('datanode', 'top', 'viewnode', 'left');
      
      expect(result.isValid).toBe(false);
      expect(result.reason).toContain('Invalid handle direction');
    });

    it('should reject connections with wrong handle directions', () => {
      const result = registry.canConnect('viewnode', 'left', 'datanode', 'right');
      
      expect(result.isValid).toBe(false);
      expect(result.reason).toBe('Invalid handle direction for connection');
    });
  });

  describe('edge type determination', () => {
    beforeEach(() => {
      registry.registerNodeHandles(sampleDataNodeConfig);
      registry.registerNodeHandles(sampleViewNodeConfig);
    });

    it('should return correct edge type for valid connections', () => {
      const edgeType = registry.getEdgeTypeForConnection('datanode', 'right', 'viewnode', 'left');
      expect(edgeType).toBe('package');
    });

    it('should return default edge type for invalid connections', () => {
      const edgeType = registry.getEdgeTypeForConnection('unknownnode', 'right', 'viewnode', 'left');
      expect(edgeType).toBe('default');
    });
  });

  describe('compatibility checking', () => {
    beforeEach(() => {
      registry.registerNodeHandles(sampleDataNodeConfig);
    });

    it('should return compatible target categories', () => {
      const targets = registry.getCompatibleTargets('datanode', 'right');
      expect(targets).toEqual(['view']);
    });

    it('should return empty array for unknown handles', () => {
      const targets = registry.getCompatibleTargets('unknownnode', 'right');
      expect(targets).toEqual([]);
    });
  });
});