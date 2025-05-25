import React, { useState } from "react";
import { useReactFlow, Node } from "@xyflow/react";
import { PlusCircle } from "lucide-react";
import ControlDropdown from "../../Controls/Components/ControlDropdown";
import { createNodeFromTemplate } from "../registry/nodeTypeRegistry";
import { useNodeContext } from "../store/useNodeContext";
import { useSelect } from "../../Select/contexts/SelectContext";
import { useEdgeContext } from "../../Edge/store/useEdgeContext";
import { useTransaction } from "@jalez/react-state-history";
import { useInvisibleNodeOperations } from "../hooks/useInvisibleNodeOperations";
import { getHandlesForNodeType } from "../hooks/utils/edgeUtils";
import { NodeData } from "../../types";

interface NodeCreationControlProps {
  availableNodeTypes: string[];
}

const NodeCreationControl: React.FC<NodeCreationControlProps> = ({
  availableNodeTypes,
}) => {
  const { addNode } = useNodeContext();
  const { onEdgeAdd } = useEdgeContext();
  const { screenToFlowPosition } = useReactFlow();
  const { selectedNodes } = useSelect();
  const { withTransaction } = useTransaction();
  const { 
    handleConnectionWithInvisibleNode,
    executeInvisibleNodeOperation 
  } = useInvisibleNodeOperations();

  const [open, setOpen] = useState(false);

  const handleNodeTypeSelect = (nodeType: string) => {
    const center = screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });

    // Create a new node at the center of the viewport
    const newNodeId = `node-${Date.now()}`;
    const newNode = createNodeFromTemplate(nodeType, {
      id: newNodeId,
      position: center,
      details: "Add details about this concept",
    });

    withTransaction(() => {
      // Add the new node first
      if (newNode) {
        addNode(newNode);
      }

      // Create connections to selected nodes with invisible node management
      for (const selectedNode of selectedNodes) {
        if (!selectedNode.data.isContainer && selectedNode.type) {
          // Get appropriate handles for the node types
          const selectedHandles = getHandlesForNodeType(selectedNode.type);
          const newNodeHandles = getHandlesForNodeType(nodeType);

          const newEdge = {
            id: `e-${selectedNode.id}-${newNodeId}`,
            source: selectedNode.id,
            target: newNodeId,
            sourceHandle: selectedHandles.sourceHandle,
            targetHandle: newNodeHandles.targetHandle,
          };

          // Handle invisible node management for horizontal connections
          if (newNode) {
            executeInvisibleNodeOperation(() => {
              // Cast nodes to the correct type since we know they have the required NodeData structure
              const typedSelectedNode = selectedNode as unknown as Node<NodeData>;
              const typedNewNode = newNode as Node<NodeData>;

              const result = handleConnectionWithInvisibleNode(
                newEdge,
                typedSelectedNode,
                typedNewNode
              );
              
              // Add the edge
              onEdgeAdd(newEdge);
              
              return result;
            }, `NodeCreationControl: Create connection with invisible node management`);
          }
        }
      }
    }, "NodeCreationControl/Add");

    setOpen(false);
  };

  return (
    <ControlDropdown
      tooltip="Create New Node"
      icon={<PlusCircle className="size-4" />}
      items={availableNodeTypes.map((nodeType) => ({
        key: nodeType,
        label: nodeType,
        onClick: () => handleNodeTypeSelect(nodeType)
      }))}
      open={open}
      onOpenChange={setOpen}
    />
  );
};

export default NodeCreationControl;
