import React, { useState } from "react";
import { Menu, MenuItem, Tooltip } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { useReactFlow } from "@xyflow/react";
import ControlButton from "../../Controls/Components/ControlButton";
import { createNodeFromTemplate } from "../registry/nodeTypeRegistry";
import { useNodeStore } from "../store/useNodeStore";
import { useSelect } from "../../Select/contexts/SelectContext";
import { useEdgeStore } from "../../stores";
import { useTrackableState, useTransaction } from "@jalez/react-state-history";

interface NodeCreationControlProps {
  availableNodeTypes: string[];
}

const NodeCreationControl: React.FC<NodeCreationControlProps> = ({
  availableNodeTypes,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { addNodeToStore, removeNode } = useNodeStore();
  const { addEdgeToStore, setEdges, edges } = useEdgeStore();
  const { screenToFlowPosition } = useReactFlow();
  const { selectedNodes } = useSelect();
  const { withTransaction } = useTransaction();

  const trackAddNodeToStore = useTrackableState(
    "NodeCreationControl/AddNode",
    addNodeToStore,
    removeNode
  );
  const trackAddEdgeToStore = useTrackableState(
    "NodeCreationControl/AddEdge",
    addEdgeToStore,
    setEdges
  );

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

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
        trackAddNodeToStore(newNode, newNode.id);
      }
    }, "NodeCreationControl/Add");

    handleClose();
  };

  return (
    <>
      <Tooltip title="Create New Node">
        <ControlButton
          tooltip="Create New Node"
          icon={<AddCircleOutlineIcon />}
          onClick={handleClick}
        />
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        {availableNodeTypes.map((nodeType) => (
          <MenuItem
            key={nodeType}
            onClick={() => handleNodeTypeSelect(nodeType)}
          >
            {nodeType}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default NodeCreationControl;
