/** @format */
import { BezierEdge, SmoothStepEdge, StepEdge } from '@xyflow/react';
import { registerEdgeType } from '../Edge/registry/edgeTypeRegistry';
import { AnimatedPackageEdge } from './AnimatedPackageEdge';

// Track initialization state
let registered = false;

/**
 * Call this function to ensure edge types are registered
 */
export function ensureEdgeTypesRegistered(): void {
  if (registered) return;
  registered = true;

  // Register built-in edge types
  registerEdgeType("default", BezierEdge, { animated: false });
  registerEdgeType("smoothstep", SmoothStepEdge, { animated: false });
  registerEdgeType("step", StepEdge, { animated: false });
  
  // Register animated variants
  registerEdgeType("animated-bezier", BezierEdge, { animated: true });
  registerEdgeType("animated-smoothstep", SmoothStepEdge, { animated: true });
  registerEdgeType("animated-step", StepEdge, { animated: true });
  
  // Register our custom animated package edge
  registerEdgeType("package", AnimatedPackageEdge, {
    animated: true,
    style: { stroke: 'black' }
  });
}