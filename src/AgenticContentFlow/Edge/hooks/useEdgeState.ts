import { useCallback, useMemo } from "react";
import { Edge, EdgeChange, applyEdgeChanges } from "@xyflow/react";
import { useEdgeContext } from "../store/useEdgeContext";
import { withErrorHandler } from "../../utils/withErrorHandler";
import { useTrackableState } from "@jalez/react-state-history";

export const useEdgeState = () => {
  const { edges, setEdges, updateEdges, removeEdges } = useEdgeContext();
  
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

  const onEdgesChange = useCallback(
    withErrorHandler("onEdgesChange", (changes: EdgeChange[]) => {
      if (!Array.isArray(edges)) {
        setEdges([]);
        throw new Error("Edges is not an array:" + edges);
      }
      const newEdges = applyEdgeChanges(changes, edges);
      trackUpdateEdges(newEdges, edges); // Use updateEdges instead of setEdges for consistency
    }),
    [edges, setEdges, trackUpdateEdges]
  );

  const handleUpdateEdges = useCallback(
    withErrorHandler("handleUpdateEdges", (newEdges: Edge[]) => {
      if (!Array.isArray(newEdges)) {
        throw new Error("New edges is not an array:" + newEdges);
      }
      trackUpdateEdges(newEdges, edges); // Use updateEdges for consistency
    }),
    [edges, trackUpdateEdges]
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
    [edges, trackSetEdges]
  );

  const onEdgeRemove = useCallback(
    withErrorHandler("onEdgeRemove", (edges: Edge[]) => {
      if (!Array.isArray(edges)) {
        throw new Error("Edges is not an array:" + edges);
      }
      trackRemoveEdges(edges, edges); // Use removeEdges for consistency
    }),
    [edges, trackRemoveEdges]
  );

  const visibleEdges = useMemo(() => {
    return getVisibleEdges();
  }, [getVisibleEdges]); 

  return {
    edges,
    visibleEdges,
    setEdges: handleSetEdges,
    onEdgesChange,
    getVisibleEdges,
    handleUpdateEdges,
    onEdgeRemove,
  };
};
