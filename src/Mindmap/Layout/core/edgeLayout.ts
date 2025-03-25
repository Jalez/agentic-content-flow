/** @format */
import { Edge, Node } from "@xyflow/react";

/**
 * Adjust edge handles for container nodes
 */
export const adjustContainerEdgeHandles = (
  nodes: Node[],
  edges: Edge[],
  direction: string
): Edge[] => {
  const nodeMap = new Map<string, Node>();
  nodes.forEach((node) => nodeMap.set(node.id, node));

  const isContainer = (nodeId: string): boolean => {
    return nodes.some((n) => n.parentId === nodeId);
  };

  return edges.map((edge) => {
    const sourceNode = nodeMap.get(edge.source);
    const targetNode = nodeMap.get(edge.target);

    if (!sourceNode || !targetNode) return edge;

    if (isContainer(edge.source) || isContainer(edge.target)) {
      const updatedEdge = { ...edge };

      const sourceWidth = sourceNode.width || 150;
      const sourceHeight = sourceNode.height || 50;
      const targetWidth = targetNode.width || 150;
      const targetHeight = targetNode.height || 50;

      switch (direction) {
        case "RIGHT":
          if (isContainer(edge.source)) {
            updatedEdge.sourceHandle = "right";
          }
          if (isContainer(edge.target)) {
            updatedEdge.targetHandle = "left";
          }
          break;
        case "LEFT":
          if (isContainer(edge.source)) {
            updatedEdge.sourceHandle = "left";
          }
          if (isContainer(edge.target)) {
            updatedEdge.targetHandle = "right";
          }
          break;
        case "UP":
          if (isContainer(edge.source)) {
            updatedEdge.sourceHandle = "top";
          }
          if (isContainer(edge.target)) {
            updatedEdge.targetHandle = "bottom";
          }
          break;
        default: // DOWN
          if (isContainer(edge.source)) {
            updatedEdge.sourceHandle = "bottom";
          }
          if (isContainer(edge.target)) {
            updatedEdge.targetHandle = "top";
          }
          break;
      }

      return updatedEdge;
    }

    return edge;
  });
};
