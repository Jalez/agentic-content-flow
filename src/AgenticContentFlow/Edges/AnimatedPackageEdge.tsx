/** @format */
import { BaseEdge, getSmoothStepPath, type EdgeProps } from '@xyflow/react';

export function AnimatedPackageEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
}: EdgeProps) {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Define a solid edge style
  const edgeStyle = {
    stroke: 'black',
    strokeWidth: 2,
    fill: 'none',
    animation: 'none',
    border: 'none',
  };

  return (
    <>
      <BaseEdge 
        id={id} 
        path={edgePath} 
        style={edgeStyle}
        markerEnd={markerEnd}
      />
      <svg
        style={{
          overflow: 'visible',
          position: 'absolute',
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        <path id={`path-${id}`} d={edgePath} style={{ visibility: 'hidden' }} />
        <g transform="translate(-10, -10)">
          <path
            d="m16.5 9.4-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z M3.29 7 12 12l8.71-5M12 22V12"
            fill="white"
            stroke="black"
            strokeWidth="2"
            strokeLinecap="butt"
            strokeLinejoin="miter"
          >
            <animateMotion
              dur="2s"
              repeatCount="indefinite"
              path={edgePath}
            />
          </path>
        </g>
      </svg>
    </>
  );
}