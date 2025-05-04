import { useState, useCallback } from 'react';
import { Node } from '@xyflow/react';
import { useNodeStore } from '../../../stores';
import { useNodeHistoryState } from '../../../Node/hooks/useNodeState';
import { updateNodeHierarchyVisibility } from '../utils/nodeHierarchyUtils';

interface ExpandCollapseConfig {
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
   * The node to toggle expansion state for
   */
  node: Node;
}

/**
 * Custom hook for managing expand/collapse state of nodes with children
 */
export const useExpandCollapseState = ({
  collapsedDimensions,
  expandedDimensions,
  node
}: ExpandCollapseConfig) => {
  // Access the store for parent-child relationships
  const nodeParentIdMapWithChildIdSet = useNodeStore(
    (state) => state.nodeParentIdMapWithChildIdSet
  );
  const nodeMap = useNodeStore((state) => state.nodeMap);
  
  // Get count of children for badge display
  const childIdSet = nodeParentIdMapWithChildIdSet.get(node.id) || new Set();
  const childCount = childIdSet.size;
  
  // Local state for expanded status, initialized from node data
  const [expanded, setExpanded] = useState(node.data.expanded || false);
  const { updateNodes } = useNodeHistoryState();

  // Handler for toggle expand/collapse
  const handleToggleExpand = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    
    // First update the parent node (the one being expanded/collapsed)
    const updatedParentNode = {
      ...node,
      data: {
        ...node.data,
        expanded: newExpanded,
      },
      style: {
        ...node.style,
        width: newExpanded ? expandedDimensions.width : collapsedDimensions.width,
        height: newExpanded ? expandedDimensions.height : collapsedDimensions.height,
      },
    };

    // Remove measurement properties to avoid conflicts
    delete updatedParentNode.measured;
    delete updatedParentNode.width;
    delete updatedParentNode.height;

    // Update visibility of all child nodes recursively
    const updatedChildNodes = updateNodeHierarchyVisibility(
      updatedParentNode, 
      nodeMap,
      nodeParentIdMapWithChildIdSet,
      newExpanded
    );

    // Combine parent and children updates
    const updatedNodes = [updatedParentNode, ...updatedChildNodes];
    
    // Persist changes with history tracking
    updateNodes(updatedNodes);
  }, [
    expanded, 
    node, 
    expandedDimensions, 
    collapsedDimensions, 
    nodeMap, 
    nodeParentIdMapWithChildIdSet, 
    updateNodes
  ]);

  return {
    expanded,
    childCount,
    handleToggleExpand
  };
};