import { useCallback } from "react";
import { Edge, EdgeChange, applyEdgeChanges } from "@xyflow/react";
import { useEdgeStore } from "../../stores";
import { withErrorHandler } from "../../utils/withErrorHandler";
import { useTrackableState } from "@jalez/react-state-history";

export const useEdgeState = () => {
  const edges = useEdgeStore((state) => state.edges);
  const setEdges = useEdgeStore((state) => state.setEdges);
  const updateEdges = useEdgeStore((state) => state.updateEdges);
  const trackUpdateEdges = useTrackableState(
    "useEdgeState/UpdateEdges",
    updateEdges,
    setEdges
  );

  const trackSetEdges = useTrackableState("useEdgeState/SetEdges", setEdges);

  const onEdgesChange = useCallback(
    withErrorHandler("onEdgesChange", (changes: EdgeChange[]) => {
      if (!Array.isArray(edges)) {
        setEdges([]);
        throw new Error("Edges is not an array:" + edges);
      }
      const newEdges = applyEdgeChanges(changes, edges);
      trackUpdateEdges(newEdges, edges); // Use updateEdges instead of setEdges for consistency
    }),
    [edges, updateEdges]
  );

  const handleUpdateEdges = useCallback(
    withErrorHandler("handleUpdateEdges", (newEdges: Edge[]) => {
      if (!Array.isArray(newEdges)) {
        throw new Error("New edges is not an array:" + newEdges);
      }
      trackUpdateEdges(newEdges, edges); // Use updateEdges for consistency
    }),
    [updateEdges]
  );

  const getVisibleEdges = useCallback(() => {
    return Array.isArray(edges) ? edges : [];
  }, [edges]);

  const handleSetEdges = useCallback(
    withErrorHandler("handleSetEdges", (newEdges: Edge[]) => {
      if (!Array.isArray(newEdges)) {
        throw new Error("New edges is not an array:" + newEdges);
      }
      trackSetEdges(newEdges, edges); // Use setEdges for consistency
    }),
    [setEdges]
  );

  return {
    edges,
    setEdges: handleSetEdges,
    onEdgesChange,
    getVisibleEdges,
    handleUpdateEdges,
  };
};
