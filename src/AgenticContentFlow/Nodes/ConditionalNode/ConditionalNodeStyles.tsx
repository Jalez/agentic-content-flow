import { styled } from "@mui/material/styles";
import { Box, Paper, Typography } from "@mui/material";
import { Handle } from "@xyflow/react";

// Define types
type ColorProps = {
  color: string;
};

type SelectableProps = {
  selected?: boolean;
};

// Diamond-shaped container for conditional nodes
export const DiamondContainer = styled(Paper, {
  shouldForwardProp: (prop) => !["selected", "color"].includes(prop as string),
})<ColorProps & SelectableProps>(({ theme, color, selected }) => ({
  position: "relative",
  width: "150px",
  height: "150px",
  backgroundColor: theme.palette.background.paper,
  transform: "rotate(45deg)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  userSelect: "none",
  border: "2px solid",
  borderColor: selected ? color : theme.palette.divider,
  boxShadow: selected
    ? `0 0 0 2px ${color}, 0 0 10px 2px ${color}`
    : theme.shadows[2],
  transition: theme.transitions.create(["box-shadow", "transform", "border-color"]),
}));

// Content wrapper that rotates text back to normal
export const DiamondContent = styled(Box)({
  transform: "rotate(-45deg)",
  width: "130px",
  height: "130px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
});

// Styled handles for the conditional node
export const ConditionalHandle = styled(Handle, {
  shouldForwardProp: (prop) => prop !== "color" && prop !== "isTrue",
})<ColorProps & { isTrue?: boolean }>(({ theme, color, isTrue }) => ({
  background: isTrue !== undefined ? (isTrue ? "#4caf50" : "#f44336") : color, // Green for true, red for false
  width: 10,
  height: 10,
  borderRadius: "50%",
  transition: theme.transitions.create(["opacity"]),
  border: `2px solid ${theme.palette.background.paper}`,
  zIndex: 5,
}));

// Decision text label
export const DecisionLabel = styled(Typography)(({ theme }) => ({
  fontWeight: "bold",
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(1),
}));

// Handle labels for true/false paths
export const HandleLabel = styled(Typography)(({ theme }) => ({
  position: "absolute",
  fontSize: "0.75rem",
  color: theme.palette.text.secondary,
  pointerEvents: "none",
}));