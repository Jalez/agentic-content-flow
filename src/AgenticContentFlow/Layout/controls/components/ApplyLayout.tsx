import React, { useCallback } from "react";
import { Wand2 } from "lucide-react"; // Replace MUI icon with Lucide icon
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
      icon={<Wand2 className="size-5" />} // Add size class for consistency
      disabled={layoutInProgress}
    />
  );
};

export default ApplyLayout;