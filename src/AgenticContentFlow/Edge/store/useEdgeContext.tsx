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
// Import useEdgeStateImpl to use in EdgeProvider
import { useEdgeStateImpl } from "../hooks/useEdgeState";

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

// Create the Context with all the actions we're providing
interface EdgeContextType {
  // State properties
  edges: Edge[];
  edgeMap: Map<string, Edge>;
  edgeSourceMap: Map<string, Edge[]>;
  // Implementation details
  state: EdgeStoreState;
  dispatch: React.Dispatch<EdgeAction>;
  // Edge operations
  getEdge: (id: string) => Edge | undefined;
  setEdges: (edges: Edge[]) => void;
  addEdgeToStore: (edge: Edge | Connection, oldValue?: Edge[], description?: string) => void;
  updateEdge: (edge: Edge) => void;
  updateEdges: (edges: Edge[]) => void;
  removeEdge: (edgeId: string) => void;
  removeEdges: (edges: Edge[]) => void;
  // Flow operations
  onEdgesChange: (changes: any[]) => void;
  handleUpdateEdges: (edges: Edge[]) => void;
  onEdgeRemove: (edges: Edge[]) => void;
  visibleEdges: Edge[];
  getVisibleEdges: () => Edge[];
}

const EdgeContext = createContext<EdgeContextType | undefined>(undefined);

// Create the Provider Component
interface EdgeProviderProps {
  children: ReactNode;
}

export const EdgeProvider: React.FC<EdgeProviderProps> = ({ children }) => {
  // Custom initializer function for useReducer to handle loading from storage
  const initializer = (initialState: EdgeStoreState): EdgeStoreState => {
    try {
      const savedState = localStorage.getItem(PERSIST_STORAGE_KEY);
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        
        // Rehydrate using the reducer's REHYDRATE action
        // This will rebuild the maps from the edges array
        return edgeReducer(initialState, {
          type: "REHYDRATE",
          payload: parsedState
        });
      }
      return initialState; // No saved state, use default initial state
    } catch (error) {
      console.error("EdgeProvider: Failed to load or parse state from storage:", error);
      return initialState; // Error loading, fall back to default
    }
  };

  const [state, dispatch] = useReducer(
    edgeReducer,
    defaultInitialState,
    initializer
  );

  // Create base actions (without history tracking)
  const baseActions = useMemo(() => ({
    setEdges: (edges: Edge[]) => dispatch({ type: "SET_EDGES", payload: edges }),
    addEdgeToStore: (edge: Edge | Connection) => dispatch({ type: "ADD_EDGE", payload: edge }),
    updateEdge: (edge: Edge) => dispatch({ type: "UPDATE_EDGE", payload: edge }),
    updateEdges: (edges: Edge[]) => dispatch({ type: "UPDATE_EDGES", payload: edges }),
    removeEdge: (edgeId: string) => dispatch({ type: "REMOVE_EDGE", payload: edgeId }),
    removeEdges: (edges: Edge[]) => dispatch({ type: "REMOVE_EDGES", payload: edges }),
  }), [dispatch]);

  // Use the edge state implementation with our state and actions
  const historyActions = useEdgeStateImpl(
    state.edges,
    baseActions.setEdges,
    baseActions.updateEdges,
    baseActions.removeEdges,
    baseActions.addEdgeToStore
  );

  // Effect to save state to localStorage whenever the 'edges' state changes
  // We only save the edges array as maps can be rebuilt
  useEffect(() => {
    try {
      // Save only the essential data (edges array)
      const stateToSave = { edges: state.edges };
      localStorage.setItem(PERSIST_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      console.error("EdgeProvider: Failed to save state to storage:", error);
    }
  }, [state.edges]); // Dependency array: save whenever the edges array changes

  // Create the context value with state and history-tracked actions
  const contextValue = useMemo(() => {
    // Create wrapper function for addEdgeToStore that can handle both usage patterns
    const addEdgeToStoreWrapper = (edge: Edge | Connection, oldValue?: Edge[], description?: string) => {
      if (oldValue) {
        // If oldValue is provided, use all arguments
        historyActions.addEdgeToStore(edge, oldValue, description);
      } else {
        // If only the first argument is provided
        historyActions.addEdgeToStore(edge, state.edges, '');
      }
    };

    return {
      // State properties
      edges: state.edges,
      edgeMap: state.edgeMap,
      edgeSourceMap: state.edgeSourceMap,
      // Implementation details
      state,
      dispatch,
      // Utility function
      getEdge: (id: string) => state.edgeMap.get(id),
      // Standard edge operations
      updateEdge: baseActions.updateEdge,  // Not history-tracked yet
      removeEdge: baseActions.removeEdge,  // Not history-tracked yet
      // History-tracked actions
      setEdges: historyActions.setEdges,
      updateEdges: historyActions.handleUpdateEdges,
      removeEdges: historyActions.onEdgeRemove,
      addEdgeToStore: addEdgeToStoreWrapper,
      // Additional edge operations
      onEdgesChange: historyActions.onEdgesChange,
      handleUpdateEdges: historyActions.handleUpdateEdges,
      onEdgeRemove: historyActions.onEdgeRemove,
      visibleEdges: historyActions.visibleEdges,
      getVisibleEdges: historyActions.getVisibleEdges
    };
  }, [state, dispatch, baseActions, historyActions]);

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

  // The context now provides the history-tracked actions directly
  // No need to recreate them here
  return context;
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