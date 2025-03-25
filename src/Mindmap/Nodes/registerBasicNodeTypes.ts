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
 * Initialize the node type registry with default node types
 *
 * Initialize the node type registry with default node types
 *
 * This function should be called once when the application starts
 */
export function initializeNodeTypeRegistry(): void {
  // Register the custom node type
  registerNodeType("cellnode", CellNode, createCellNodeTemplate);

  // Register the group node type
  registerNodeType("coursenode", ContainerNode, createContainerNodeTemplate);

  // Register the module node type
  registerNodeType("modulenode", ContainerNode, createContainerNodeTemplate);

  // Additional node types can be registered here
}

/**
 * Call this function to ensure node types are registered
 */
export function ensureNodeTypesRegistered(): void {
  if (registered) return;
  registered = true;

  // Register basic node types
  registerNodeType("cellnode", CellNode, createCellNodeTemplate);
  registerNodeType("coursenode", ContainerNode, createContainerNodeTemplate);
  registerNodeType("modulenode", ContainerNode, createContainerNodeTemplate);

  // Register the node creation control with all available node types
  registerControl(
    "viewSettings",
    "mindmap",
    "node-creation",
    NodeCreationControl,
    { availableNodeTypes: ["cellnode", "coursenode", "modulenode"] }
  );
}
