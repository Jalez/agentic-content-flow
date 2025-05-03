import { useSelect } from "../contexts/SelectContext";

import ControlButton from "../../Controls/Components/ControlButton";
import CenterFocusStrongIcon from "@mui/icons-material/CenterFocusStrong";

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
      icon={<CenterFocusStrongIcon />}
      onClick={handleCenterOnSelected}
      disabled={!hasSelection}
      active={hasSelection}
    />
  );
};

export default CenterSelectedButton;
