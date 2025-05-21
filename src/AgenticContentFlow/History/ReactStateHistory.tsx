/**
 * React Flow Integration Example
 *
 * This example demonstrates how to use the StateHistory library
 * with React Flow to add undo/redo capabilities to node operations.
 *
 * Key concepts demonstrated:
 * - Using StateHistory with a third-party library (React Flow)
 * - Creating custom commands for complex operations
 * - Managing external state with useTrackableState
 */
// import { ControlButton } from "@xyflow/react";
import {
  StateHistoryProvider,
  useHistoryStateContext,
} from "@jalez/react-state-history";

import "@xyflow/react/dist/style.css";
import { Redo2, Save, Undo2 } from "lucide-react";
import { useEffect } from "react";
import { CONTROL_TYPES } from "../constants";
import { registerControl, unregisterControl } from "../Controls";
import ControlButton from "../Controls/Components/ControlButton";

// Internal flow component that handles the actual React Flow functionality
function ReactStateHistoryControls() {
  // Get the latest persisted states if available, otherwise use initialNodes/initialEdges

  const {
    canUndo,
    canRedo,
    undo,
    redo,
    
    isPersistent,
    togglePersistence,
  } = useHistoryStateContext();

  return (
    <>
      <ControlButton
        onClick={() => {
          if (canUndo) {
            undo();
          }
        }}
        disabled={!canUndo}
        icon={<Undo2 className="size-4" />}
        tooltip="Undo"
      />
      <ControlButton
        onClick={togglePersistence}
        tooltip="Toggle Persistence"
        disabled={false}
        icon={<Save className="size-4" />}
        active={isPersistent}
      />
      <ControlButton
        onClick={() => {
          if (canRedo) {
            redo();
          }
        }}
        disabled={!canRedo}
        icon={<Redo2 className="size-4" />}
        tooltip="Redo"
      />
    </>
  );
}

// Wrapper component that provides StateHistory context
export default function ReactStateHistory({
  children,
}: {
  children?: React.ReactNode;
}) {
  //Register <ReactStateHistoryControls /> to the controls panel
  useEffect(() => {
    registerControl(
      "history", // Use the tools section
      CONTROL_TYPES.MINDMAP,
      "REACT_STATE_HISTORY_CONTROLS",
      ReactStateHistoryControls,
      {}, // No props needed
      10 // Priority (lower numbers appear first)
    );

    // Cleanup when unmounted
    return () => {
      unregisterControl(
        "history",
        CONTROL_TYPES.MINDMAP,
        "REACT_STATE_HISTORY_CONTROLS"
      );
    };
  }, []); // Empty dependency array ensures this runs only once

  return (
    <StateHistoryProvider
      storageKey="react-flow-example"
      defaultPersistent={true}
    >
      {children}
    </StateHistoryProvider>
  );
}
