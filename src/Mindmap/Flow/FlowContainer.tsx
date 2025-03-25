/** @format */
import { ReactNode, forwardRef, ForwardedRef, WheelEvent } from "react";
import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";

interface FlowContainerProps {
  children: ReactNode;
  onWheel?: (event: WheelEvent<HTMLDivElement>) => void;
}

export const FlowContainer = forwardRef<HTMLDivElement, FlowContainerProps>(
  ({ children, onWheel }, ref: ForwardedRef<HTMLDivElement>) => {
    const theme = useTheme();

    return (
      <Box
        ref={ref}
        onWheel={onWheel}
        sx={{
          bgcolor: theme.palette.background.default,
          // border: `0.5em solid ${theme.palette.divider}`,
          height: "100%",
          width: "100%",
          position: "relative",
          overflow: "hidden",
          "& .react-flow__renderer": {
            willChange: "transform",
          },
          // "& .react-flow__viewport": {
          //   transform: "translate3d(0,0,0)",
          //   backfaceVisibility: "hidden",
          //   perspective: 1000,
          // },
          "& .react-flow__attribution": {
            display: "none",
          },
          "&.react-flow__node-group": {
            backgroundColor: "yellow",
            borderRadius: 10,
            padding: 1,
            boxShadow: `0 1px 2px rgba(0,0,0,0.1)`,
          },
          // "& .react-flow__handle": {
          //   "&:hover": {
          //     // transform: "scale(1.4) translateX(-50%)",
          //     backgroundColor: theme.palette.primary.main,
          //   },
          // },
          "& .react-flow__connection-path": {
            stroke: theme.palette.primary.main,
            strokeWidth: 3,
            // filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.1))",
          },
          "& .react-flow__edge-path": {
            stroke: theme.palette.divider,
            strokeWidth: 2,
            cursor: "pointer",
            filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.1))",
            "&:hover": {
              strokeWidth: 3,
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
            },
            zIndex: 1000,
          },
          // Add specific styling for selected edges
          "& .react-flow__edge.selected .react-flow__edge-path": {
            stroke: theme.palette.primary.main, // using theme yellow color
            strokeWidth: 3,
            filter: `drop-shadow(0 0 5px ${theme.palette.primary.main})`,
          },
          "& .react-flow__node": {
            borderRadius: 10,
            "&.dragging": {
              zIndex: 1000,
              cursor: "grabbing",
              // transform: "translate3d(0,0,0)",
            },

            // padding: 1,
          },
        }}
      >
        {children}
      </Box>
    );
  }
);
