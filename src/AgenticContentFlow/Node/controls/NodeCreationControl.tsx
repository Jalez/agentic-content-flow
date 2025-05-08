import React, { useState } from "react";
import { useReactFlow } from "@xyflow/react";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ControlButton from "../../Controls/Components/ControlButton";
import { createNodeFromTemplate } from "../registry/nodeTypeRegistry";
import { useNodeStore } from "../store/useNodeStore";
import { useSelect } from "../../Select/contexts/SelectContext";
import { useEdgeStore } from "../../stores";
import { useTrackableState, useTransaction } from "@jalez/react-state-history";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface NodeCreationControlProps {
  availableNodeTypes: string[];
}

const NodeCreationControl: React.FC<NodeCreationControlProps> = ({
  availableNodeTypes,
}) => {
  const { addNodeToStore, removeNodes } = useNodeStore();
  const { addEdgeToStore, setEdges, edges } = useEdgeStore();
  const { screenToFlowPosition } = useReactFlow();
  const { selectedNodes } = useSelect();
  const { withTransaction } = useTransaction();

  const trackAddNodeToStore = useTrackableState(
    "NodeCreationControl/AddNode",
    addNodeToStore,
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
    //If there are selected nodes and these nodes are not containers, connect the new node to the first selected node as a child

    //  const newEdge = {
    //       id: `e-${connectionState.fromNode.id}-${newNodeId}`,
    //       source: connectionState.fromNode.id,
    //       target: newNodeId,
    //     };
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
        trackAddNodeToStore(newNode,[newNode]);
      }
    }, "NodeCreationControl/Add");

    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <span>
          <ControlButton
            tooltip="Create New Node"
            onClick={(e) => e.preventDefault()}
            icon={<AddCircleOutlineIcon />}
          />
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {availableNodeTypes.map((nodeType) => (
          <DropdownMenuItem key={nodeType} onClick={() => handleNodeTypeSelect(nodeType)}>
            {nodeType}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NodeCreationControl;
