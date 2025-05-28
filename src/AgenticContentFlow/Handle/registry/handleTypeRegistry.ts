/** @format */
import { 
  NodeHandleConfiguration, 
  HandleTypeDefinition, 
  ConnectionCompatibility,
  NodeCategory 
} from '../../types/handleTypes';

export class HandleTypeRegistry {
  private static instance: HandleTypeRegistry;
  private configurations = new Map<string, NodeHandleConfiguration>();
  
  static getInstance(): HandleTypeRegistry {
    if (!HandleTypeRegistry.instance) {
      HandleTypeRegistry.instance = new HandleTypeRegistry();
    }
    return HandleTypeRegistry.instance;
  }
  
  /**
   * Register handle configuration for a node type
   */
  registerNodeHandles(config: NodeHandleConfiguration): void {
    this.configurations.set(config.nodeType, config);
  }
  
  /**
   * Get all handle definitions for a node type
   */
  getNodeHandles(nodeType: string): HandleTypeDefinition[] {
    const config = this.configurations.get(nodeType);
    return config?.handles || [];
  }
  
  /**
   * Get the node category for a given node type
   */
  getNodeCategory(nodeType: string): NodeCategory | undefined {
    const config = this.configurations.get(nodeType);
    return config?.category;
  }
  
  /**
   * Get a specific handle definition by node type and position
   */
  getHandle(nodeType: string, position: string): HandleTypeDefinition | undefined {
    const handles = this.getNodeHandles(nodeType);
    return handles.find(handle => handle.position === position);
  }
  
  /**
   * Check if two nodes can connect via specific handles
   */
  canConnect(
    sourceNodeType: string, 
    sourceHandle: string, 
    targetNodeType: string, 
    targetHandle: string
  ): ConnectionCompatibility {
    const sourceHandleDef = this.getHandle(sourceNodeType, sourceHandle);
    const targetHandleDef = this.getHandle(targetNodeType, targetHandle);
    const sourceCategory = this.getNodeCategory(sourceNodeType);
    const targetCategory = this.getNodeCategory(targetNodeType);
    
    if (!sourceHandleDef || !targetHandleDef || !sourceCategory || !targetCategory) {
      return { 
        isValid: false, 
        reason: 'Handle or node category not found' 
      };
    }
    
    // Check if source handle can connect to target category
    if (sourceHandleDef.connectsTo && !sourceHandleDef.connectsTo.includes(targetCategory)) {
      return { 
        isValid: false, 
        reason: `Source handle cannot connect to ${targetCategory} nodes` 
      };
    }
    
    // Check if target handle can accept from source category
    if (targetHandleDef.acceptsFrom && !targetHandleDef.acceptsFrom.includes(sourceCategory)) {
      return { 
        isValid: false, 
        reason: `Target handle cannot accept connections from ${sourceCategory} nodes` 
      };
    }
    
    // Check handle types compatibility (source -> target)
    if (sourceHandleDef.type === 'target' || targetHandleDef.type === 'source') {
      return { 
        isValid: false, 
        reason: 'Invalid handle direction for connection' 
      };
    }
    
    // Determine edge type - prefer source handle's edge type, fall back to target
    const edgeType = sourceHandleDef.edgeType || targetHandleDef.edgeType || 'default';
    
    return { 
      isValid: true, 
      edgeType 
    };
  }
  
  /**
   * Get edge type for a valid connection
   */
  getEdgeTypeForConnection(
    sourceNodeType: string, 
    sourceHandle: string, 
    targetNodeType: string, 
    targetHandle: string
  ): string {
    const compatibility = this.canConnect(sourceNodeType, sourceHandle, targetNodeType, targetHandle);
    return compatibility.edgeType || 'default';
  }
  
  /**
   * Get compatible target categories for a source handle
   */
  getCompatibleTargets(sourceNodeType: string, sourceHandle: string): NodeCategory[] {
    const handleDef = this.getHandle(sourceNodeType, sourceHandle);
    return handleDef?.connectsTo || [];
  }
  
  /**
   * Get all registered node types
   */
  getRegisteredNodeTypes(): string[] {
    return Array.from(this.configurations.keys());
  }
  
  /**
   * Clear all registrations (useful for testing)
   */
  clear(): void {
    this.configurations.clear();
  }
}

// Export singleton instance for convenience
export const handleRegistry = HandleTypeRegistry.getInstance();