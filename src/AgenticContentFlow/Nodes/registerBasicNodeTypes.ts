/** @format */

import { registerControl } from "../Controls/registry/controlsRegistry";
import { registerNodeType } from "../Node/registry/nodeTypeRegistry";
import NodeCreationControl from "../Node/controls/NodeCreationControl";

// Import existing node components
import { CellNode } from "./CellNode/CellNode";
import { createCellNodeTemplate } from "./CellNode/createCellNodeTemplate";
import ContainerNode from "./ContainerNode/ContainerNode";
import { createContainerNodeTemplate } from "./ContainerNode/createContainerNodeTemplate";

// Import new node components
import DataNode from "./DataNode/DataNode";
import { createDataNodeTemplate } from "./DataNode/createDataNodeTemplate";
import PageNode from "./PageNode/PageNode";
import { createPageNodeTemplate } from "./PageNode/createPageNodeTemplate";
import ContentNode from "./ContentNode/ContentNode";
import { createContentNodeTemplate } from "./ContentNode/createContentNodeTemplate";
import ConditionalNode from "./ConditionalNode/ConditionalNode";
import { createConditionalNodeTemplate } from "./ConditionalNode/createConditionalNodeTemplate";
import { InvisibleNode } from './InvisibleNode/InvisibleNode';
import { createInvisibleNodeTemplate } from './InvisibleNode/createInvisibleNodeTemplate';
import { StatisticsNode } from './StatisticsNode/StatisticsNode';
import { createStatisticsNodeTemplate } from "./StatisticsNode/createStatisticsNodeTemplate";
import RestNode from "./RestNode/RestNode";
import { createRestNodeTemplate } from "./RestNode/createRestNodeTemplate";

// Import handle type registration
import { ensureHandleTypesRegistered } from "../Handles/registerBasicHandleTypes";

// Track initialization state
let registered = false;

/**
 * Call this function to ensure node types are registered
 */
export function ensureNodeTypesRegistered(): void {
  if (registered) return;
  registered = true;

  // Register basic node types
  registerNodeType("cellnode", CellNode, createCellNodeTemplate);
  
  // Register container nodes with isParent=true
  registerNodeType("coursenode", ContainerNode, createContainerNodeTemplate, true);
  registerNodeType("modulenode", ContainerNode, createContainerNodeTemplate, true);
  
  // Register new node types
  registerNodeType("datanode", DataNode, createDataNodeTemplate, true);
  registerNodeType("pagenode", PageNode, createPageNodeTemplate, true);
  registerNodeType("contentnode", ContentNode, createContentNodeTemplate, true);
  registerNodeType("conditionalnode", ConditionalNode, createConditionalNodeTemplate);
  registerNodeType("invisiblenode", InvisibleNode, createInvisibleNodeTemplate, true);
  registerNodeType("statisticsnode", StatisticsNode, createStatisticsNodeTemplate, true);
  registerNodeType("restnode", RestNode, createRestNodeTemplate, false);

  // Register handle type configurations
  ensureHandleTypesRegistered();

  // Register the node creation control with all available node types
  registerControl(
    "viewSettings",
    "mindmap",
    "node-creation",
    NodeCreationControl,
    { 
      availableNodeTypes: [
        "cellnode", 
        "coursenode", 
        "modulenode", 
        "datanode", 
        "pagenode", 
        "contentnode", 
        "conditionalnode",
        "invisiblenode",
        "statisticsnode",
        "restnode"
      ] 
    }
  );
}
