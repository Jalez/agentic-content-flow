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
import { NodeData } from "../../types";

import { normalizeNodeExpandedState } from "./utils/normalizeNodeExpandedState";
import { NodeAction, nodeReducer } from "./reducer/nodeReducer";
// Import useNodeHistoryState to use in NodeProvider
import { useNodeHistoryStateImpl } from "../hooks/useNodeState";


// 1. Define the State Interface (same as Zustand)
export interface NodeStoreState {
  isNewState: boolean;
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
  isNewState: false, 
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


// 3. Create the Context with all the actions we're providing
interface NodeContextType {
  // State properties
  nodes: Node<any>[];
  parentNodes: Node<any>[];
  childNodes: Node<any>[];
  nodeMap: Map<string, Node<any>>;
  nodeParentIdMapWithChildIdSet: Map<string, Set<string>>;
  pureChildIdSet: Set<string>;
  isNewState: boolean;
  // Implementation details
  state: NodeStoreState;
  dispatch: React.Dispatch<NodeAction>;
  // Node operations
  getNode: (id: string) => Node<any> | undefined;
  setNodes: (nodes: Node<any>[]) => void;
  addNode: (node: Node<any>, oldValue?: Node<NodeData>[], description?: string) => void;
  updateNode: (node: Node<any>) => void;
  updateNodes: (nodes: Node<any>[]) => void;
  removeNodes: (nodes: Node<any>[]) => void;
  changeStateAge: (isOld?: boolean) => void;
  onNodesDelete: (nodes: Node<any>[]) => void;
  // Flow operations
  onNodesChange: (changes: any[]) => void;
  onNodeDragStart: (event: any, node: Node<NodeData>, nodesToDrag: Node<NodeData>[]) => void;
  onNodeDrag: (event: any, node: Node<NodeData>, draggedNodes: Node<NodeData>[]) => void;
  onNodeDragStop: (event: any, node: Node<NodeData>, draggedNodes: Node<NodeData>[]) => void;
  isDragging: boolean;
  localNodes: Node<any>[];
}

const NodeContext = createContext<NodeContextType | undefined>(undefined);

// 4. Create the Provider Component
interface NodeProviderProps {
  children: ReactNode;
}

export const NodeProvider: React.FC<NodeProviderProps> = ({ children }) => {
  // Custom initializer function for useReducer to handle loading from storage
  const initializer = (initialState: NodeStoreState): NodeStoreState => {
    try {
      const savedState = localStorage.getItem(PERSIST_STORAGE_KEY);
      if (savedState) {
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

        return {
          isNewState: false, // Reset newNodeSet to false on rehydration
          nodes: rehydratedNodes,
          nodeMap,
          nodeParentIdMapWithChildIdSet,
          parentNodes,
          childNodes,
          pureChildIdSet, // Include the pure child ID set for future use
        };

      }
      return initialState; // No saved state, use default initial state
    } catch (error) {
      console.error("NodeProvider: Failed to load or parse state from storage:", error);
      return initialState; // Error loading, fall back to default
    }
  };

  const [state, dispatch] = useReducer(
    nodeReducer,
    defaultInitialState, // Pass default initial state
    initializer // Use the initializer function for initial load
  );

  // Create base actions (without history tracking)
  const baseActions = useMemo(() => ({
    setNodes: (nodes: Node<any>[]) => dispatch({ type: "SET_NODES", payload: nodes }),
    addNode: (node: Node<any>) => dispatch({ type: "ADD_NODE", payload: node }),
    removeNodes: (nodes: Node<any>[]) => dispatch({ type: "REMOVE_NODES", payload: nodes }),
    updateNode: (node: Node<any>) => dispatch({ type: "UPDATE_NODE", payload: node }),
    updateNodes: (nodes: Node<any>[]) => dispatch({ type: "UPDATE_NODES", payload: nodes }),
    changeStateAge: (isOld: boolean = false) => dispatch({ type: "CHANGE_STATE_AGE", payload: isOld }),
  }), [dispatch]);

  // Use the history state implementation with our state and actions
  const historyActions = useNodeHistoryStateImpl(
    state.nodes,
    baseActions.setNodes,
    baseActions.updateNode,
    baseActions.updateNodes,
    baseActions.removeNodes,
    baseActions.addNode,
    state.nodeMap,
    state.nodeParentIdMapWithChildIdSet
  );

  // Effect to save state to localStorage whenever the 'nodes' state changes
  // We only save the 'nodes' array as maps and parent/child arrays can be rebuilt
  useEffect(() => {
    try {
      // Save only the essential data (nodes array)
      const stateToSave = { nodes: state.nodes };
      localStorage.setItem(PERSIST_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      console.error("NodeProvider: Failed to save state to storage:", error);
    }
  }, [state.nodes]); // Dependency array: save whenever the nodes array changes

  // Create the context value with state and history-tracked actions
  const contextValue = useMemo(() => {
    // Create wrapper functions that can accept either 1 or multiple arguments
    const addNodeWrapper = (node: Node<any>, oldValue?: Node<NodeData>[], description?: string) => {
      if (oldValue) {
        // If oldValue is provided, use all arguments
        historyActions.addNode(node, oldValue, description);
      } else {
        // If only the first argument is provided
        historyActions.addNode(node, [], '');
      }
    };

    return {
      // State properties from state
      nodes: state.nodes,
      parentNodes: state.parentNodes,
      childNodes: state.childNodes,
      nodeMap: state.nodeMap,
      nodeParentIdMapWithChildIdSet: state.nodeParentIdMapWithChildIdSet,
      pureChildIdSet: state.pureChildIdSet,
      isNewState: state.isNewState,
      // Implementation details
      state,
      dispatch,
      // Additional utility actions that don't need history tracking
      getNode: (id: string) => state.nodeMap.get(id),
      changeStateAge: baseActions.changeStateAge,
      // History-tracked actions with wrapper functions
      addNode: addNodeWrapper,
      setNodes: historyActions.setNodes,
      updateNode: historyActions.updateNode,
      updateNodes: historyActions.updateNodes,
      removeNodes: historyActions.onNodesDelete,
      onNodesDelete: historyActions.onNodesDelete,
      // Additional functions from history state
      onNodesChange: historyActions.onNodesChange,
      onNodeDragStart: historyActions.onNodeDragStart,
      onNodeDrag: historyActions.onNodeDrag,
      onNodeDragStop: historyActions.onNodeDragStop,
      isDragging: historyActions.isDragging,
      localNodes: historyActions.localNodes,
    };
  }, [state, dispatch, baseActions, historyActions]);

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

  // The context now provides the history-tracked actions directly
  // No need to recreate them here
  return context;
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