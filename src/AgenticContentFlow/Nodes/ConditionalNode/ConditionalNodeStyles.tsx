import { styled } from "@mui/material/styles";
import { Typography } from "@mui/material";
import { Handle } from "@xyflow/react";

// Define types
type ColorProps = {
  color: string;
};

// Styled handles for the conditional node
export const ConditionalHandle = styled(Handle, {
  shouldForwardProp: (prop) => prop !== "color" && prop !== "isTrue",
})<ColorProps & { isTrue?: boolean }>(({ theme, color }) => ({
  background: color,
  width: 10,
  height: 10,
  borderRadius: "50%",
  transition: theme.transitions.create(["opacity"]),
  zIndex: 5,
}));

// Handle labels for true/false paths
export const HandleLabel = styled(Typography)(({ theme }) => ({
  position: "absolute",
  fontSize: "0.75rem",
  color: theme.palette.text.secondary,
  pointerEvents: "none",
}));