import React from "react";
import { MenuItem, Typography } from "@mui/material";
import { LayoutAlgorithm } from "../../store/useLayoutStore";

interface AlgorithmControlsProps {
  algorithm: LayoutAlgorithm;
  onAlgorithmChange: (algorithm: LayoutAlgorithm) => void;
}

const AlgorithmControls: React.FC<AlgorithmControlsProps> = ({
  algorithm,
  onAlgorithmChange,
}) => (
  <>
    <Typography variant="subtitle2" sx={{ px: 2, py: 1 }}>
      Layout Algorithm
    </Typography>

    <MenuItem
      onClick={() => onAlgorithmChange("layered")}
      selected={algorithm === "layered"}
    >
      Layered (Hierarchical)
    </MenuItem>

    <MenuItem
      onClick={() => onAlgorithmChange("mrtree")}
      selected={algorithm === "mrtree"}
    >
      Tree
    </MenuItem>
  </>
);

export default AlgorithmControls;
