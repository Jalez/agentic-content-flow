/** @format */
import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
  useMemo,
} from "react";
import { Edge, Connection } from "@xyflow/react";
import { edgesData } from "../../test/default/edgeData"; // Adjust path as needed
import { rebuildEdgeMapState } from "./utils/rebuildEdgeMapState";
import { EdgeAction, edgeReducer } from "./reducer/edgeReducer";

// 1. Define the State Interface (same as Zustand)
export interface EdgeStoreState {
  edges: Edge[];
  edgeMap: Map<string, Edge>; // For O(1) lookups
  edgeSourceMap: Map<string, Edge[]>; // Map from source node ID to edges
}

// Initial state based on existing setup
const initialEdges = edgesData;
const initialStateMaps = rebuildEdgeMapState(initialEdges);

export const defaultInitialState: EdgeStoreState = {
  edges: initialEdges,
  edgeMap: initialStateMaps.edgeMap,
  edgeSourceMap: initialStateMaps.edgeSourceMap,
};

// Persistence key
const PERSIST_STORAGE_KEY = "edge-context-storage";

// Create the Context
const EdgeContext = createContext<{
  state: EdgeStoreState;
  dispatch: React.Dispatch<EdgeAction>;
} | undefined>(undefined);

// Create the Provider Component
interface EdgeProviderProps {
  children: ReactNode;
}

export const EdgeProvider: React.FC<EdgeProviderProps> = ({ children }) => {
  // Custom initializer function for useReducer to handle loading from storage
  const initializer = (initialState: EdgeStoreState): EdgeStoreState => {
    console.log("EdgeProvider: Initializing state...");
    try {
      const savedState = localStorage.getItem(PERSIST_STORAGE_KEY);
      if (savedState) {
        console.log("EdgeProvider: Found saved state, attempting rehydration...");
        const parsedState = JSON.parse(savedState);
        
        // Rehydrate using the reducer's REHYDRATE action
        // This will rebuild the maps from the edges array
        return edgeReducer(initialState, {
          type: "REHYDRATE",
          payload: parsedState
        });
      }
      console.log("EdgeProvider: No saved state found, using default initial state.");
      return initialState; // No saved state, use default initial state
    } catch (error) {
      console.error("EdgeProvider: Failed to load or parse state from storage:", error);
      console.log("EdgeProvider: Falling back to default initial state.");
      return initialState; // Error loading, fall back to default
    }
  };

  const [state, dispatch] = useReducer(
    edgeReducer,
    defaultInitialState,
    initializer
  );

  // Effect to save state to localStorage whenever the 'edges' state changes
  // We only save the edges array as maps can be rebuilt
  useEffect(() => {
    console.log("EdgeProvider: State updated, saving to storage...");
    try {
      // Save only the essential data (edges array)
      const stateToSave = { edges: state.edges };
      localStorage.setItem(PERSIST_STORAGE_KEY, JSON.stringify(stateToSave));
      console.log("EdgeProvider: State saved successfully.");
    } catch (error) {
      console.error("EdgeProvider: Failed to save state to storage:", error);
    }
  }, [state.edges]); // Dependency array: save whenever the edges array changes

  // Memoize the context value to prevent unnecessary re-renders of consumers
  const contextValue = useMemo(() => ({ state, dispatch }), [state, dispatch]);

  return (
    <EdgeContext.Provider value={contextValue}>
      {children}
    </EdgeContext.Provider>
  );
};

// Create a Custom Hook to Consume the Context
export const useEdgeContext = () => {
  const context = useContext(EdgeContext);
  if (context === undefined) {
    throw new Error("useEdgeContext must be used within an EdgeProvider");
  }

  // Provide individual state properties and bound action creators for a Zustand-like API
  // This mimics the structure of the original Zustand store
  const { state, dispatch } = context;

  const actions = useMemo(() => ({
    // Edge operations
    getEdge: (id: string) => state.edgeMap.get(id),
    setEdges: (edges: Edge[]) => dispatch({ type: "SET_EDGES", payload: edges }),
    addEdgeToStore: (edge: Edge | Connection) => dispatch({ type: "ADD_EDGE", payload: edge }),
    updateEdge: (edge: Edge) => dispatch({ type: "UPDATE_EDGE", payload: edge }),
    updateEdges: (edges: Edge[]) => dispatch({ type: "UPDATE_EDGES", payload: edges }),
    removeEdge: (edgeId: string) => dispatch({ type: "REMOVE_EDGE", payload: edgeId }),
    removeEdges: (edges: Edge[]) => dispatch({ type: "REMOVE_EDGES", payload: edges }),
  }), [dispatch, state.edgeMap]); // Depend on dispatch and state.edgeMap for getEdge

  return {
    ...state, // Spread all state properties
    ...actions, // Spread all action functions
  };
};

/*
// How to use:
 
// Wrap your app (or the part that needs access to the edge state) with the Provider
// import { EdgeProvider } from './EdgeContext'; // Adjust the path
 
// function App() {
//   return (
//     <EdgeProvider>
//       <MyComponentThatNeedsEdges />
//     </EdgeProvider>
//   );
// }
 
// Inside a component that needs the state or actions:
// import { useEdgeContext } from './EdgeContext'; // Adjust the path
 
// function MyComponentThatNeedsEdges() {
//   const { edges, addEdgeToStore, removeEdge, updateEdge, getEdge } = useEdgeContext();
 
//   // Use edges and call the action functions
//   const handleAddEdge = (params) => {
//     addEdgeToStore(params);
//   };
 
//   // ... rest of your component logic
// }
*/