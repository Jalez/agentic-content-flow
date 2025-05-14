import React, { useCallback } from "react";
import { RefreshCcw } from "lucide-react";
import { useLayoutContext } from "@jalez/react-flow-automated-layout";
import ControlButton from "../../../Controls/Components/ControlButton";

const AutoLayoutToggle: React.FC = () => {
  const { autoLayout, setAutoLayout } = useLayoutContext();
  
  const handleAutoLayoutToggle = useCallback(() => {
    setAutoLayout(!autoLayout);
  }, [autoLayout, setAutoLayout]);

  return (
    <ControlButton
      tooltip={autoLayout ? "Disable Auto Layout" : "Enable Auto Layout"}
      onClick={handleAutoLayoutToggle}
      icon={<RefreshCcw className="size-4" />}
      active={autoLayout}
    />
  );
};

export default AutoLayoutToggle;
