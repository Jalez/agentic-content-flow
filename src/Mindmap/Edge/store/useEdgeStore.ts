/** @format */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { addEdge, Connection, Edge } from "@xyflow/react";
import { edgesData } from "../../test/edgeData";

export interface EdgeStoreState {
  // Keep both data structures
  edges: Edge[];
  edgeMap: Map<string, Edge>; // For O(1) lookups
  edgeSourceMap: Map<string, Edge[]>; // Map from source node ID to edges

  // Operations
  setEdges: (edges: Edge[]) => void;
  addEdgeToStore: (edge: Edge | Connection) => void;
  updateEdge: (edge: Edge) => void;
  updateEdges: (edges: Edge[]) => void;
  removeEdge: (edgeId: string) => void;
  getEdge: (id: string) => Edge | undefined;
}

// Helper to build the edgeSourceMap
const buildEdgeSourceMap = (edges: Edge[]) => {
  const sourceMap = new Map<string, Edge[]>();

  edges.forEach((edge) => {
    if (edge.source) {
      if (!sourceMap.has(edge.source)) {
        sourceMap.set(edge.source, []);
      }
      sourceMap.get(edge.source)!.push(edge);
    }
  });

  return sourceMap;
};

// Initialize both structures
const createInitialEdgeMap = () => {
  const map = new Map<string, Edge>();
  edgesData.forEach((edge) => map.set(edge.id, edge));
  return map;
};

const initialEdgeSourceMap = buildEdgeSourceMap(edgesData);

export const useEdgeStore = create<EdgeStoreState>()(
  persist(
    (set, get) => ({
      edges: edgesData,
      edgeMap: createInitialEdgeMap(),
      edgeSourceMap: initialEdgeSourceMap,

      // Efficient edge lookup
      getEdge: (id: string) => get().edgeMap.get(id),

      setEdges: (edges) => {
        // Validate input is an array
        if (!Array.isArray(edges)) {
          console.error("Invalid edges value:", edges);
          return;
        }

        // Update all data structures simultaneously
        const edgeMap = new Map<string, Edge>();
        edges.forEach((edge) => edgeMap.set(edge.id, edge));
        const edgeSourceMap = buildEdgeSourceMap(edges);

        set({ edges, edgeMap, edgeSourceMap });
      },

      addEdgeToStore: (edge) => {
        set((state) => {
          const oldLength = state.edges.length;
          const updatedEdges = addEdge(edge, state.edges);
          if (updatedEdges.length === oldLength) {
            console.warn(`Edge already exists.`);
            return state; // No changes made
          }
          //Otherwise, we get the new edge from the updatedEdges (is it the last one?)
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
            edges: updatedEdges,
            edgeMap: updatedMap,
            edgeSourceMap: updatedSourceMap,
          };
        });
      },

      updateEdge: (edge) => {
        set((state) => {
          // Get the existing edge
          const existingEdge = state.edgeMap.get(edge.id);
          const updatedEdges = state.edges.map((e) =>
            e.id === edge.id ? edge : e
          );

          // Update edgeMap
          const updatedMap = new Map(state.edgeMap);
          updatedMap.set(edge.id, edge);

          // Update edgeSourceMap (handle source change)
          const updatedSourceMap = new Map(state.edgeSourceMap);

          // If the source changed, we need to remove from old and add to new
          if (existingEdge && existingEdge.source !== edge.source) {
            // Remove from old source
            const oldSourceEdges =
              updatedSourceMap.get(existingEdge.source) || [];
            updatedSourceMap.set(
              existingEdge.source,
              oldSourceEdges.filter((e) => e.id !== edge.id)
            );

            // Add to new source
            if (!updatedSourceMap.has(edge.source)) {
              updatedSourceMap.set(edge.source, []);
            }
            updatedSourceMap.get(edge.source)!.push(edge);
          }
          // If source didn't change but we're updating an edge
          else if (existingEdge) {
            const sourceEdges = updatedSourceMap.get(edge.source) || [];
            updatedSourceMap.set(
              edge.source,
              sourceEdges.map((e) => (e.id === edge.id ? edge : e))
            );
          }

          return {
            edges: updatedEdges,
            edgeMap: updatedMap,
            edgeSourceMap: updatedSourceMap,
          };
        });
      },

      updateEdges: (edges) => {
        set((state) => {
          // Create lookup for fast access
          const edgeById = new Map(edges.map((e) => [e.id, e]));

          const updatedEdges = state.edges.map((edge) => {
            const updatedEdge = edgeById.get(edge.id);
            return updatedEdge ? { ...edge, ...updatedEdge } : edge;
          });

          // Update edgeMap
          const updatedMap = new Map(state.edgeMap);
          edges.forEach((edge) => updatedMap.set(edge.id, edge));

          // Rebuild sourceMap with updated edges
          const updatedSourceMap = buildEdgeSourceMap(updatedEdges);

          return {
            edges: updatedEdges,
            edgeMap: updatedMap,
            edgeSourceMap: updatedSourceMap,
          };
        });
      },

      removeEdge: (edgeId) => {
        set((state) => {
          const edgeToRemove = state.edgeMap.get(edgeId);
          const updatedEdges = state.edges.filter((edge) => edge.id !== edgeId);

          // Update edgeMap
          const updatedMap = new Map(state.edgeMap);
          updatedMap.delete(edgeId);

          // Update edgeSourceMap
          const updatedSourceMap = new Map(state.edgeSourceMap);
          if (edgeToRemove && edgeToRemove.source) {
            const sourceEdges = updatedSourceMap.get(edgeToRemove.source) || [];
            updatedSourceMap.set(
              edgeToRemove.source,
              sourceEdges.filter((e) => e.id !== edgeId)
            );
          }

          return {
            edges: updatedEdges,
            edgeMap: updatedMap,
            edgeSourceMap: updatedSourceMap,
          };
        });
      },
    }),
    {
      name: "edge-storage",
      partialize: (state) => ({
        edges: state.edges,
        // We don't need to persist the maps since they are derived
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Rebuild the maps after rehydration
          state.edgeMap = new Map();
          state.edges.forEach((edge) => state.edgeMap.set(edge.id, edge));
          state.edgeSourceMap = buildEdgeSourceMap(state.edges);
        }
      },
    }
  )
);
