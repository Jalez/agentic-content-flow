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

  const trackAddEdge = useTrackableState(
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

      // Always apply all changes to maintain UI state
      const newEdges = applyEdgeChanges(changes, edges);
      
      setEdges(newEdges);
      // if (significantChanges.length > 0 && lastExecutedAction !== "onEdgeRemove" && lastExecutedAction !== "onEdgeAdd") {
      //   // Only track in history if we have significant changes
      //   trackUpdateEdges(newEdges, edges, "Update edges on significant change");
      //   setLastExecutedAction("onEdgesChange");
      // } else {
      //   // Otherwise just update the state without history tracking
      // }
    }),
    [edges, setEdges, trackUpdateEdges, setLastExecutedAction]
  );

  const handleUpdateEdges = useCallback(
    withErrorHandler("handleUpdateEdges", (newEdges: Edge[], isClick = true) => {
      if (!Array.isArray(newEdges)) {
        throw new Error("New edges is not an array:" + newEdges);
      }
      if (!isClick) {
        updateEdges(newEdges);
        return;
      }
      trackUpdateEdges(newEdges, edges, "Update edges on handleUpdateEdges"); // Use updateEdges for consistency
      setLastExecutedAction("handleUpdateEdges");
    }),
    [edges, trackUpdateEdges, lastExecutedAction, setLastExecutedAction, updateEdges]
  );

  const getVisibleEdges = useCallback(() => {
    return Array.isArray(edges) ? edges : [];
  }, [edges]);

  const handleSetEdges = useCallback(
    withErrorHandler("handleSetEdges", (newEdges: Edge[], isClick = true) => {
      if (!Array.isArray(newEdges)) {
        throw new Error("New edges is not an array:" + newEdges);
      }
      if (!isClick) {
        setEdges(newEdges);
        return;
      }
      trackSetEdges(newEdges, edges, "Set edges"); // Use setEdges for consistency
      setLastExecutedAction("handleSetEdges");
    }),
    [edges, trackSetEdges, setLastExecutedAction, lastExecutedAction, setEdges] 
  );

  const onEdgeRemove = useCallback(
    withErrorHandler("onEdgeRemove", (edgesToRemove: Edge[], isClick = true) => {
      if (!Array.isArray(edgesToRemove)) {
        throw new Error("Edges to remove is not an array:" + edgesToRemove);
      }
      if (!isClick) {
        removeEdges(edgesToRemove);
        return;
      }
      const deepCopyEdges = edges.map((edge) => ({ ...edge }));
      trackRemoveEdges(edgesToRemove, deepCopyEdges, "Remove edges"); // Use removeEdges for consistency
      setLastExecutedAction("onEdgeRemove");
    }),
    [edges, trackRemoveEdges, setLastExecutedAction, lastExecutedAction, removeEdges]
  );

  const onEdgeAdd = useCallback(
    withErrorHandler("onEdgeAdd", (newEdge: Edge | Connection, isClick=true) => {
      if (!newEdge) {
        throw new Error("New edge is not valid:" + newEdge);
      }
      if (!isClick) {
        addEdge(newEdge);
        return;
      }
      const deepCopyEdges = edges.map((edge) => ({ ...edge }));
      trackAddEdge(newEdge, deepCopyEdges, "Add edge"); // Use onEdgeAdd for consistency
      setLastExecutedAction("onEdgeAdd");
    }),
    [edges, trackAddEdge, setLastExecutedAction, lastExecutedAction, addEdge]
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

