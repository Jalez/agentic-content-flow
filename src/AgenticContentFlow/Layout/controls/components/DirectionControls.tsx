import React, { useState, useCallback } from "react";
import { 
  IconButton,
  Menu,
  MenuItem, 
  Typography,
  Tooltip
} from "@mui/material";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import { LayoutDirection, useLayoutContext } from "@jalez/react-flow-automated-layout";

const DirectionControls: React.FC = () => {
  const { direction, setDirection } = useLayoutContext();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleDirectionSelect = useCallback((newDirection: LayoutDirection) => {
    setDirection(newDirection);
    handleClose();
  }, [setDirection]);

  return (
    <>
      <Tooltip title="Layout Direction">
        <IconButton
          aria-controls={open ? "direction-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          onClick={handleClick}
          color="inherit"
        >
          <SwapVertIcon />
        </IconButton>
      </Tooltip>
      
      <Menu
        id="direction-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "direction-button",
        }}
      >
        <Typography variant="subtitle2" sx={{ px: 2, py: 1 }}>
          Layout Direction
        </Typography>

        <MenuItem
          onClick={() => handleDirectionSelect("DOWN")}
          selected={direction === "DOWN"}
        >
          Top to Bottom
        </MenuItem>

        <MenuItem
          onClick={() => handleDirectionSelect("RIGHT")}
          selected={direction === "RIGHT"}
        >
          Left to Right
        </MenuItem>

        <MenuItem
          onClick={() => handleDirectionSelect("LEFT")}
          selected={direction === "LEFT"}
        >
          Right to Left
        </MenuItem>

        <MenuItem
          onClick={() => handleDirectionSelect("UP")}
          selected={direction === "UP"}
        >
          Bottom to Top
        </MenuItem>
      </Menu>
    </>
  );
};

export default DirectionControls;
