/** @format */

export type HandlePosition = 'top' | 'bottom' | 'left' | 'right';
export type DataFlowType = 'data' | 'control' | 'reference' | 'dependency' | 'analytics' | 'utility' | 'statistics' | 'view';
export type NodeCategory = 'data' | 'view' | 'logic' | 'container' | 'page' | 'utility' | 'statistics';

export interface HandleTypeDefinition {
  position: HandlePosition;
  type: 'source' | 'target' | 'both';
  dataFlow: DataFlowType;
  acceptsFrom?: NodeCategory[];
  connectsTo?: NodeCategory[];
  icon?: string; // Icon identifier
  color?: string;
  edgeType?: string; // Which edge type to use for this connection
}

export interface NodeHandleConfiguration {
  nodeType: string;
  category: NodeCategory;
  handles: HandleTypeDefinition[];
}

export interface ConnectionCompatibility {
  isValid: boolean;
  edgeType?: string;
  reason?: string;
}