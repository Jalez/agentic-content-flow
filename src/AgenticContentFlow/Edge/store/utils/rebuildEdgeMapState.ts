import { Edge } from "@xyflow/react";
import { EdgeStoreState } from "../useEdgeContext";

/**
 * Rebuilds the edge map state from an array of edges
 * Creates both the edgeMap and edgeSourceMap
 */
export const rebuildEdgeMapState = (edges: Edge[]): Omit<EdgeStoreState, 'edges'> => {
  const edgeMap = new Map<string, Edge>();
  const edgeSourceMap = new Map<string, Edge[]>();

  edges.forEach((edge) => {
    // Add to edgeMap
    edgeMap.set(edge.id, edge);

    // Add to edgeSourceMap
    if (edge.source) {
      if (!edgeSourceMap.has(edge.source)) {
        edgeSourceMap.set(edge.source, []);
      }
      edgeSourceMap.get(edge.source)!.push(edge);
    }
  });

  return { edgeMap, edgeSourceMap };
};