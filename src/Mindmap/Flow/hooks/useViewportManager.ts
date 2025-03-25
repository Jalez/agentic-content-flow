/** @format */
import {
  useCallback,
  useEffect,
  useState,
  useRef,
  MutableRefObject,
} from "react";
import {
  Node,
  useReactFlow,
  useOnViewportChange,
  Viewport,
} from "@xyflow/react";
import {
  ViewportManager,
  CenterOptions,
} from "../../interfaces/ViewportInterfaces";
import { VIEWPORT_CONSTRAINTS } from "../../constants";

export interface ExtendedViewportManager extends ViewportManager {
  wheelMode: "zoom" | "pan";
}

/**
 * Hook that implements the ViewportManager interface
 * to provide viewport operations abstracted from @xyflow/react
 */
export function useViewportManager(
  flowWrapper: MutableRefObject<HTMLDivElement | null> | null
): ExtendedViewportManager {
  const [initialRender, setInitialRender] = useState(true);
  const [viewport, setViewportState] = useState<Viewport>({
    x: 0,
    y: 0,
    zoom: VIEWPORT_CONSTRAINTS.DEFAULT_ZOOM,
  });
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

  // Handle wheel events (mouse scroll)
  const handleWheel = useCallback(
    (event: React.WheelEvent) => {
      if (event.ctrlKey || event.metaKey) {
        // Zooming behavior - handled by @xyflow/react
        return;
      }

      // Determine if we should pan or zoom based on wheelMode
      if (wheelMode === "pan" && reactFlowInstance) {
        event.preventDefault();
        reactFlowInstance.setViewport({
          x: reactFlowInstance.getViewport().x - event.deltaX,
          y: reactFlowInstance.getViewport().y - event.deltaY,
          zoom: reactFlowInstance.getViewport().zoom,
        });
      }
    },
    [wheelMode, reactFlowInstance]
  );

  // Get the current viewport state
  const getViewport = useCallback((): Viewport => {
    if (reactFlowInstance) {
      const { x, y, zoom } = reactFlowInstance.getViewport();
      return { x, y, zoom };
    }
    return viewport;
  }, [reactFlowInstance, viewport]);

  // Set the viewport state
  const setViewport = useCallback(
    (newViewport: Viewport, options?: { duration?: number }) => {
      if (reactFlowInstance) {
        reactFlowInstance.setViewport(newViewport, options);
        setViewportState(newViewport);
      }
    },
    [reactFlowInstance]
  );

  // Zoom in
  const zoomIn = useCallback(
    (options?: { duration?: number }) => {
      if (reactFlowInstance) {
        reactFlowInstance.zoomIn(options);
      }
    },
    [reactFlowInstance]
  );

  // Zoom out
  const zoomOut = useCallback(
    (options?: { duration?: number }) => {
      if (reactFlowInstance) {
        reactFlowInstance.zoomOut(options);
      }
    },
    [reactFlowInstance]
  );

  // Fit all nodes to view
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

  // Center view on a specific node
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
        // Taking into account the current zoom level
        const nodeWidth = node.width || 200;
        const nodeHeight = node.height || 100;

        const x = -node.position.x + width / 2 - nodeWidth / 2;
        const y = -node.position.y + height / 2 - nodeHeight / 2;

        // Smoothly transition to the new viewport
        reactFlowInstance.setViewport({ x, y, zoom }, { duration });

        // Update local state to match
        setViewportState({ x, y, zoom });

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

  // Listen for viewport changes using useOnViewportChange hook
  useOnViewportChange({
    onChange: (viewport) => {
      if (!centeringInProgress.current) {
        setViewportState(viewport);
      }
    },
  });

  return {
    viewport,
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
