/** @format */
import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
  useMemo,
} from "react";
import { Node } from "@xyflow/react";
// Assuming these imports are available in your project
import { childNodesData, parentNodesData } from "../../test/default/nodesData"; // Adjust path as needed
import { getOrganizedNodeParents } from "./utils/getOrganizedNodeParents"; // Adjust path as needed
import { rebuildMapState } from "./utils/rebuildMapState";

import { normalizeNodeExpandedState } from "./utils/normalizeNodeExpandedState";
import { NodeAction, nodeReducer } from "./reducer/nodeReducer";


// 1. Define the State Interface (same as Zustand)
export interface NodeStoreState {
  nodes: Node<any>[];
  parentNodes: Node<any>[];
  childNodes: Node<any>[];
  nodeMap: Map<string, Node<any>>;
  nodeParentIdMapWithChildIdSet: Map<string, Set<string>>;
  pureChildIdSet: Set<string>; // For rebuilding childNodes
}



// Initial state based on your existing setup
const initialParentNodes = parentNodesData; // Load default data
const initialChildNodes = childNodesData; // Load default data
const defaultInitialNodes = [...initialParentNodes, ...initialChildNodes];
const defaultInitialStateMaps = rebuildMapState(defaultInitialNodes);

export const defaultInitialState: NodeStoreState = {
  nodes: defaultInitialNodes,
  parentNodes: initialParentNodes,
  childNodes: initialChildNodes,
  nodeMap: defaultInitialStateMaps.nodeMap,
  nodeParentIdMapWithChildIdSet:
    defaultInitialStateMaps.nodeParentIdMapWithChildIdSet,
  pureChildIdSet: defaultInitialStateMaps.pureChildIdSet,
};

// Persistence key
const PERSIST_STORAGE_KEY = "node-context-storage";


// 3. Create the Context
const NodeContext = createContext<{
  state: NodeStoreState;
  dispatch: React.Dispatch<NodeAction>;
} | undefined>(undefined);

// 4. Create the Provider Component
interface NodeProviderProps {
  children: ReactNode;
}

export const NodeProvider: React.FC<NodeProviderProps> = ({ children }) => {
  // Custom initializer function for useReducer to handle loading from storage
  const initializer = (initialState: NodeStoreState): NodeStoreState => {
    console.log("NodeProvider: Initializing state...");
    try {
      const savedState = localStorage.getItem(PERSIST_STORAGE_KEY);
      if (savedState) {
        console.log("NodeProvider: Found saved state, attempting rehydration...");
        const parsedState = JSON.parse(savedState);
        // Perform rehydration logic similar to Zustand's onRehydrateStorage
        // Rebuild maps and normalize data
        const rehydratedNodes = parsedState.nodes.map(normalizeNodeExpandedState);
        const { nodeMap, nodeParentIdMapWithChildIdSet, pureChildIdSet } = rebuildMapState(rehydratedNodes);

        // Ensure parent and child nodes are correctly categorized
        const parentNodes = getOrganizedNodeParents(
          nodeParentIdMapWithChildIdSet,
          nodeMap
        );
        const childNodes = rehydratedNodes.filter((node: Node<any>) =>
          !parentNodes.some(parentNode => parentNode.id === node.id)
        );

        console.log("NodeProvider: Rehydration successful.");
        return {
          nodes: rehydratedNodes,
          nodeMap,
          nodeParentIdMapWithChildIdSet,
          parentNodes,
          childNodes,
          pureChildIdSet, // Include the pure child ID set for future use

        };

      }
      console.log("NodeProvider: No saved state found, using default initial state.");
      return initialState; // No saved state, use default initial state
    } catch (error) {
      console.error("NodeProvider: Failed to load or parse state from storage:", error);
      console.log("NodeProvider: Falling back to default initial state.");
      return initialState; // Error loading, fall back to default
    }
  };


  const [state, dispatch] = useReducer(
    nodeReducer,
    defaultInitialState, // Pass default initial state
    initializer // Use the initializer function for initial load
  );

  // Effect to save state to localStorage whenever the 'nodes' state changes
  // We only save the 'nodes' array as maps and parent/child arrays can be rebuilt
  useEffect(() => {
    console.log("NodeProvider: State updated, saving to storage...");
    try {
      // Save only the essential data (nodes array)
      const stateToSave = { nodes: state.nodes };
      localStorage.setItem(PERSIST_STORAGE_KEY, JSON.stringify(stateToSave));
      console.log("NodeProvider: State saved successfully.");
    } catch (error) {
      console.error("NodeProvider: Failed to save state to storage:", error);
    }

  }, [state.nodes]); // Dependency array: save whenever the nodes array changes

  // Memoize the context value to prevent unnecessary re-renders of consumers
  const contextValue = useMemo(() => ({ state, dispatch }), [state, dispatch]);


  return (
    <NodeContext.Provider value={contextValue}>
      {children}
    </NodeContext.Provider>
  );
};

// 5. Create a Custom Hook to Consume the Context
export const useNodeContext = () => {
  const context = useContext(NodeContext);
  if (context === undefined) {
    throw new Error("useNodeContext must be used within a NodeProvider");
  }

  // Provide individual state properties and bound action creators for a Zustand-like API
  // This mimics the structure of your original Zustand store
  const { state, dispatch } = context;

  const actions = useMemo(() => ({
    getNode: (id: string) => state.nodeMap.get(id),
    setNodes: (nodes: Node<any>[]) => dispatch({ type: "SET_NODES", payload: nodes }),
    addNode: (node: Node<any>) => dispatch({ type: "ADD_NODE", payload: node }),
    removeNodes: (nodes: Node<any>[]) => dispatch({ type: "REMOVE_NODES", payload: nodes }),
    updateNode: (node: Node<any>) => dispatch({ type: "UPDATE_NODE", payload: node }),
    updateNodes: (nodes: Node<any>[]) => dispatch({ type: "UPDATE_NODES", payload: nodes }),
  }), [dispatch, state.nodeMap]); // Depend on dispatch and state.nodeMap for getNode


  return {
    ...state, // Spread all state properties
    ...actions, // Spread all action functions
  };
};

/*
// How to use:
 
// Wrap your app (or the part that needs access to the node state) with the Provider
// import { NodeProvider } from './NodeContext'; // Adjust the path
 
// function App() {
//   return (
//     <NodeProvider>
//       <MyComponentThatNeedsNodes />
//     </NodeProvider>
//   );
// }
 
// Inside a component that needs the state or actions:
// import { useNodeContext } from './NodeContext'; // Adjust the path
 
// function MyComponentThatNeedsNodes() {
//   const { nodes, parentNodes, addNode, removeNodes, updateNode, getNode } = useNodeContext();
 
//   // Use nodes, parentNodes, and call the action functions
//   const handleAddNode = () => {
//     const newNode = { id: 'new-node-123', type: 'default', position: { x: 100, y: 100 }, data: { label: 'New Node' } };
//     addNode(newNode);
//   };
 
//   // ... rest of your component logic
// }
*/