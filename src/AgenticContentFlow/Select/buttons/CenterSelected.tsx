import { useSelect } from "../contexts/SelectContext";
import ControlButton from "../../Controls/Components/ControlButton";
import { Target } from "lucide-react";

/**
 * @description This button is used to center the view on the selected nodes in the mindmap.
 * It is disabled when there are no selected nodes or edges.
 * @returns {JSX.Element}
 */
const CenterSelectedButton = () => {
  const { hasSelection, handleCenterOnSelected } = useSelect();

  return (
    <ControlButton
      key="centerSelected"
      tooltip={"Center Selected"}
      icon={<Target className="size-4" />}
      onClick={handleCenterOnSelected}
      disabled={!hasSelection}

    />
  );
};

export default CenterSelectedButton;
