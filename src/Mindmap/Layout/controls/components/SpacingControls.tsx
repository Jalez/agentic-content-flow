import React, { useState, useCallback } from "react";
import { 
  IconButton, 
  Tooltip, 
  Menu, 
  Box, 
  Typography,
  Slider
} from "@mui/material";
import SpaceBarIcon from '@mui/icons-material/SpaceBar';
import { useLayoutContext } from "@jalez/react-flow-automated-layout";

const SpacingControls: React.FC = () => {
  const { 
    algorithm = "elk",
    nodeSpacing, 
    layerSpacing, 
    setNodeSpacing,
    setLayerSpacing,
    applyLayout
  } = useLayoutContext();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNodeSpacingChange = useCallback((event: any, value: number | number[]) => {
    setNodeSpacing(value as number);
  }, [setNodeSpacing]);

  const handleLayerSpacingChange = useCallback((event: any, value: number | number[]) => {
    setLayerSpacing(value as number);
  }, [setLayerSpacing]);

  const handleSpacingChangeCommitted = useCallback(() => {
    if (algorithm !== "mrtree") {
      applyLayout();
    }
  }, [algorithm, applyLayout]);

  return (
    <>
      <Tooltip title="Node Spacing">
        <IconButton 
          onClick={handleClick}
          color="inherit"
          aria-controls={open ? "spacing-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
        >
          <SpaceBarIcon />
        </IconButton>
      </Tooltip>
      
      <Menu
        id="spacing-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "spacing-button",
        }}
      >
        <Box sx={{ px: 2, py: 1, width: 240 }}>
          <Typography id="node-spacing-slider" gutterBottom variant="body2">
            Node Spacing: {nodeSpacing}px
          </Typography>
          <Slider
            aria-labelledby="node-spacing-slider"
            value={nodeSpacing}
            onChange={handleNodeSpacingChange}
            onChangeCommitted={handleSpacingChangeCommitted}
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
                onChange={handleLayerSpacingChange}
                onChangeCommitted={handleSpacingChangeCommitted}
                min={50}
                max={300}
                step={10}
                valueLabelDisplay="auto"
              />
            </>
          )}
        </Box>
      </Menu>
    </>
  );
};

export default SpacingControls;
