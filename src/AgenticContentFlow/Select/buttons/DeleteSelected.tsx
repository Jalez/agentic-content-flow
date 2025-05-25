import { useSelect } from "../contexts/SelectContext";
import ControlButton from "../../Controls/Components/ControlButton";
  import { Trash2 } from "lucide-react";

/**
 * @description
 * Button to delete selected nodes in the mindmap.
 * This button is disabled when no nodes are selected.
 * @return {JSX.Element}
 * @constructor
 * @category Mindmap
 * @subcategory Select
 * @component
 * @example
 * <DeleteSelectedButton />
*/
const DeleteSelectedButton = () => {
  const { hasSelection, deleteSelected } = useSelect();

  return (
    <ControlButton
      key="deleteSelected"
      tooltip={"Delete Selected"}
      icon={<Trash2 className="size-4" />}
      onClick={deleteSelected}
      disabled={!hasSelection}
    />
  );
};

export default DeleteSelectedButton;
