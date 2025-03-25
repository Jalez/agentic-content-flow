import { useSelect } from "../contexts/SelectContext";
import ControlButton from "../../Controls/Components/ControlButton";
import DeleteIcon from "@mui/icons-material/Delete";

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
 * @see {@link https://mui.com/material-ui/material-icons/} for more icons
 * @see {@link https://mui.com/material-ui/react-button/#basic-button} for more button examples
 * @see {@link https://mui.com/material-ui/react-tooltip/#basic-tooltip} for more tooltip examples
 */
const DeleteSelectedButton = () => {
  const { hasSelection, deleteSelected } = useSelect();

  return (
    <ControlButton
      key="deleteSelected"
      tooltip={"Delete Selected"}
      icon={<DeleteIcon />}
      onClick={deleteSelected}
      disabled={!hasSelection}
      active={hasSelection}
    />
  );
};

export default DeleteSelectedButton;
