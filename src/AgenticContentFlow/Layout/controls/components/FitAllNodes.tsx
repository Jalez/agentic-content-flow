import React, { useCallback } from "react";
import { Maximize2 } from "lucide-react"; // Replace MUI icon with Lucide icon
import { useReactFlow } from "@xyflow/react";
import { useLayoutContext } from "@jalez/react-flow-automated-layout";
import { VIEWPORT_CONSTRAINTS } from "../../../constants";
import ControlButton from "../../../Controls/Components/ControlButton";

const FitAllNodes: React.FC = () => {
  const reactFlowInstance = useReactFlow();
  const { layoutInProgress } = useLayoutContext();

  const handleFitAllNodes = useCallback(() => {
    reactFlowInstance.fitView({ 
      padding: VIEWPORT_CONSTRAINTS.FIT_VIEW_PADDING || 0.2, 
      duration: VIEWPORT_CONSTRAINTS.CENTER_ANIMATION_DURATION || 800 
    });
  }, [reactFlowInstance]);

  return (
    <ControlButton
      tooltip="Fit All Nodes"
      onClick={handleFitAllNodes}
      icon={<Maximize2 className="size-5" />} // Add size class for consistency
      disabled={layoutInProgress}
    />
  );
};

export default FitAllNodes;