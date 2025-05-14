import { useEffect, useMemo } from "react";
import { useMinimapStore } from "./store/useMinimapStore";
import { MiniMap } from "@xyflow/react";
import { registerControl } from "../Controls";
import MinimapToggle from "./Controls/MinimapToggle";
import { CONTROL_PRIORITIES, CONTROL_TYPES } from "../constants";

const Minimap = () => {
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
            node.selected ? 'var(--color-primary)' : 'var(--color-border)'
          }
          nodeColor={(node) =>
            node.selected
              ? 'var(--color-primary-foreground)'
              : 'var(--color-card)'
          }
          maskColor="var(--color-background)CC"
          maskStrokeColor="var(--color-border)"
          style={{
            backgroundColor: 'var(--color-background)',
            border: '1px solid var(--color-border)',
          }}
          zoomable
          pannable
        />
      ) : null,
    [showMiniMap]
  );
  
  return <>{miniMapComponent}</>;
};

export default Minimap;
