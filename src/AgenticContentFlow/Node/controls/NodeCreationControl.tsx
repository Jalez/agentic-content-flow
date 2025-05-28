import React, { useState } from "react";
import { useReactFlow } from "@xyflow/react";
import { PlusCircle } from "lucide-react";
import ControlDropdown from "../../Controls/Components/ControlDropdown";
import { createNodeFromTemplate } from "../registry/nodeTypeRegistry";
import { useNodeContext } from "../store/useNodeContext";
import { useSelect } from "../../Select/contexts/SelectContext";
import { useEdgeContext } from "../../Edge/store/useEdgeContext";
import { useTransaction } from "@jalez/react-state-history";
import { getHandlesForNodeType } from "../../Edge/hooks/utils/edgeUtils";

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


          // Add the edge
          onEdgeAdd(newEdge);




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
