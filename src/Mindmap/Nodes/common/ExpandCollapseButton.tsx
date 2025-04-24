import {  useState } from "react";
import { IconButton, Badge } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { Node } from "@xyflow/react";
import { useNodeStore } from "../../stores";
import { useNodeHistoryState } from "../../Node/hooks/useNodeState";

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
  const childNodes = nodeParentMap.get(nodeInFlow.id) || [];
  const childCount = childNodes.length;
  const [expanded, setExpanded] = useState(nodeInFlow.data.expanded || false);
  const { updateNodes } = useNodeHistoryState();


  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded((prev: boolean) => !prev);

    //First node to update is the current node, which is the one that is being expanded/collapsed
    const updatedParentNode = {
      ...nodeInFlow,
      data: {
        ...nodeInFlow.data,
        expanded
      },
      style: {
        ...nodeInFlow.style,
        width: expanded ? expandedDimensions.width : collapsedDimensions.width,
        height: expanded ? expandedDimensions.height : collapsedDimensions.height,
      },
    };


    // Add the updated node to the list

    // Update the child nodes (and their child nodes) hidden state in a recursive manner and then return the updated nodes
    const updateParentIdChildren = (Parent: Node): Node[] => {
      //First check if it is in the nodeParentMap
      if (!nodeParentMap.has(Parent.id)) {
        return [];
      }
      //Then check if its expanded
      if (!Parent.data.expanded) {
        return [];
      }
      const childNodes = nodeParentMap.get(Parent.id) || [];
      //Change all children hidden state
      for (const childNode of childNodes) {
        const updatedChildNode = {
          ...childNode,
          hidden: !expanded
          
        };
        const updatedGrandChildNodes = updateParentIdChildren(childNode);
        updatedChildNodes.push(updatedChildNode);
        updatedChildNodes.push(...updatedGrandChildNodes);
      }

      return updatedChildNodes;

    }

    // Update the child nodes
    const updatedChildNodes = updateParentIdChildren(nodeInFlow);
    // Toggle expansion state
    const updatedNodes = [updatedParentNode, ...updatedChildNodes];
    updateNodes(updatedNodes)
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