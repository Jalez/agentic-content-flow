import React, { useState } from "react";
import { useReactFlow } from "@xyflow/react";
import { PlusCircle } from "lucide-react";
import ControlDropdown from "../../Controls/Components/ControlDropdown";
import { createNodeFromTemplate } from "../registry/nodeTypeRegistry";
import { useNodeContext } from "../store/useNodeContext";
import { useSelect } from "../../Select/contexts/SelectContext";
import { useEdgeContext } from "../../Edge/store/useEdgeContext";
import { useTrackableState, useTransaction } from "@jalez/react-state-history";

interface NodeCreationControlProps {
  availableNodeTypes: string[];
}

const NodeCreationControl: React.FC<NodeCreationControlProps> = ({
  availableNodeTypes,
}) => {
  const { addNode, removeNodes } = useNodeContext();
  const { addEdgeToStore, setEdges, edges } = useEdgeContext();
  const { screenToFlowPosition } = useReactFlow();
  const { selectedNodes } = useSelect();
  const { withTransaction } = useTransaction();

  const trackaddNode = useTrackableState(
    "NodeCreationControl/AddNode",
    addNode,
    removeNodes
  );
  const trackAddEdgeToStore = useTrackableState(
    "NodeCreationControl/AddEdge",
    addEdgeToStore,
    setEdges
  );

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
      for (const selectedNode of selectedNodes) {
        if (!selectedNode.data.isContainer) {
          const newEdge = {
            id: `e-${selectedNode.id}-${newNodeId}`,
            source: selectedNode.id,
            target: newNodeId,
          };
          trackAddEdgeToStore(newEdge, edges);
        }
      }

      if (newNode) {
        trackaddNode(newNode,[newNode]);
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
