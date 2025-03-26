/** @format */
import {
  useCallback,
  useEffect,
  useState,
  useRef,
  MutableRefObject,
} from "react";
import { Node, useReactFlow, Viewport } from "@xyflow/react";
import {
  ViewportManager,
  CenterOptions,
} from "../../interfaces/ViewportInterfaces";
import { VIEWPORT_CONSTRAINTS } from "../../constants";

export interface ExtendedViewportManager extends ViewportManager {
  wheelMode: "zoom" | "pan";
}

/**
 * Lightweight hook that implements the ViewportManager interface
 * to provide viewport operations abstracted from @xyflow/react
 */
export function useViewportManager(
  flowWrapper: MutableRefObject<HTMLDivElement | null> | null
): ExtendedViewportManager {
  const [initialRender, setInitialRender] = useState(true);
  const [wheelMode, setWheelModeState] = useState<"zoom" | "pan">("zoom");
  const reactFlowInstance = useReactFlow();
  const centeringInProgress = useRef(false);

  // Reset initial render flag after component mounts
  useEffect(() => {
    setTimeout(() => {
      setInitialRender(false);
    }, 500); // Give enough time for initial layout
  }, []);

  // Get current wheel interaction mode
  const getWheelMode = useCallback(() => wheelMode, [wheelMode]);

  // Set wheel interaction mode
  const setWheelMode = useCallback((mode: "zoom" | "pan") => {
    setWheelModeState(mode);
  }, []);

  // Handle wheel events (mouse scroll) - without unnecessary state updates
  const handleWheel = useCallback(
    (event: React.WheelEvent) => {
      if (event.ctrlKey || event.metaKey) {
        // Zooming behavior - handled by @xyflow/react
        return;
      }

      // Determine if we should pan or zoom based on wheelMode
      if (wheelMode === "pan" && reactFlowInstance) {
        event.preventDefault();
        const currentViewport = reactFlowInstance.getViewport();
        reactFlowInstance.setViewport({
          x: currentViewport.x - event.deltaX,
          y: currentViewport.y - event.deltaY,
          zoom: currentViewport.zoom,
        });
      }
    },
    [wheelMode, reactFlowInstance]
  );

  // Get the current viewport state directly from ReactFlow
  const getViewport = useCallback((): Viewport => {
    if (reactFlowInstance) {
      return reactFlowInstance.getViewport();
    }
    return {
      x: 0,
      y: 0,
      zoom: VIEWPORT_CONSTRAINTS.DEFAULT_ZOOM,
    };
  }, [reactFlowInstance]);

  // Set the viewport state directly in ReactFlow without local state updates
  const setViewport = useCallback(
    (newViewport: Viewport, options?: { duration?: number }) => {
      if (reactFlowInstance) {
        reactFlowInstance.setViewport(newViewport, options);
      }
    },
    [reactFlowInstance]
  );

  // Zoom in (direct pass-through to ReactFlow)
  const zoomIn = useCallback(
    (options?: { duration?: number }) => {
      if (reactFlowInstance) {
        reactFlowInstance.zoomIn(options);
      }
    },
    [reactFlowInstance]
  );

  // Zoom out (direct pass-through to ReactFlow)
  const zoomOut = useCallback(
    (options?: { duration?: number }) => {
      if (reactFlowInstance) {
        reactFlowInstance.zoomOut(options);
      }
    },
    [reactFlowInstance]
  );

  // Fit all nodes to view (direct pass-through to ReactFlow)
  const fitView = useCallback(
    (options?: {
      padding?: number;
      duration?: number;
      includeHidden?: boolean;
    }) => {
      if (reactFlowInstance) {
        reactFlowInstance.fitView(options);
      }
    },
    [reactFlowInstance]
  );

  // Center view on a specific node without triggering local state updates
  const centerOnNode = useCallback(
    (
      node: Node,
      {
        zoom = VIEWPORT_CONSTRAINTS.DEFAULT_ZOOM,
        duration = VIEWPORT_CONSTRAINTS.CENTER_ANIMATION_DURATION,
        force = false,
      }: CenterOptions = {}
    ) => {
      if (!reactFlowInstance || (!force && centeringInProgress.current)) {
        return;
      }

      try {
        // Mark centering as in progress to prevent duplicate calls
        centeringInProgress.current = true;

        // Get flow container dimensions
        const { width = 1000, height = 800 } =
          flowWrapper?.current?.getBoundingClientRect() || {};

        // Calculate viewport position to center the node
        const nodeWidth = node.width || 200;
        const nodeHeight = node.height || 100;

        const x = -node.position.x + width / 2 - nodeWidth / 2;
        const y = -node.position.y + height / 2 - nodeHeight / 2;

        // Smoothly transition to the new viewport
        reactFlowInstance.setViewport({ x, y, zoom }, { duration });

        // Reset the centering flag after animation completes
        if (duration > 0) {
          setTimeout(() => {
            centeringInProgress.current = false;
          }, duration + 100); // Add a small buffer
        } else {
          centeringInProgress.current = false;
        }
      } catch (error) {
        console.error("Error centering node:", error);
        centeringInProgress.current = false;
      }
    },
    [reactFlowInstance, flowWrapper]
  );

  // Initialize viewport for the first time
  const initializeViewport = useCallback(
    (nodes: Node[]) => {
      if (!nodes.length || !reactFlowInstance) return;

      // Center the view around the root node or all nodes
      const rootNode = nodes.find((node) => node.id === "root");
      if (rootNode) {
        // Center on root node
        setTimeout(() => {
          centerOnNode(rootNode, {
            zoom: VIEWPORT_CONSTRAINTS.DEFAULT_ZOOM,
            duration: 0,
          });
        }, 100);
      } else {
        // Fit view to all nodes
        setTimeout(() => {
          reactFlowInstance.fitView({
            padding: VIEWPORT_CONSTRAINTS.FIT_VIEW_PADDING,
            includeHiddenNodes: false,
            duration: 0,
          });
        }, 100);
      }
    },
    [reactFlowInstance, centerOnNode]
  );

  return {
    // Return the current viewport directly from ReactFlow to avoid staleness
    get viewport() {
      return getViewport();
    },
    handleWheel,
    wheelMode,
    setWheelMode,
    getWheelMode,
    centerOnNode,
    initializeViewport,
    initialRender,
    getViewport,
    setViewport,
    zoomIn,
    zoomOut,
    fitView,
  };
}
