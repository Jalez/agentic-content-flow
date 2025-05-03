import React, { useState, useCallback, useEffect } from "react";
import { 
  IconButton, 
  Tooltip, 
  Box, 
  Typography,
  Slider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
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

  const [open, setOpen] = useState(false);
  
  // Keep local state that only updates the context when applied
  const [localNodeSpacing, setLocalNodeSpacing] = useState(nodeSpacing);
  const [localLayerSpacing, setLocalLayerSpacing] = useState(layerSpacing);

  // Update local state when context values change or dialog opens
  useEffect(() => {
    if (open) {
      setLocalNodeSpacing(nodeSpacing);
      setLocalLayerSpacing(layerSpacing);
    }
  }, [open, nodeSpacing, layerSpacing]);

  const handleOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleApply = useCallback(() => {
    // Apply changes to the layout context
    setNodeSpacing(localNodeSpacing);
    setLayerSpacing(localLayerSpacing);
    
    if (algorithm !== "mrtree") {
      applyLayout();
    }
    
    // Keep the dialog open
  }, [localNodeSpacing, localLayerSpacing, algorithm, setNodeSpacing, setLayerSpacing, applyLayout]);

  const handleDone = useCallback(() => {
    // Apply changes
    handleApply();
    // Close dialog
    handleClose();
  }, [handleApply, handleClose]);

  const handleNodeSpacingChange = useCallback((event: Event, value: number | number[]) => {
    setLocalNodeSpacing(value as number);
  }, []);

  const handleLayerSpacingChange = useCallback((event: Event, value: number | number[]) => {
    setLocalLayerSpacing(value as number);
  }, []);

  return (
    <>
      <Tooltip 
        title="Node Spacing" 
        arrow
        placement="bottom"
      >
        <span>
          <IconButton 
            onClick={handleOpen}
            color="inherit"
          >
            <SpaceBarIcon />
          </IconButton>
        </span>
      </Tooltip>
      
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth={false}
        PaperProps={{
          style: { width: '300px' }
        }}
      >
        <DialogTitle>Adjust Spacing</DialogTitle>
        <DialogContent>
          <Box sx={{ my: 2 }}>
            <Typography id="node-spacing-slider" gutterBottom variant="body2">
              Node Spacing: {localNodeSpacing}px
            </Typography>
            <Slider
              aria-labelledby="node-spacing-slider"
              value={localNodeSpacing}
              onChange={handleNodeSpacingChange}
              min={50}
              max={300}
              step={10}
              valueLabelDisplay="auto"
              sx={{ mb: 3 }}
            />

            {algorithm !== "mrtree" && (
              <>
                <Typography
                  id="layer-spacing-slider"
                  gutterBottom
                  variant="body2"
                >
                  Layer Spacing: {localLayerSpacing}px
                </Typography>
                <Slider
                  aria-labelledby="layer-spacing-slider"
                  value={localLayerSpacing}
                  onChange={handleLayerSpacingChange}
                  min={50}
                  max={300}
                  step={10}
                  valueLabelDisplay="auto"
                />
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleApply} color="primary">
            Apply
          </Button>
          <Button onClick={handleDone} color="primary">
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default React.memo(SpacingControls);
