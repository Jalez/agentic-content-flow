import { useCallback, useMemo } from "react";
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
  addEdgeToStore: (edge: Edge | Connection) => void
) => {
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
    addEdgeToStore,
    setEdges
  );

  const onEdgesChange = useCallback(
    withErrorHandler("onEdgesChange", (changes: EdgeChange[]) => {
      if (!Array.isArray(edges)) {
        setEdges([]);
        throw new Error("Edges is not an array:" + edges);
      }
      
      // Skip tracking edge removal through onEdgesChange
      // This will be handled by onEdgeRemove instead
      if (changes.length > 0 && changes[0].type === "remove") {
        console.log("onEdgesChange: skipping remove operation");
        return;
      }
      
      // Filter changes to only track significant ones
      // Most edge changes like selection should be applied but not tracked in history
      const significantChanges = changes.filter(change => 
        // Add specific change types that should be tracked in history
        change.type === 'add' ||
        // Add other significant change types here
        false
      );
      
      // Always apply all changes to maintain UI state
      const newEdges = applyEdgeChanges(changes, edges);
      
      if (significantChanges.length > 0) {
        // Only track in history if we have significant changes
        console.log("onEdgesChange: tracking significant changes", significantChanges);
        trackUpdateEdges(newEdges, edges, "Update edges on significant change");
      } else {
        // Otherwise just update the state without history tracking
        console.log("onEdgesChange: applying changes without history tracking");
        setEdges(newEdges);
      }
    }),
    [edges, setEdges, trackUpdateEdges]
  );

  const handleUpdateEdges = useCallback(
    withErrorHandler("handleUpdateEdges", (newEdges: Edge[]) => {
      if (!Array.isArray(newEdges)) {
        throw new Error("New edges is not an array:" + newEdges);
      }
      trackUpdateEdges(newEdges, edges, "Update edges on handleUpdateEdges"); // Use updateEdges for consistency
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
      trackSetEdges(newEdges, edges, "Set edges"); // Use setEdges for consistency
    }),
    [edges, trackSetEdges]
  );

  const onEdgeRemove = useCallback(
    withErrorHandler("onEdgeRemove", (edgesToRemove: Edge[]) => {
      if (!Array.isArray(edgesToRemove)) {
        throw new Error("Edges to remove is not an array:" + edgesToRemove);
      }
      const deepCopyEdges = edges.map((edge) => ({ ...edge }));
      console.log("deepCopyEdges", deepCopyEdges);
      console.log("edgesToRemove", edgesToRemove);
      trackRemoveEdges(edgesToRemove, deepCopyEdges, "Remove edges"); // Use removeEdges for consistency
    }),
    [edges, trackRemoveEdges]
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
    addEdgeToStore: trackAddEdgeToStore
  };
};

