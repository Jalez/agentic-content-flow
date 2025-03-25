import { Menu, MenuItem } from "@mui/material";
import { useSelect } from "../../Select/contexts/SelectContext";
import { useConnectionOperations } from "../../Node/hooks/useConnectionOperations";
import { NodeData } from "../../types";
import { Node } from "@xyflow/react";

interface CellNodeContextMenuProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  node: Node<NodeData>;
}

export const CellNodeMenu = ({
  anchorEl,
  onClose,
  node,
}: CellNodeContextMenuProps) => {
  const { addSourceNode, addTargetNode } = useConnectionOperations();
  const { deleteSelected } = useSelect();

  const handleAddParent = () => {
    addSourceNode(node);
    onClose();
  };

  const handleAddChild = () => {
    addTargetNode(node);
    onClose();
  };

  const handleDelete = () => {
    deleteSelected();
    onClose();
  };

  return (
    <Menu
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
    >
      <MenuItem onClick={handleAddParent}>Add Parent</MenuItem>
      <MenuItem onClick={handleAddChild}>Add Child</MenuItem>
      <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
        Delete Node
      </MenuItem>
    </Menu>
  );
};
