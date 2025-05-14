import React, { useState, useCallback, useEffect } from "react";
import { useLayoutContext } from "@jalez/react-flow-automated-layout";
import ControlButton from "../../../Controls/Components/ControlButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

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

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <div>
          <ControlButton
            tooltip="Adjust Spacing"
            icon={<ArrowUpDown className="size-4" />}
            active={open}
            onClick={() => setOpen(!open)}
          />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-4">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <p className="text-sm font-medium">Node Spacing</p>
              <span className="text-sm text-muted-foreground">{localNodeSpacing}px</span>
            </div>
            <Slider
              value={[localNodeSpacing]}
              onValueChange={(value: number[]) => setLocalNodeSpacing(value[0])}
              max={100}
              min={20}
              step={10}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <p className="text-sm font-medium">Layer Spacing</p>
              <span className="text-sm text-muted-foreground">{localLayerSpacing}px</span>
            </div>
            <Slider
              value={[localLayerSpacing]}
              onValueChange={(value: number[]) => setLocalLayerSpacing(value[0])}
              max={100}
              min={20}
              step={10}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setOpen(false);
                setLocalNodeSpacing(nodeSpacing);
                setLocalLayerSpacing(layerSpacing);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setNodeSpacing(localNodeSpacing);
                setLayerSpacing(localLayerSpacing);
                setOpen(false);
                if (algorithm !== "mrtree") {
                  applyLayout();
                }
              }}
            >
              Apply
            </Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SpacingControls;
