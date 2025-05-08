import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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
    <DropdownMenu open={Boolean(anchorEl)} onOpenChange={() => onClose()}>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={handleAddParent}>
          Add Parent
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleAddChild}>
          Add Child
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDelete} className="text-red-600">
          Delete Node
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
