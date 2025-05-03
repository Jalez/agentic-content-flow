import React, { useCallback } from "react";
import { IconButton, Tooltip } from "@mui/material";
import FitScreenIcon from "@mui/icons-material/FitScreen";
import { useReactFlow } from "@xyflow/react";
import { useLayoutContext } from "@jalez/react-flow-automated-layout";
import { VIEWPORT_CONSTRAINTS } from "../../../constants";

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
    <Tooltip title="Fit All Nodes">
      <span>
        <IconButton
          onClick={handleFitAllNodes}
          color="inherit"
          disabled={layoutInProgress}
        >
          <FitScreenIcon />
        </IconButton>
      </span>
    </Tooltip>
  );
};

export default FitAllNodes;