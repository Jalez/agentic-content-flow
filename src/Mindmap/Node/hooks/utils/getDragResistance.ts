import { Node } from "@xyflow/react";
import { NodeData } from "../../../types";

interface DragResistanceResult {
    shouldBreakFree: boolean;
}

// Constants for the drag resistance behavior
const RESISTANCE_THRESHOLD = 100; // Increased threshold for better resistance
const MIN_DRAG_TIME = 500; // Minimum time in ms before allowing break free

// Track when the drag started for each node
// Export this so we can reset it from the drag hook
export const dragStartTimes = new Map<string, number>();

export const getDragResistance = (
    node: Node<NodeData>,
    mousePosition: { x: number; y: number },
    parentNode?: Node<NodeData>
): DragResistanceResult => {
    // If there's no parent node, always allow breaking free (for root nodes)
    if (!parentNode) {
        return { shouldBreakFree: true };
    }
    
    // Track drag start time for this node
    if (!dragStartTimes.has(node.id)) {
        dragStartTimes.set(node.id, Date.now());
    }
    
    // Get current drag duration
    const dragDuration = Date.now() - (dragStartTimes.get(node.id) || 0);
    
    // Only allow breaking free after minimum drag time
    if (dragDuration < MIN_DRAG_TIME) {
        return { shouldBreakFree: false };
    }
    
    // Calculate the distance between mouse position and node center
    const nodeCenter = {
        x: node.position.x + (node.width || 100) / 2,
        y: node.position.y + (node.height || 40) / 2
    };
    
    // Calculate distance between mouse and node center
    const distance = Math.sqrt(
        Math.pow(mousePosition.x - nodeCenter.x, 2) + 
        Math.pow(mousePosition.y - nodeCenter.y, 2)
    );
    
    // If the distance exceeds our threshold, the node should break free
    const shouldBreakFree = distance > RESISTANCE_THRESHOLD;

    return { shouldBreakFree };
};