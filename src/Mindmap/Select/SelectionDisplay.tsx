import { Edge, Node, useOnSelectionChange } from "@xyflow/react";
import { useCallback, useState } from "react";

function SelectionDisplay() {
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [selectedEdges, setSelectedEdges] = useState<string[]>([]);

  // the passed handler has to be memoized, otherwise the hook will not work correctly
  const onChange = useCallback(
    ({ nodes, edges }: { nodes: Node[]; edges: Edge[] }) => {
      setSelectedNodes(nodes.map((node) => node.id));
      setSelectedEdges(edges.map((edge) => edge.id));
    },
    []
  );

  useOnSelectionChange({
    onChange,
  });

  return (
    <div>
      <p>Selected nodes: {selectedNodes.join(", ")}</p>
      <p>Selected edges: {selectedEdges.join(", ")}</p>
    </div>
  );
}

export default SelectionDisplay;
