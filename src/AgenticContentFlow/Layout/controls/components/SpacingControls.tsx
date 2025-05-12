import React, { useState, useCallback, useEffect } from "react";
import { 
  Box, 
  Typography,
  Slider,
  Button
} from "@mui/material";
import SpaceBarIcon from '@mui/icons-material/SpaceBar';
import { useLayoutContext } from "@jalez/react-flow-automated-layout";
import ControlButton from "../../../Controls/Components/ControlButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

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
  const [localNodeSpacing, setLocalNodeSpacing] = useState(nodeSpacing);
  const [localLayerSpacing, setLocalLayerSpacing] = useState(layerSpacing);

  // Update local state when context values change or dropdown opens
  useEffect(() => {
    if (open) {
      setLocalNodeSpacing(nodeSpacing);
      setLocalLayerSpacing(layerSpacing);
    }
  }, [open, nodeSpacing, layerSpacing]);

  const handleOpenChange = useCallback((isOpen: boolean) => {
    setOpen(isOpen);
    
    // Apply changes when closing the dropdown
    if (!isOpen && (localNodeSpacing !== nodeSpacing || localLayerSpacing !== layerSpacing)) {
      setNodeSpacing(localNodeSpacing);
      setLayerSpacing(localLayerSpacing);
      
      if (algorithm !== "mrtree") {
        applyLayout();
      }
    }
  }, [localNodeSpacing, localLayerSpacing, nodeSpacing, layerSpacing, setNodeSpacing, setLayerSpacing, algorithm, applyLayout]);

  const handleNodeSpacingChange = useCallback((event: Event, value: number | number[]) => {
    event.stopPropagation(); // Prevent closing the dropdown
    setLocalNodeSpacing(value as number);
  }, []);

  const handleLayerSpacingChange = useCallback((event: Event, value: number | number[]) => {
    event.stopPropagation(); // Prevent closing the dropdown
    setLocalLayerSpacing(value as number);
  }, []);
  
  const handleApply = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent closing the dropdown
    setNodeSpacing(localNodeSpacing);
    setLayerSpacing(localLayerSpacing);
    
    if (algorithm !== "mrtree") {
      applyLayout();
    }
  }, [localNodeSpacing, localLayerSpacing, setNodeSpacing, setLayerSpacing, algorithm, applyLayout]);

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <span>
          <ControlButton
            tooltip="Node Spacing"
            onClick={(e) => e.preventDefault()}
            icon={<SpaceBarIcon />}
          />
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-0 w-[280px]">
        <Box sx={{ p: 2, width: '100%' }} onClick={(e) => e.stopPropagation()}>
          <Typography id="node-spacing-slider" gutterBottom variant="body2" sx={{ fontWeight: 600 }}>
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
                sx={{ fontWeight: 600 }}
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
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button 
              onClick={handleApply}
              color="primary"
              size="small"
              variant="contained"
            >
              Apply
            </Button>
          </Box>
        </Box>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default React.memo(SpacingControls);
