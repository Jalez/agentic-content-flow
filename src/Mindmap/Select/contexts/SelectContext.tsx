import {
  createContext,
  useContext,
  useCallback,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { Edge, Node, useOnSelectionChange, useReactFlow } from "@xyflow/react";
import { useEdgeStore, useNodeStore } from "../../stores";

//Create a context for the selected nodes and edges

interface SelectContextType {
  selectedNodes: Node[];
  selectedEdges: Edge[];
  hasSelection: boolean;
  handleCenterOnSelected: () => void;
  deleteSelected: () => void;
  clearSelection: () => void;
}

const SelectContext = createContext<SelectContextType | undefined>(undefined);

export const SelectProvider = ({ children }: { children: ReactNode }) => {
  const reactFlowInstance = useReactFlow();
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
  const [selectedEdges, setSelectedEdges] = useState<Edge[]>([]);
  const removeEdge = useEdgeStore((state) => state.removeEdge);
  const removeNode = useNodeStore((state) => state.removeNode);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Delete" || event.key === "Backspace") {
        deleteSelected();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedNodes]);

  const onChange = useCallback(
    ({ nodes, edges }: { nodes: Node[]; edges: Edge[] }) => {
      setSelectedNodes(nodes);
      setSelectedEdges(edges);
    },
    []
  );

  useOnSelectionChange({
    onChange,
  });

  const deleteSelected = useCallback(() => {
    if (selectedNodes.length === 0 && selectedEdges.length === 0) return;

    selectedNodes.forEach((node) => {
      removeNode(node.id);
    });
    selectedEdges.forEach((edge) => {
      removeEdge(edge.id);
    });
    reactFlowInstance.deleteElements({
      nodes: selectedNodes,
      edges: selectedEdges,
    });

    clearSelection();
  }, [selectedNodes, selectedEdges, reactFlowInstance]);

  const handleCenterOnSelected = useCallback(() => {
    if (selectedNodes.length === 0 && selectedEdges.length === 0) return;

    reactFlowInstance.fitView({
      nodes: selectedNodes,
      duration: 1000,
      padding: 0.1,
    });
  }, [selectedNodes, selectedEdges, reactFlowInstance]);

  const clearSelection = useCallback(() => {
    setSelectedNodes([]);
    setSelectedEdges([]);
  }, []);

  const hasSelection = selectedNodes.length > 0 || selectedEdges.length > 0;

  const value = {
    selectedNodes,
    selectedEdges,
    hasSelection,
    deleteSelected,
    handleCenterOnSelected,
    clearSelection,
  };

  return (
    <SelectContext.Provider value={value}>{children}</SelectContext.Provider>
  );
};

export const useSelect = () => {
  const context = useContext(SelectContext);
  if (context === undefined) {
    throw new Error("useSelect must be used within a SelectProvider");
  }
  return context;
};

export default SelectContext;
