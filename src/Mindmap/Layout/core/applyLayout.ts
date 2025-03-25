/** @format */
import ELK from "elkjs/lib/elk.bundled.js";
import type { ElkExtendedEdge, ElkNode } from "elkjs";
import type { Node, Edge } from "@xyflow/react";
import {
  getSourcePosition,
  getTargetPosition,
  stringifyNumericOptions,
  adjustNodePositionForHeader,
  LAYOUT_CONSTANTS,
} from "../utils/layoutUtils";

// Create ELK instance

const elk = new ELK();

// Elk has a *huge* amount of options to configure. To see everything you can
// tweak check out:
//
// - https://www.eclipse.org/elk/reference/algorithms.html
// - https://www.eclipse.org/elk/reference/options.html

export const applyLayout = (
  nodes: Node[],
  edges: Edge[],
  options: any
): Promise<{ nodes: Node[]; edges: Edge[] }> => {
  // If there are no nodes, return immediately
  if (!nodes.length) {
    return Promise.resolve({ nodes: [], edges: [] });
  }

  // Validate edges - only include edges where both source and target nodes exist
  const nodeIds = new Set(nodes.map((node) => node.id));
  const validEdges = edges.filter((edge) => {
    const isValid =
      edge.source &&
      edge.target &&
      nodeIds.has(edge.source) &&
      nodeIds.has(edge.target);

    if (!isValid) {
      console.warn(
        `Skipping invalid edge ${edge.id}: missing source or target node`
      );
    }

    return isValid;
  });

  console.log(
    `Processing ${nodes.length} nodes and ${validEdges.length} valid edges (${
      edges.length - validEdges.length
    } filtered out)`
  );

  const isHorizontal = options?.["elk.direction"] === "RIGHT";
  const graph = {
    id: "root",
    layoutOptions: options,
    children: nodes.map((node) => ({
      ...node,
      // Adjust the target and source handle positions based on the layout
      // direction.
      targetPosition: isHorizontal ? "left" : "top",
      sourcePosition: isHorizontal ? "right" : "bottom",

      // Hardcode a width and height for elk to use when layouting.
      width: node.width || 150,
      height: node.height || 50,
    })),
    edges: validEdges, // Use only valid edges
  };

  return elk
    .layout(graph)
    .then((layoutedGraph: any) => {
      // Start positions with a small offset to avoid the corner
      const offset = { x: 50, y: 100 };

      // Make sure children exists and is an array
      const children = layoutedGraph.children || [];

      return {
        nodes: children.map((node: any) => ({
          ...node,
          position: {
            x: node.x,
            y: node.y + offset.y,
          },
        })),
        edges: layoutedGraph.edges || [],
      };
    })
    .catch((error) => {
      // Log the error but return a valid object to avoid undefined issues
      console.error("ELK layout error:", error);
      return { nodes, edges }; // Return original nodes/edges unchanged
    });
};
