import React, { useCallback } from "react";
import { IconButton, Tooltip } from "@mui/material";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import { useLayoutContext } from "@jalez/react-flow-automated-layout";

const ApplyLayout: React.FC = () => {
  const { layoutInProgress, applyLayout } = useLayoutContext();

  const handleApplyLayout = useCallback(() => {
    applyLayout();
  }, [applyLayout]);

  return (
    <Tooltip title="Apply Layout">
        <IconButton
          onClick={handleApplyLayout}
          color="primary"
          disabled={layoutInProgress}
        >
          <AutoFixHighIcon />
        </IconButton>
    </Tooltip>
  );
};

export default ApplyLayout;