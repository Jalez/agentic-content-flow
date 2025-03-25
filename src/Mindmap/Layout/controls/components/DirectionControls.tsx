import React from "react";
import { MenuItem, Typography } from "@mui/material";
import { LayoutDirection } from "../../store/useLayoutStore";

interface DirectionControlsProps {
  direction: LayoutDirection;
  onDirectionChange: (direction: LayoutDirection) => void;
}

const DirectionControls: React.FC<DirectionControlsProps> = ({
  direction,
  onDirectionChange,
}) => (
  <>
    <Typography variant="subtitle2" sx={{ px: 2, py: 1 }}>
      Layout Direction
    </Typography>

    <MenuItem
      onClick={() => onDirectionChange("DOWN")}
      selected={direction === "DOWN"}
    >
      Top to Bottom
    </MenuItem>

    <MenuItem
      onClick={() => onDirectionChange("RIGHT")}
      selected={direction === "RIGHT"}
    >
      Left to Right
    </MenuItem>

    <MenuItem
      onClick={() => onDirectionChange("LEFT")}
      selected={direction === "LEFT"}
    >
      Right to Left
    </MenuItem>

    <MenuItem
      onClick={() => onDirectionChange("UP")}
      selected={direction === "UP"}
    >
      Bottom to Top
    </MenuItem>
  </>
);

export default DirectionControls;
