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
import ViewNode from "./ViewNode/ViewNode";
import { createViewNodeTemplate } from "./ViewNode/createViewNodeTemplate";
import ConditionalNode from "./ConditionalNode/ConditionalNode";
import { createConditionalNodeTemplate } from "./ConditionalNode/createConditionalNodeTemplate";

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
  registerNodeType("viewnode", ViewNode, createViewNodeTemplate, true);
  registerNodeType("conditionalnode", ConditionalNode, createConditionalNodeTemplate);

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
        "viewnode", 
        "conditionalnode"
      ] 
    }
  );
}
