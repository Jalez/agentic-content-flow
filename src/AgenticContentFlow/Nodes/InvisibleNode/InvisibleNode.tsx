import React, { useEffect, useState, useRef } from 'react';
import { NodeProps, Node } from '@xyflow/react';
import { InvisibleNodeContainer } from './InvisibleNodeStyles';
import {
  NodeHeaderTitle,
  NodeHeaderActions,
  NodeHeaderMenuAction,
  NodeHeaderDeleteAction,
  NodeHeader
} from '../common/NodeHeader';
import { useUpdateNodeInternals, useReactFlow } from '@xyflow/react';
import { LAYOUT_CONSTANTS } from '../../Layout/utils/layoutUtils';
import ExpandCollapseButton from '../common/ExpandCollapseButton';
import CornerResizer from '../common/CornerResizer';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Grid } from 'lucide-react';

interface InvisibleNodeProps extends NodeProps {
  isExpanded?: boolean;
}

// Extended type that includes Node type and our custom data
type NodeFlowData = Node & {
  data: {
    expanded?: boolean;
  };
  width?: number;
  height?: number;
};

/**
 * Invisible Node Component
 * 
 * A container node that becomes invisible when expanded, showing only its children.
 * When collapsed or hovered, shows a standard node interface.
 */
export const InvisibleNode: React.FC<InvisibleNodeProps> = ({ id, data, selected }) => {
  const updateNodeInternals = useUpdateNodeInternals();
  const { getNode } = useReactFlow();
  const nodeInFlow = getNode(id) as NodeFlowData | null;
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isExpanded, setIsExpanded] = useState<boolean>(nodeInFlow?.data.expanded || false);

  useEffect(() => {
    if (nodeInFlow) {
      setIsExpanded(Boolean(nodeInFlow.data?.expanded));
    }
  }, [nodeInFlow]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      setIsHovered(inside);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const darkerColor = "#9c27b0"; // Purple color for invisible nodes
  const lighterColor = "transparent";

  const color = isExpanded ? lighterColor : darkerColor;

  if (!nodeInFlow) {
    console.error(`Node with id ${id} not found in store.`);
    return null;
  }

  // Default dimensions for the container
  const collapsedDimensions = {
    width: 300,
    height: 200,
  };

  const expandedDimensions = {
    width: nodeInFlow?.width || collapsedDimensions.width,
    height: nodeInFlow?.height || collapsedDimensions.height,
  };

  // Type checking for data properties
  const nodeLabel = data?.label ? String(data.label) : 'Container';

  return (
    <>
      <CornerResizer
        minHeight={LAYOUT_CONSTANTS.NODE_DEFAULT_HEIGHT}
        minWidth={LAYOUT_CONSTANTS.NODE_DEFAULT_WIDTH}
        nodeToResize={nodeInFlow}
        canResize={selected}
        color={color}
      />
      <InvisibleNodeContainer
        ref={containerRef}
        onTransitionEnd={() => updateNodeInternals(id)}
        selected={selected}
        color={color}
        isExpanded={isExpanded}
        isHovered={isHovered}
      >
        <div className="dragHandle">
          {(!isExpanded || isHovered) && (
            <>
                    <NodeHeader className="dragHandle">

              
              <Grid
                className={`
                  text-primary 
                  ${isExpanded ? 'relative size-6' : 'absolute size-16'} 
                  ${isExpanded ? '' : 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'}
                  `}
                  />

              <NodeHeaderTitle>{nodeLabel}</NodeHeaderTitle>
              <NodeHeaderActions>
                <ExpandCollapseButton
                  collapsedDimensions={collapsedDimensions}
                  expandedDimensions={expandedDimensions}
                  nodeInFlow={nodeInFlow}
                  />
                <NodeHeaderMenuAction label="Container Options">
                  <DropdownMenuItem onClick={() => console.log('Toggle visibility')}>
                    Toggle Container Visibility
                  </DropdownMenuItem>
                  <NodeHeaderDeleteAction />
                </NodeHeaderMenuAction>
              </NodeHeaderActions>
                  </NodeHeader>
            </>
          )}
        </div>
      </InvisibleNodeContainer>
    </>
  );
};

export default InvisibleNode;