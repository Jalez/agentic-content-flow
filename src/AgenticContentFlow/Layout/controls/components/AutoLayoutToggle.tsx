import React, { useCallback } from "react";
import { IconButton, Tooltip } from "@mui/material";
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { useLayoutContext } from "@jalez/react-flow-automated-layout";

const AutoLayoutToggle: React.FC = () => {
  const { autoLayout, setAutoLayout } = useLayoutContext();
  
  const handleAutoLayoutToggle = useCallback(() => {
    setAutoLayout(!autoLayout);
  }, [autoLayout, setAutoLayout]);

  return (
    <Tooltip title={autoLayout ? "Disable Auto Layout" : "Enable Auto Layout"}>
      <IconButton
        onClick={handleAutoLayoutToggle}
        color={autoLayout ? "primary" : "inherit"}
      >
        <AutorenewIcon />
      </IconButton>
    </Tooltip>
  );
};

export default AutoLayoutToggle;
