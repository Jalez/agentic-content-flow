import React from 'react';
import { NodeProps, useReactFlow } from '@xyflow/react';
import { GitFork } from 'lucide-react';
import { colorByDepth } from '../common/utils/colorByDepth';
import ConnectionHandles from '../common/ConnectionHandles';

/**
 * ConditionalNode Component
 * 
 * A node with a circular icon display and text label below, representing a condition.
 * Has three handles:
 * - Input at the top
 * - "True" output at the bottom
 * - "False" output at the right
 */
export const ConditionalNode: React.FC<NodeProps> = ({
  width,
  height,
  selected,
  id
}) => {
  const { getNode } = useReactFlow();
  const nodeInFlow = getNode(id);
  const nodeDepth = nodeInFlow?.data.depth || 0;
  const color = colorByDepth(nodeDepth as number);

  const circleSize = height || width || 100; // Default size if not provided
  return (
      <div
        className={`
          relative flex items-center justify-center
          rounded-full shadow-[3px_-1px_black]
        `}
        style={{
          width: circleSize,
          height: circleSize,
          backgroundColor: color,
          borderColor: selected ? 'black' : color,
          borderWidth: "2px",
        }}
      >
        <ConnectionHandles
          color={color}
        />
        <GitFork 
          style={{ 
            color: "black",
            transform: "rotate(90deg)"
          }} 
          size={circleSize * 0.4} 
        />
      </div>
  );
};

export default ConditionalNode;