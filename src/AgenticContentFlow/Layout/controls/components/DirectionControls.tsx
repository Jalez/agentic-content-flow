import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import { LayoutDirection, useLayoutContext } from "@jalez/react-flow-automated-layout";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const DirectionControls: React.FC = () => {
  const { direction, setDirection } = useLayoutContext();
  
  const handleDirectionSelect = (newDirection: LayoutDirection) => {
    setDirection(newDirection);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <span>
          <Tooltip title="Layout Direction">
            <IconButton color="inherit">
              <SwapVertIcon />
            </IconButton>
          </Tooltip>
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem 
          className="font-semibold text-sm text-muted-foreground pb-2"
        >
          Layout Direction
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleDirectionSelect("DOWN")}
          className={direction === "DOWN" ? "bg-accent" : ""}
        >
          Top to Bottom
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleDirectionSelect("RIGHT")}
          className={direction === "RIGHT" ? "bg-accent" : ""}
        >
          Left to Right
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleDirectionSelect("LEFT")}
          className={direction === "LEFT" ? "bg-accent" : ""}
        >
          Right to Left
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleDirectionSelect("UP")}
          className={direction === "UP" ? "bg-accent" : ""}
        >
          Bottom to Top
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DirectionControls;
