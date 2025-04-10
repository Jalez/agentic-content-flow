import { useCallback, useRef } from "react";
import { IconButton, Badge } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { Node } from "@xyflow/react";
import { LAYOUT_CONSTANTS } from "../../Layout/utils/layoutUtils";

interface ExpandCollapseButtonProps {
  /**
   * The node from the flow
   */
  nodeInStore: Node | undefined;
  
  /**
   * Node ID
   */
  nodeId: string;
  
  /**
   * Whether the node is currently expanded
   */
  isExpanded: boolean;
  
  /**
   * Number of child nodes
   */
  childCount: number;
  
  /**
   * Function to update a node in the store
   */
  updateNode: (node: Node) => void;
  
  /**
   * Function to toggle node expansion state
   */
  toggleNodeExpansion: (nodeId: string) => void;
}

/**
 * A reusable button component for expanding and collapsing nodes
 */
export const ExpandCollapseButton = ({
  nodeInStore,
  nodeId,
  isExpanded,
  childCount,
  updateNode,
  toggleNodeExpansion,
}: ExpandCollapseButtonProps) => {
  // Store original dimensions to restore them when expanding
  const originalDimensions = useRef<{ width?: number; height?: number } | null>(null);

  // Reusable function to update node dimensions
  const updateNodeDimensions = useCallback((width: number, height: number) => {
    if (!nodeInStore) {
      console.error(`Node with id ${nodeId} not found in store.`);
      return;
    }
    
    updateNode({
      ...nodeInStore,
      style: {
        ...nodeInStore.style,
        width,
        height,
      },
      measured: undefined, // Remove measured property
      width: undefined, // Remove direct width/height properties
      height: undefined, // Remove direct width/height properties
    });
  }, [nodeId, nodeInStore, updateNode]);
  
  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!nodeInStore || !nodeInStore.style) return;
    
    // Initialize style object if it doesn't exist
    if (!nodeInStore.style) {
      nodeInStore.style = {};
    }
    
    // Save original dimensions on first toggle
    if (!originalDimensions.current) {
      originalDimensions.current = {
        width: nodeInStore.style.width ? parseFloat(nodeInStore.style.width.toString()) : LAYOUT_CONSTANTS.NODE_DEFAULT_WIDTH * 2,
        height: nodeInStore.style.height ? parseFloat(nodeInStore.style.height.toString()) : LAYOUT_CONSTANTS.NODE_DEFAULT_HEIGHT * 3,
      };
    }
  
    const goingToBeExpanded = !isExpanded;
    
    if (goingToBeExpanded) {
      // Expanding - restore original dimensions
      updateNodeDimensions(
        originalDimensions.current.width || LAYOUT_CONSTANTS.NODE_DEFAULT_WIDTH * 2,
        originalDimensions.current.height || LAYOUT_CONSTANTS.NODE_DEFAULT_HEIGHT * 3
      );
    } else {
      // Collapsing - store current dimensions first
      originalDimensions.current = {
        width: nodeInStore.style.width ? parseFloat(nodeInStore.style.width.toString()) : LAYOUT_CONSTANTS.NODE_DEFAULT_WIDTH * 2,
        height: nodeInStore.style.height ? parseFloat(nodeInStore.style.height.toString()) : LAYOUT_CONSTANTS.NODE_DEFAULT_HEIGHT * 3,
      };
      
      // Apply collapsed dimensions
      updateNodeDimensions(
        LAYOUT_CONSTANTS.NODE_DEFAULT_WIDTH * 2,
        LAYOUT_CONSTANTS.NODE_DEFAULT_HEIGHT * 3
      );
    }
  
    // Toggle expansion state
    toggleNodeExpansion(nodeId);
  };

  return (
    <IconButton
      onClick={handleToggleExpand}
      size="small"
      sx={{ mr: 0.5 }}
      aria-label={isExpanded ? "Collapse" : "Expand"}
    >
      {isExpanded ? (
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