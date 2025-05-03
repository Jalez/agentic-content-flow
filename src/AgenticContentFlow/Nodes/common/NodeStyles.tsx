import { styled } from "@mui/material/styles";
import { Box, Paper, Typography } from "@mui/material";
import { Handle } from "@xyflow/react";

// Common type for color props
type ColorProps = {
  color: string;
};

type SelectableProps = {
  selected?: boolean;
};

// Base styles for all node containers
export const BaseNodeContainer = styled(Paper, {
  shouldForwardProp: (prop) => !["selected", "color"].includes(prop as string),
})<ColorProps & SelectableProps>(({ theme, color, selected }) => ({
  position: "relative",
  borderRadius: "8px",
  background: "none",
  // backgroundColor: "transparent",
  //box sizing
  boxSizing: "border-box",
  border: "0.5em solid",
  borderColor: selected ? color : theme.palette.divider,
  color: theme.palette.text.primary,
  width: "100%",
  height: "100%",
  minWidth: 300,
  minHeight: 150,
  transition: theme.transitions.create(["box-shadow", "transform"]),
  // boxShadow: selected
  //   ? `0 0 0 0 ${color}, 0 0 10px 2px ${color}`
  //   : theme.shadows[2],
}));

// Common node handle component
export const StyledHandle = styled(Handle, {
  shouldForwardProp: (prop) => prop !== "color",
})<ColorProps>(({ theme, color }) => ({
  background: color,
  width: 10,
  height: 10,
  transition: theme.transitions.create(["opacity", "background-color"]),
}));

// Common resize control component
export const StyledResizeControl = styled(Box, {
  shouldForwardProp: (prop) => !["selected", "color"].includes(prop as string),
})<ColorProps & SelectableProps>(({ theme, color }) => ({
  position: "absolute",

  cursor: "nwse-resize",
  color: theme.palette.common.white,
  transition: theme.transitions.create(["transform", "background-color"]),
  "&:hover": {
    transform: "scale(1.1)",
    bgcolor: color,
  },
  boxShadow: theme.shadows[2],
}));

// Common styled typography for titles
export const StyledTitle = styled(Typography, {
  shouldForwardProp: (prop) => prop !== "color",
})<ColorProps>(({ color }) => ({
  color,
  fontWeight: "bold",
}));
