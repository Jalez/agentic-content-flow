import { useCallback, useMemo, useState } from "react";
import { Edge, EdgeChange, applyEdgeChanges, Connection } from "@xyflow/react";
import { withErrorHandler } from "../../utils/withErrorHandler";

// Import useTrackableState directly only in this file
// In the future, this will be used only internally by EdgeProvider
import { useTrackableState } from "@jalez/react-state-history";

// Define a private implementation that accepts parameters
// This will be used by the EdgeProvider in the future, not exposed to components directly
export const useEdgeStateImpl = (
  edges: Edge[],
  setEdges: (edges: Edge[]) => void,
  updateEdges: (edges: Edge[]) => void,
  removeEdges: (edges: Edge[]) => void,
  addEdge: (edge: Edge | Connection) => void
) => {

  const [lastExecutedAction, setLastExecutedAction] = useState<string | null>(null);

  const trackUpdateEdges = useTrackableState(
    "useEdgeState/UpdateEdges",
    updateEdges,
    setEdges
  );

  const trackRemoveEdges = useTrackableState(
    "useEdgeState/RemoveEdges",
    removeEdges,
    setEdges
  );

  const trackSetEdges = useTrackableState("useEdgeState/SetEdges", setEdges);

  const trackAddEdgeToStore = useTrackableState(
    "useEdgeState/AddEdge",
    addEdge,
    setEdges
  );

  const onEdgesChange = useCallback(
    withErrorHandler("onEdgesChange", (changes: EdgeChange[]) => {
      if (!Array.isArray(edges)) {
        setEdges([]);
        throw new Error("Edges is not an array:" + edges);
      }

      if (changes.length > 0 && changes[0].type === "remove") {
        return;
      }

      // Filter changes to only track significant ones
      // Most edge changes like selection should be applied but not tracked in history
      const significantChanges = changes.filter(_ =>
        // Add specific change types that should be tracked in history
        // Add other significant change types here
        false
      );

      // Always apply all changes to maintain UI state
      const newEdges = applyEdgeChanges(changes, edges);

      if (significantChanges.length > 0 && lastExecutedAction !== "onEdgeRemove" && lastExecutedAction !== "onEdgeAdd") {
        // Only track in history if we have significant changes
        trackUpdateEdges(newEdges, edges, "Update edges on significant change");
        setLastExecutedAction("onEdgesChange");
      } else {
        // Otherwise just update the state without history tracking
        setEdges(newEdges);
      }
    }),
    [edges, setEdges, trackUpdateEdges, setLastExecutedAction]
  );

  const handleUpdateEdges = useCallback(
    withErrorHandler("handleUpdateEdges", (newEdges: Edge[]) => {
      if (!Array.isArray(newEdges)) {
        throw new Error("New edges is not an array:" + newEdges);
      }
      if (lastExecutedAction === "onEdgeRemove" || lastExecutedAction === "onEdgeAdd") {
        updateEdges(newEdges);
      }
      else {
        trackUpdateEdges(newEdges, edges, "Update edges on handleUpdateEdges"); // Use updateEdges for consistency
        setLastExecutedAction("handleUpdateEdges");
      }
    }),
    [edges, trackUpdateEdges, lastExecutedAction, setLastExecutedAction, updateEdges]
  );

  const getVisibleEdges = useCallback(() => {
    return Array.isArray(edges) ? edges : [];
  }, [edges]);

  const handleSetEdges = useCallback(
    withErrorHandler("handleSetEdges", (newEdges: Edge[]) => {
      if (!Array.isArray(newEdges)) {
        throw new Error("New edges is not an array:" + newEdges);
      }
      trackSetEdges(newEdges, edges, "Set edges"); // Use setEdges for consistency
      setLastExecutedAction("handleSetEdges");
    }),
    [edges, trackSetEdges]
  );

  const onEdgeRemove = useCallback(
    withErrorHandler("onEdgeRemove", (edgesToRemove: Edge[]) => {
      if (!Array.isArray(edgesToRemove)) {
        throw new Error("Edges to remove is not an array:" + edgesToRemove);
      }
      const deepCopyEdges = edges.map((edge) => ({ ...edge }));
      trackRemoveEdges(edgesToRemove, deepCopyEdges, "Remove edges"); // Use removeEdges for consistency
      setLastExecutedAction("onEdgeRemove");
    }),
    [edges, trackRemoveEdges, setLastExecutedAction, lastExecutedAction]
  );

  const onEdgeAdd = useCallback(
    withErrorHandler("onEdgeAdd", (newEdge: Edge | Connection) => {
      if (!newEdge) {
        throw new Error("New edge is not valid:" + newEdge);
      }
      const deepCopyEdges = edges.map((edge) => ({ ...edge }));
      trackAddEdgeToStore(newEdge, deepCopyEdges, "Add edge"); // Use onEdgeAdd for consistency
      setLastExecutedAction("onEdgeAdd");
    }),
    [edges, trackAddEdgeToStore, setLastExecutedAction, lastExecutedAction]
  );

  const visibleEdges = useMemo(() => {
    return getVisibleEdges();
  }, [getVisibleEdges]);

  return {
    visibleEdges,
    setEdges: handleSetEdges,
    onEdgesChange,
    getVisibleEdges,
    handleUpdateEdges,
    onEdgeRemove,
    onEdgeAdd,
  };
};

