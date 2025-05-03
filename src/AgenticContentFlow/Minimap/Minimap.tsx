import { useTheme } from "@mui/material";
import { useEffect, useMemo } from "react";
import { useMinimapStore } from "./store/useMinimapStore";
import { MiniMap } from "@xyflow/react";
import { registerControl } from "../Controls";
import MinimapToggle from "./button/MinimapToggle";
import { CONTROL_PRIORITIES, CONTROL_TYPES } from "../constants";

const Minimap = () => {
  const theme = useTheme();
  const { showMiniMap } = useMinimapStore();

  useEffect(() => {
    registerControl(
      CONTROL_TYPES.NAVIGATION,
      CONTROL_TYPES.MINDMAP,
      "MINIMAP_TOGGLE",
      MinimapToggle,
      {},
      CONTROL_PRIORITIES.NAVIGATION
    );
  }, []);
  const miniMapComponent = useMemo(
    () =>
      showMiniMap ? (
        <MiniMap
          nodeStrokeWidth={4}
          nodeStrokeColor={(node) =>
            node.selected ? theme.palette.primary.main : theme.palette.divider
          }
          nodeColor={(node) =>
            node.selected
              ? theme.palette.primary.light
              : theme.palette.background.paper
          }
          maskColor={`${theme.palette.background.default}CC`}
          maskStrokeColor={theme.palette.divider}
          style={{
            backgroundColor: theme.palette.background.default,
            border: `1px solid ${theme.palette.divider}`,
          }}
          zoomable
          pannable
        />
      ) : null,
    [showMiniMap, theme.palette]
  );
  return <>{miniMapComponent}</>;
};

export default Minimap;
