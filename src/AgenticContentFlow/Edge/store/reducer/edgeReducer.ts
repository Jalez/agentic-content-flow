import { Edge, addEdge, Connection } from "@xyflow/react";
import { EdgeStoreState } from "../useEdgeContext";
import { rebuildEdgeMapState } from "../utils/rebuildEdgeMapState";

// Define Action Types
export type EdgeAction =
  | { type: "SET_EDGES"; payload: Edge[] }
  | { type: "ADD_EDGE"; payload: Edge | Connection }
  | { type: "REMOVE_EDGE"; payload: string }
  | { type: "REMOVE_EDGES"; payload: Edge[] }
  | { type: "UPDATE_EDGE"; payload: Edge }
  | { type: "UPDATE_EDGES"; payload: Edge[] }
  | { type: "REHYDRATE"; payload: EdgeStoreState };

// Reducer function
export const edgeReducer = (state: EdgeStoreState, action: EdgeAction): EdgeStoreState => {
  switch (action.type) {
    case "SET_EDGES": {
      const edges = action.payload;
      if (!Array.isArray(edges)) {
        console.error("Invalid edges value:", edges);
        return state;
      }

      // Rebuild maps from the new edges
      const { edgeMap, edgeSourceMap } = rebuildEdgeMapState(edges);

      return {
        ...state,
        edges,
        edgeMap,
        edgeSourceMap,
      };
    }

    case "ADD_EDGE": {
      const oldLength = state.edges.length;
      const updatedEdges = addEdge(action.payload, state.edges);

      if (updatedEdges.length === oldLength) {
        console.warn(`Edge already exists.`);
        return state; // No changes made
      }

      // Get the new edge from the updatedEdges
      const newEdge = updatedEdges[updatedEdges.length - 1];

      if (state.edgeMap.has(newEdge.id)) {
        console.warn(`Edge with id ${newEdge.id} already exists.`);
        return state; // No changes made
      }

      // Update edgeMap
      const updatedMap = new Map(state.edgeMap);
      updatedMap.set(newEdge.id, newEdge);

      // Update edgeSourceMap
      const updatedSourceMap = new Map(state.edgeSourceMap);
      if (!updatedSourceMap.has(newEdge.source)) {
        updatedSourceMap.set(newEdge.source, []);
      }
      updatedSourceMap.get(newEdge.source)!.push(newEdge);

      return {
        ...state,
        edges: updatedEdges,
        edgeMap: updatedMap,
        edgeSourceMap: updatedSourceMap,
      };
    }

    case "UPDATE_EDGE": {
      const edge = action.payload;
      // Get the existing edge
      const existingEdge = state.edgeMap.get(edge.id);

      if (!existingEdge) {
        console.warn(`Edge with id ${edge.id} not found.`);
        return state;
      }

      const updatedEdges = state.edges.map((e) =>
        e.id === edge.id ? edge : e
      );

      // Update edgeMap
      const updatedMap = new Map(state.edgeMap);
      updatedMap.set(edge.id, edge);

      // Update edgeSourceMap (handle source change)
      const updatedSourceMap = new Map(state.edgeSourceMap);

      // If the source changed, we need to remove from old and add to new
      if (existingEdge.source !== edge.source) {
        // Remove from old source
        const oldSourceEdges = updatedSourceMap.get(existingEdge.source) || [];
        updatedSourceMap.set(
          existingEdge.source,
          oldSourceEdges.filter((e) => e.id !== edge.id)
        );

        // Add to new source
        if (!updatedSourceMap.has(edge.source)) {
          updatedSourceMap.set(edge.source, []);
        }
        updatedSourceMap.get(edge.source)!.push(edge);
      } else {
        // If source didn't change but we're updating an edge
        const sourceEdges = updatedSourceMap.get(edge.source) || [];
        updatedSourceMap.set(
          edge.source,
          sourceEdges.map((e) => (e.id === edge.id ? edge : e))
        );
      }

      return {
        ...state,
        edges: updatedEdges,
        edgeMap: updatedMap,
        edgeSourceMap: updatedSourceMap,
      };
    }

    case "UPDATE_EDGES": {
      const edgesToUpdate = action.payload;
      
      // Create lookup for fast access
      const edgeById = new Map(edgesToUpdate.map((e) => [e.id, e]));

      const updatedEdges = state.edges.map((edge) => {
        const updatedEdge = edgeById.get(edge.id);
        return updatedEdge ? { ...edge, ...updatedEdge } : edge;
      });

      // Update edgeMap
      const updatedMap = new Map(state.edgeMap);
      edgesToUpdate.forEach((edge) => updatedMap.set(edge.id, edge));

      // Rebuild sourceMap with updated edges - this ensures all references are updated
      const { edgeSourceMap } = rebuildEdgeMapState(updatedEdges);

      return {
        ...state,
        edges: updatedEdges,
        edgeMap: updatedMap,
        edgeSourceMap,
      };
    }

    case "REMOVE_EDGE": {
      const edgeId = action.payload;
      const edgeToRemove = state.edgeMap.get(edgeId);
      
      if (!edgeToRemove) {
        console.warn(`Edge with id ${edgeId} not found.`);
        return state;
      }
      
      const updatedEdges = state.edges.filter((edge) => edge.id !== edgeId);

      // Update edgeMap
      const updatedMap = new Map(state.edgeMap);
      updatedMap.delete(edgeId);

      // Update edgeSourceMap
      const updatedSourceMap = new Map(state.edgeSourceMap);
      if (edgeToRemove.source) {
        const sourceEdges = updatedSourceMap.get(edgeToRemove.source) || [];
        updatedSourceMap.set(
          edgeToRemove.source,
          sourceEdges.filter((e) => e.id !== edgeId)
        );
      }

      return {
        ...state,
        edges: updatedEdges,
        edgeMap: updatedMap,
        edgeSourceMap: updatedSourceMap,
      };
    }

    case "REMOVE_EDGES": {
      const edgesToRemove = action.payload;
      const edgeIdsToRemove = new Set(edgesToRemove.map((edge) => edge.id));
      
      const updatedEdges = state.edges.filter(
        (edge) => !edgeIdsToRemove.has(edge.id)
      );

      // Update edgeMap
      const updatedMap = new Map(state.edgeMap);
      edgesToRemove.forEach((edge) => updatedMap.delete(edge.id));

      // Update edgeSourceMap
      const updatedSourceMap = new Map(state.edgeSourceMap);
      edgesToRemove.forEach((edge) => {
        if (edge.source) {
          const sourceEdges = updatedSourceMap.get(edge.source) || [];
          updatedSourceMap.set(
            edge.source,
            sourceEdges.filter((e) => e.id !== edge.id)
          );
        }
      });

      return {
        ...state,
        edges: updatedEdges,
        edgeMap: updatedMap,
        edgeSourceMap: updatedSourceMap,
      };
    }

    case "REHYDRATE": {
      // This action is dispatched internally during initialization
      // The payload is the state loaded from storage
      // We need to rebuild the maps as they are not stored directly
      const { edges } = action.payload;
      const { edgeMap, edgeSourceMap } = rebuildEdgeMapState(edges);

      return {
        edges,
        edgeMap,
        edgeSourceMap,
      };
    }

    default:
      return state;
  }
};