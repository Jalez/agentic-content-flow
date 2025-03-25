import React from "react";
import { Box, Typography, Slider } from "@mui/material";

interface SpacingControlsProps {
  algorithm: string;
  nodeSpacing: number;
  layerSpacing: number;
  onNodeSpacingChange: (event: any, value: number | number[]) => void;
  onLayerSpacingChange: (event: any, value: number | number[]) => void;
  onSpacingChangeCommitted: () => void;
}

const SpacingControls: React.FC<SpacingControlsProps> = ({
  algorithm,
  nodeSpacing,
  layerSpacing,
  onNodeSpacingChange,
  onLayerSpacingChange,
  onSpacingChangeCommitted,
}) => (
  <Box sx={{ px: 2, py: 1 }}>
    <Typography id="node-spacing-slider" gutterBottom variant="body2">
      Node Spacing: {nodeSpacing}px
    </Typography>
    <Slider
      aria-labelledby="node-spacing-slider"
      value={nodeSpacing}
      onChange={onNodeSpacingChange}
      onChangeCommitted={onSpacingChangeCommitted}
      min={50}
      max={300}
      step={10}
      valueLabelDisplay="auto"
    />

    {algorithm !== "mrtree" && (
      <>
        <Typography
          id="layer-spacing-slider"
          gutterBottom
          variant="body2"
          sx={{ mt: 2 }}
        >
          Layer Spacing: {layerSpacing}px
        </Typography>
        <Slider
          aria-labelledby="layer-spacing-slider"
          value={layerSpacing}
          onChange={onLayerSpacingChange}
          onChangeCommitted={onSpacingChangeCommitted}
          min={50}
          max={300}
          step={10}
          valueLabelDisplay="auto"
        />
      </>
    )}
  </Box>
);

export default SpacingControls;
