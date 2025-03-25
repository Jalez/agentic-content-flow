import { HTMLAttributes, useEffect } from "react";
import {
  NodeProps,
  NodeResizer,
  Node,
  useReactFlow,
  ResizeDragEvent,
  ResizeParams,
} from "@xyflow/react";
import { Box, Typography } from "@mui/material";
import { BaseNodeContainer, StyledHandle } from "../common/NodeStyles";
import { useLayoutManager } from "../../Layout/hooks/useLayoutManager";
import { useNodeStore } from "../../stores";
import {
  LAYOUT_CONSTANTS,
  adjustNodePositionForHeader,
  getContentStartY,
} from "../../Layout/utils/layoutUtils";
import {
  NodeHeader,
  NodeHeaderTitle,
  NodeHeaderActions,
  NodeHeaderMenuAction,
  NodeHeaderDeleteAction,
} from "../common/NodeHeader";

/**
 * ContainerNode component
 * Represents a container node in the mind map
 *
 * @param {NodeProps} props - Props for the node
 * @returns {JSX.Element} - Rendered node component
 *
 * @typedef {Object} UnifiedNodeData
 *
 * @public
 */
interface UnifiedNodeData {
  label: string;
  details?: string;
  nodeLevel?: "basic" | "intermediate" | "advanced";
  level: number;
  parent?: string;
  courseCode?: string;
  subject?: string;
  nodeType?: "course" | "module";
  position: { x: number; y: number };
  [key: string]: unknown;
}

export type NodeLabelProps = HTMLAttributes<HTMLDivElement>;

const NodeLabel = ({ children }: NodeLabelProps) => {
  return (
    <Box sx={{ width: "100%" }}>
      <Typography>{children}</Typography>
    </Box>
  );
};

NodeLabel.displayName = "NodeLabel";

export const ContainerNode = (node: NodeProps<Node<UnifiedNodeData>>) => {
  const { sourcePosition, targetPosition } = useLayoutManager();
  const { nodeParentMap, updateNode, nodeMap } = useNodeStore();

  const nodeInStore = nodeMap.get(node.id);

  const nodeType =
    node.data.nodeType || (node.data.courseCode ? "course" : "module");
  const isCourse = nodeType === "course";

  const getNodeColor = (nodeLevel: UnifiedNodeData["nodeLevel"]) => {
    const level = nodeLevel || "intermediate";
    switch (level) {
      case "basic":
        return "#1976d2"; // blue
      case "intermediate":
        return "#9c27b0"; // purple
      case "advanced":
        return "#dc004e"; // red
      default:
        return "#1976d2"; // default blue
    }
  };

  const nodeColor = isCourse
    ? "primary.main"
    : getNodeColor(node.data.nodeLevel);

  // Get child nodes directly from the nodeParentMap
  const childNodes = nodeParentMap.get(node.id) || [];

  // Adjust child nodes that are in the header area
  // useEffect(() => {
  //   if (!childNodes.length) return;

  //   // Check if any children are in the header area
  //   const hasChildrenInHeader = childNodes.some((child) => {
  //     const minY = getContentStartY(child.position.y);
  //     return child.position.y < minY;
  //   });

  //   if (hasChildrenInHeader) {
  //     setNodes((nodes) =>
  //       nodes.map((n) => {
  //         if (n.parentId === node.id) {
  //           return adjustNodePositionForHeader(n, n.position.y);
  //         }
  //         return n;
  //       })
  //     );
  //   }
  // }, [node.id, childNodes, setNodes]);
  const handleResize = (event: ResizeDragEvent, data: ResizeParams) => {
    if (!nodeInStore) {
      console.error(`Node with id ${node.id} not found in store.`);
      return;
    }
    // const reactFlowInstance = useReactFlow();

    const { width, height } = data;
    updateNode({
      ...nodeInStore,
      width: width,
      height: height,
    });
  };

  if (!nodeInStore) {
    console.error(`Node with id ${node.id} not found in store.`);
    return null;
  }
  return (
    <>
      {node.selected && (
        <NodeResizer
          minWidth={LAYOUT_CONSTANTS.NODE_DEFAULT_WIDTH * 2}
          minHeight={LAYOUT_CONSTANTS.NODE_DEFAULT_HEIGHT * 3}
          onResize={handleResize}
        />
      )}
      <BaseNodeContainer
        selected={node.selected}
        color={nodeColor}
        sx={{
          width: nodeInStore.width || "100%",
          height: nodeInStore.height || "100%",
          display: "flex",
          flexDirection: "column",
          userSelect: "none",
          ...(isCourse && {
            border: "0.5em solid",
            borderColor: node.selected ? "primary.main" : "divider",
          }),
        }}
      >
        <StyledHandle
          type="target"
          position={targetPosition}
          color={
            isCourse ? (node.selected ? "primary.main" : "grey.400") : nodeColor
          }
        />

        <NodeHeader className="dragHandle">
          <NodeHeaderTitle>{node.data.label}</NodeHeaderTitle>
          <NodeHeaderActions>
            <NodeHeaderMenuAction label="Container Options">
              {/* Add menu items here if needed */}
            </NodeHeaderMenuAction>
            <NodeHeaderDeleteAction />
          </NodeHeaderActions>
        </NodeHeader>

        {!isCourse && node.data.details && (
          <Box sx={{ flex: 1, p: 1.25 }}>
            <Typography variant="body2" color="text.secondary">
              {node.data.details}
            </Typography>
          </Box>
        )}

        <StyledHandle
          type="source"
          position={sourcePosition}
          color={
            isCourse ? (node.selected ? "primary.main" : "grey.400") : nodeColor
          }
        />
      </BaseNodeContainer>
    </>
  );
};

export default ContainerNode;
