import React, { useCallback } from "react";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import { useLayoutContext } from "@jalez/react-flow-automated-layout";
import ControlButton from "../../../Controls/Components/ControlButton";

const ApplyLayout: React.FC = () => {
  const { layoutInProgress, applyLayout } = useLayoutContext();

  const handleApplyLayout = useCallback(() => {
    applyLayout();
  }, [applyLayout]);

  return (
    <ControlButton
      tooltip="Apply Layout"
      onClick={handleApplyLayout}
      icon={<AutoFixHighIcon />}
      disabled={layoutInProgress}
    />
  );
};

export default ApplyLayout;