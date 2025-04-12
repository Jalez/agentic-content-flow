/** @format */

import { registerControl } from "../Controls/registry/controlsRegistry";
import { registerNodeType } from "../Node/registry/nodeTypeRegistry";
import NodeCreationControl from "../Node/controls/NodeCreationControl";
import { CellNode } from "./CellNode/CellNode";
import { createCellNodeTemplate } from "./CellNode/createCellNodeTemplate";
import ContainerNode from "./ContainerNode/ContainerNode";
import { createContainerNodeTemplate } from "./ContainerNode/createContainerNodeTemplate";

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

  // Register the node creation control with all available node types
  registerControl(
    "viewSettings",
    "mindmap",
    "node-creation",
    NodeCreationControl,
    { availableNodeTypes: ["cellnode", "coursenode", "modulenode"] }
  );
}
