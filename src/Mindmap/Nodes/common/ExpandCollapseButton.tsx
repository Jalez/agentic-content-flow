import { useState } from "react";
import { IconButton, Badge } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { Node } from "@xyflow/react";
import { useNodeStore } from "../../stores";
import { useNodeHistoryState } from "../../Node/hooks/useNodeState";
import { updateNodeHierarchyVisibility } from "./utils/nodeHierarchyUtils";

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
  const nodeParentMap = useNodeStore((state) => state.nodeParentMap);

  const nodeParentIdMapWithChildIdSet = useNodeStore(
    (state) => state.nodeParentIdMapWithChildIdSet
  );
  const nodeMap = useNodeStore((state) => state.nodeMap);
  const childNodes = nodeParentMap.get(nodeInFlow.id) || [];
  const childCount = childNodes.length;
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
    <IconButton
      onClick={handleToggleExpand}
      //size="small"
      sx={{ mr: 0.5 }}
      aria-label={expanded ? "Collapse" : "Expand"}
    >
      {expanded ? (
        <ExpandLessIcon />
      ) : (
        <Badge badgeContent={childCount} color="primary">
          <ExpandMoreIcon />
        </Badge>
      )}
    </IconButton>
  );
};

export default ExpandCollapseButton;