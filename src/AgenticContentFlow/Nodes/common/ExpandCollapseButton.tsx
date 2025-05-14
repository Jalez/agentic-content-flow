import { useState } from "react";
import { Node } from "@xyflow/react";
import { useNodeStore } from "../../stores";
import { useNodeHistoryState } from "../../Node/hooks/useNodeState";
import { updateNodeHierarchyVisibility } from "./utils/nodeHierarchyUtils";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExpandCollapseButtonProps {
  /**
   * Dimensions to apply when the node is collapsed
   */
  collapsedDimensions: {
    width: number;
    height: number;
  };

  /**
   * Dimensions to apply when the node is expanded
   */
  expandedDimensions: {
    width: number;
    height: number;
  };
  /**
   * The node from the flow
   */
  nodeInFlow: Node;

}

/**
 * A reusable button component for expanding and collapsing nodes
 */
export const ExpandCollapseButton = ({
  collapsedDimensions,
  expandedDimensions,
  nodeInFlow,
}: ExpandCollapseButtonProps) => {
  const nodeParentIdMapWithChildIdSet = useNodeStore(
    (state) => state.nodeParentIdMapWithChildIdSet
  );
  const nodeMap = useNodeStore((state) => state.nodeMap);
  
  // Use the more efficient Set-based approach to get child IDs
  const childIdSet = nodeParentIdMapWithChildIdSet.get(nodeInFlow.id) || new Set();
  const childCount = childIdSet.size;
  
  const [expanded, setExpanded] = useState(nodeInFlow.data.expanded || false);
  const { updateNodes } = useNodeHistoryState();


  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    console.log("Expanded", newExpanded);
    
    // First node to update is the current node, which is being expanded/collapsed
    const updatedParentNode = {
      ...nodeInFlow,
      data: {
        ...nodeInFlow.data,
        expanded: newExpanded,
      },
      style: {
        ...nodeInFlow.style,
        width: newExpanded ? expandedDimensions.width : collapsedDimensions.width,
        height: newExpanded ? expandedDimensions.height : collapsedDimensions.height,
      },
    };

    //remove measured and width and height
    delete updatedParentNode.measured;
    delete updatedParentNode.width;
    delete updatedParentNode.height;
    

    // Update the child nodes using the utility function
    const updatedChildNodes = updateNodeHierarchyVisibility(
      updatedParentNode, 
      nodeMap,
      nodeParentIdMapWithChildIdSet,
      newExpanded
    );

    // Toggle expansion state
    const updatedNodes = [updatedParentNode, ...updatedChildNodes];
    console.log("Updated nodes", updatedNodes);
    updateNodes(updatedNodes);
  };

  return (
    <Button
      onClick={handleToggleExpand}
      size="icon"
      variant="ghost"
      className="mr-1 relative h-6 w-6"
      aria-label={expanded ? "Collapse" : "Expand"}
    >
      {expanded ? (
        <ChevronUp className="size-4" />
      ) : (
        <>
          <ChevronDown className="size-4" />
          {childCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[0.6rem] font-semibold text-primary-foreground">
              {childCount}
            </span>
          )}
        </>
      )}
    </Button>
  );
};

export default ExpandCollapseButton;