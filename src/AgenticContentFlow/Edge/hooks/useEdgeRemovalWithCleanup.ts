import { useCallback } from "react";
import { Edge } from "@xyflow/react";
import { useInvisibleNodeOperations } from "../../Node/hooks/useInvisibleNodeOperations";

export const useEdgeRemovalWithCleanup = () => {
  const { 
    handleConnectionRemovalCleanup,
    executeInvisibleNodeOperation 
  } = useInvisibleNodeOperations();

  /**
   * Handle edge removal with invisible node cleanup
   */
  const handleEdgeRemovalWithCleanup = useCallback((
    removedEdges: Edge[],
    originalRemovalFn: (edges: Edge[]) => void
  ) => {
    // First, perform the original edge removal
    originalRemovalFn(removedEdges);

    // Then, check each removed edge for invisible node cleanup
    removedEdges.forEach(removedEdge => {
      executeInvisibleNodeOperation(() => {
        const result = handleConnectionRemovalCleanup(removedEdge);
        return {
          updatedNodes: [],
          newInvisibleNode: null,
          shouldRemoveNodes: result.shouldRemoveNodes
        };
      }, `Cleanup invisible nodes after edge removal: ${removedEdge.id}`);
    });
  }, [handleConnectionRemovalCleanup, executeInvisibleNodeOperation]);

  return {
    handleEdgeRemovalWithCleanup
  };
};