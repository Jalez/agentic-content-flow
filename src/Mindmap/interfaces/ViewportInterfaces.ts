/** @format */
import { Node, Viewport } from "@xyflow/react";

/**
 * Options for centering operations
 */
export interface CenterOptions {
  zoom?: number;
  duration?: number;
  force?: boolean;
}

/**
 * Interface for viewport operations
 * Following Dependency Inversion Principle - high-level modules
 * depend on abstractions, not concrete implementations
 */
export interface ViewportOperations {
  /**
   * Center the viewport on a specific node
   */
  centerOnNode: (node: Node, options?: CenterOptions) => void;

  /**
   * Initialize the viewport based on available nodes
   */
  initializeViewport: (nodes: Node[]) => void;

  /**
   * Get the current viewport state
   */
  getViewport: () => Viewport;

  /**
   * Set the viewport state
   */
  setViewport: (viewport: Viewport, options?: { duration?: number }) => void;

  /**
   * Zoom the viewport in
   */
  zoomIn: (options?: { duration?: number }) => void;

  /**
   * Zoom the viewport out
   */
  zoomOut: (options?: { duration?: number }) => void;

  /**
   * Fit all nodes in the viewport
   */
  fitView: (options?: {
    padding?: number;
    duration?: number;
    includeHidden?: boolean;
  }) => void;
}

/**
 * Interface for handling viewport wheel interactions
 */
export interface ViewportWheelHandlers {
  /**
   * Handle wheel events for zooming/panning
   */
  handleWheel: (event: React.WheelEvent) => void;

  /**
   * Set the wheel interaction mode
   */
  setWheelMode: (mode: "zoom" | "pan") => void;

  /**
   * Get the current wheel interaction mode
   */
  getWheelMode: () => "zoom" | "pan";
}

/**
 * Combined interface for viewport management
 */
export interface ViewportManager
  extends ViewportOperations,
    ViewportWheelHandlers {
  /**
   * Current viewport state
   */
  viewport: Viewport;

  /**
   * Flag indicating if this is the initial render
   */
  initialRender: boolean;
}
