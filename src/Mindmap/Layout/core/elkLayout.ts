/** @format */
import ELK, { ElkNode, ElkExtendedEdge } from "elkjs/lib/elk.bundled.js";
import { Edge, Node, Position } from "@xyflow/react";
import {
  getSourcePosition,
  getTargetPosition,
  stringifyNumericOptions,
  LAYOUT_CONSTANTS,
  adjustNodePositionForHeader,
} from "../utils/layoutUtils";

// Create a singleton ELK instance
const elk = new ELK();

/**
 * Calculate and apply the layout to the given nodes and edges using ELK
 */
export const calculateLayout = async (
  nodes: Node[],
  edges: Edge[],
  options: Record<string, any> = {}
): Promise<{ nodes: Node[]; edges: Edge[] }> => {
  if (!nodes.length) {
    return { nodes, edges };
  }

  try {
    // Store node and edge data in maps to avoid type issues with ELK
    const nodeDataMap = new Map<
      string,
      { originalNode: Node; targetPosition: Position; sourcePosition: Position }
    >();
    const edgeDataMap = new Map<string, { originalEdge: Edge }>();

    // First, we need to organize nodes based on their connections and containment
    const containerNodes = nodes.filter((node) =>
      nodes.some((n) => n.parentId === node.id)
    );
    const containerNodeIds = new Set(containerNodes.map((n) => n.id));

    const validNodeIds = new Set(nodes.map((n) => n.id));
    const validEdges = edges.filter(
      (edge) => validNodeIds.has(edge.source) && validNodeIds.has(edge.target)
    );

    // Create a map to organize nodes by their parent
    const nodesByParent = new Map<string | undefined, Node[]>();

    // Group nodes by their parent ID
    nodes.forEach((node) => {
      const parentId = node.parentId;
      if (!nodesByParent.has(parentId)) {
        nodesByParent.set(parentId, []);
      }
      nodesByParent.get(parentId)!.push(node);
    });

    // Fetch all top-level nodes (nodes without parents)
    const topLevelNodes = nodesByParent.get(undefined) || [];

    // Create a function to recursively build the ELK graph structure
    const buildElkHierarchy = (parentNodes: Node[], level = 0): ElkNode[] => {
      return parentNodes.map((node) => {
        // Get the children of this node
        const children = nodesByParent.get(node.id) || [];

        let nodeWidth = node.width || LAYOUT_CONSTANTS.NODE_DEFAULT_WIDTH;
        let nodeHeight = node.height || LAYOUT_CONSTANTS.NODE_DEFAULT_HEIGHT;

        const elkNode: ElkNode = {
          id: node.id,
          width: nodeWidth,
          height: nodeHeight,
        };

        // Store node data in the map
        nodeDataMap.set(node.id, {
          originalNode: node,
          targetPosition: getTargetPosition(options["elk.direction"]),
          sourcePosition: getSourcePosition(options["elk.direction"]),
        });

        const spacingMultiplier = Math.max(0.8, 1 - level * 0.1);
        const layerSpacing = parseFloat(
          options["elk.layered.spacing.nodeNodeBetweenLayers"] || "150"
        );
        const nodeNodeSpacing = parseFloat(
          options["elk.spacing.nodeNode"] || "100"
        );

        if (children.length > 0) {
          elkNode.children = buildElkHierarchy(children, level + 1);
          elkNode.layoutOptions = {
            "elk.padding": "[left=60, top=60, right=60, bottom=60]",
            "elk.contentAlignment": "V_TOP H_CENTER",
            "elk.algorithm": options["elk.algorithm"],
            "elk.direction": options["elk.direction"],
            "elk.layered.spacing.nodeNodeBetweenLayers": String(
              Math.floor(layerSpacing * spacingMultiplier)
            ),
            "elk.spacing.nodeNode": String(
              Math.floor(nodeNodeSpacing * spacingMultiplier)
            ),
            "elk.mrtree.spacing.levelDistance":
              options["elk.algorithm"] === "mrtree"
                ? String(Math.floor(layerSpacing * spacingMultiplier))
                : "0",
            "elk.layered.compaction.postCompaction.strategy": "EDGE_LENGTH",
            "elk.layered.spacing.baseValue": String(
              Math.floor(layerSpacing * 0.6)
            ),
          };
        }

        return elkNode;
      });
    };

    // Prepare the graph structure for ELK with container hierarchy
    const elkGraph: ElkNode = {
      id: "root",
      layoutOptions: stringifyNumericOptions({
        ...options,
        "elk.partitioning.activate": "true",
        "elk.hierarchyHandling": "INCLUDE_CHILDREN",
        "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
        "elk.spacing.componentComponent": "80",
        "elk.separateConnectedComponents": "true",
      }),
      children: buildElkHierarchy(topLevelNodes),
      edges: validEdges.map((edge) => {
        const elkEdge: ElkExtendedEdge = {
          id: edge.id,
          sources: [edge.source],
          targets: [edge.target],
        };

        edgeDataMap.set(edge.id, {
          originalEdge: edge,
        });

        return elkEdge;
      }),
    };

    // Calculate the layout
    const layoutedGraph = await elk.layout(elkGraph);

    // Function to recursively extract nodes from the ELK result
    const extractLayoutedNodes = (elkNodes?: ElkNode[]): Node[] => {
      if (!elkNodes) return [];

      let result: Node[] = [];

      elkNodes.forEach((elkNode) => {
        const nodeData = nodeDataMap.get(elkNode.id);
        if (!nodeData) return;

        const { originalNode, targetPosition, sourcePosition } = nodeData;

        const absoluteX = elkNode.x || 0;
        const absoluteY = elkNode.y || 0;
        const width =
          elkNode.width ||
          originalNode.width ||
          LAYOUT_CONSTANTS.NODE_DEFAULT_WIDTH;
        const height =
          elkNode.height ||
          originalNode.height ||
          LAYOUT_CONSTANTS.NODE_DEFAULT_HEIGHT;

        // Create base node with position and dimensions
        let updatedNode: Node = {
          ...originalNode,
          position: {
            x: absoluteX,
            y: absoluteY,
          },
          width,
          height,
          targetPosition,
          sourcePosition,
          style: {
            ...originalNode.style,
            width,
            height,
          },
        };

        // If this node has a parent, adjust its position to account for the header
        if (originalNode.parentId) {
          const parentNode = nodeDataMap.get(originalNode.parentId);
          if (parentNode) {
            const adjustedNode = adjustNodePositionForHeader(
              updatedNode,
              parentNode.originalNode.position.y
            );
            if (adjustedNode) {
              updatedNode = adjustedNode;
            }
          }
        }

        result.push(updatedNode);

        // Process children recursively
        if (elkNode.children && elkNode.children.length > 0) {
          const childNodes = extractLayoutedNodes(elkNode.children);
          result = result.concat(childNodes);
        }
      });

      return result;
    };

    // Extract all layouted nodes recursively
    const layoutedNodes = extractLayoutedNodes(layoutedGraph.children);

    // Process edges
    const layoutedEdges = edges.map((edge) => {
      const elkEdge = layoutedGraph.edges?.find((e) => e.id === edge.id);
      if (!elkEdge) return edge;

      const edgeData = edgeDataMap.get(edge.id);
      if (!edgeData) return edge;

      return {
        ...edgeData.originalEdge,
        points: elkEdge.sections?.[0]?.bendPoints || undefined,
      };
    });

    return {
      nodes: layoutedNodes,
      edges: layoutedEdges,
    };
  } catch (error) {
    console.error("Error calculating layout:", error);
    return { nodes, edges };
  }
};
