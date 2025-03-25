import { styled } from "@mui/material/styles";
import { Handle, Position } from "@xyflow/react";
import { CSSProperties } from "react";

// A utility function to generate position-specific styles
export const getHandleStyles = (position: Position): CSSProperties => {
  // Base styles common to all triangles
  const baseStyles: CSSProperties = {
    backgroundColor: "transparent",
    borderRadius: 10,
    border: "none",
    width: "2%",
    height: "100%",
    boxSizing: "border-box" as "border-box",
    zIndex: 10, // Ensure handle is above other elements
    transition: "all 0.2s ease",
  };

  // Position-specific triangle styles - smaller size and closer positioning
  switch (position) {
    case Position.Top:
      return {
        ...baseStyles,
        top: "10px", // Closer to node
      };
    case Position.Bottom:
      return {
        ...baseStyles,
        bottom: "10px", // Closer to node
      };
    case Position.Left:
      return {
        ...baseStyles,
        left: "0px", // Closer to node
        borderRight: "none",
        borderRadius: "10px 0 0 10px",
      };
    case Position.Right:
      return {
        ...baseStyles,
        right: "4px", // Closer to node
        borderLeft: "none",
        borderRadius: "0 10px 10px 0",
      };
    default:
      return baseStyles;
  }
};

// Styled component for the handle
export const StyledCellHandle = styled(Handle)(({ theme, position }) => ({
  opacity: 0.5,
  transition: theme.transitions.create(["opacity", "background-color"]),
  "&:hover": {
    opacity: 1,
  },
  backgroundColor: "transparent",
  borderRadius: 10,
  border: "none",
  // width: "2%",
  // height: "100%",
  //If position is left or right, set height to 100%
  height:
    position === Position.Left || position === Position.Right ? "100%" : "2%",
  //If position is up or down, set width to 100%
  width:
    position === Position.Top || position === Position.Bottom ? "100%" : "2%",
  boxSizing: "border-box" as "border-box",
  zIndex: 10, // Ensure handle is above other elements
}));
