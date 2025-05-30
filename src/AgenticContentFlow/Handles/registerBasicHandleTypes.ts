/** @format */
import { handleRegistry } from '../Handle/registry/handleTypeRegistry';
import {
  dataNodeConfig,
  contentNodeConfig,
  conditionalNodeConfig,
  pageNodeConfig,
  containerNodeConfig,
  moduleNodeConfig,
  cellNodeConfig,
  invisibleNodeConfig,
  statisticsNodeConfig
} from './configs';
import { restNodeConfig } from './configs/restnode-handles';

// Track initialization state
let registered = false;

/**
 * Register basic handle configurations for all node types
 */
export function ensureHandleTypesRegistered(): void {
  if (registered) return;
  registered = true;

  console.log('🔧 Starting handle type registration...');

  // Register all configurations
  console.log('📝 Registering handle configurations...');
  handleRegistry.registerNodeHandles(dataNodeConfig);
  handleRegistry.registerNodeHandles(contentNodeConfig);
  handleRegistry.registerNodeHandles(conditionalNodeConfig);
  handleRegistry.registerNodeHandles(pageNodeConfig);
  handleRegistry.registerNodeHandles(containerNodeConfig);
  handleRegistry.registerNodeHandles(moduleNodeConfig);
  handleRegistry.registerNodeHandles(cellNodeConfig);
  handleRegistry.registerNodeHandles(invisibleNodeConfig);
  handleRegistry.registerNodeHandles(statisticsNodeConfig);
  handleRegistry.registerNodeHandles(restNodeConfig);
  
  console.log('✅ Handle types registered. Total configurations:', handleRegistry.getRegisteredNodeTypes().length);
  console.log('📋 Registered node types:', handleRegistry.getRegisteredNodeTypes());
}