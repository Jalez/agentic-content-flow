import { useCallback } from "react";
import { EdgeChange, applyEdgeChanges } from "@xyflow/react";
import { useEdgeStore } from "../../stores";
import { withErrorHandler } from "../../utils/withErrorHandler";

export const useEdgeState = () => {
  const edges = useEdgeStore((state) => state.edges);
  const setEdges = useEdgeStore((state) => state.setEdges);
  const updateEdges = useEdgeStore((state) => state.updateEdges);

  const onEdgesChange = useCallback(
    withErrorHandler("onEdgesChange", (changes: EdgeChange[]) => {
      if (!Array.isArray(edges)) {
        setEdges([]);
        throw new Error("Edges is not an array:" + edges);
      }
      const newEdges = applyEdgeChanges(changes, edges);
      updateEdges(newEdges); // Use updateEdges instead of setEdges for consistency
    }),
    [edges, updateEdges]
  );

  const getVisibleEdges = useCallback(() => {
    return Array.isArray(edges) ? edges : [];
  }, [edges]);

  return {
    edges,
    setEdges,
    onEdgesChange,
    getVisibleEdges,
  };
};
