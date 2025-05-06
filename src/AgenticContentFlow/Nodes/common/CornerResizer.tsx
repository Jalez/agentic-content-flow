import React, { useRef, useState } from 'react';
import { styled } from '@mui/material/styles';
import { NodeResizerProps, useUpdateNodeInternals } from '@xyflow/react';
import { useNodeHistoryState } from '../../Node/hooks/useNodeState';

// Define the styled corner elements with improved styling
const ResizerCorner = styled('div')<{ color: string, position: string, active: boolean }>(
  ({ color, position, active }) => ({
    position: 'absolute',
    width: '6px', // Even smaller for ultimate subtlety
    height: '6px',
    borderRadius: '0', // Square corners for a more precise look
    backgroundColor: 'transparent', // Start fully transparent
    border: active ? `2px solid ${color}` : '2px solid rgba(255,255,255,0.4)',
    opacity: 0, // Start invisible
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    zIndex: 10,
    cursor: `${position}-resize`,
    transformOrigin: 'center',
    
    // Position the corners slightly inset for a cleaner look
    ...(position === 'nw' && {
      top: '2px',
      left: '2px'
    }),
    ...(position === 'ne' && {
      top: '2px',
      right: '2px'
    }),
    ...(position === 'sw' && {
      bottom: '2px',
      left: '2px'
    }),
    ...(position === 'se' && {
      bottom: '2px',
      right: '2px'
    }),
    
    // Show corners on parent hover with a delay
    '.resizer-wrapper:hover &': {
      opacity: 0.5,
      backgroundColor: active ? color : 'rgba(255,255,255,0.9)',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1) 0.1s', // Add slight delay for smoother appearance
    },
    
    // Enhanced hover state
    '&:hover': {
      opacity: 1,
      backgroundColor: color,
      border: `2px solid ${color}`,
      transform: 'scale(1.2)',
      boxShadow: `0 0 3px 1px ${color}20`, // Subtle glow effect
    }
  })
);

interface CornerResizerProps extends Omit<NodeResizerProps, 'handleStyle' | 'lineStyle'> {
  color: string;
    minWidth?: number;
    minHeight?: number;
    nodeToResize: any;
    canResize: boolean;

}

// Custom resizer that only shows corners
export const CornerResizer: React.FC<CornerResizerProps> = ({ 
  color, 
  minWidth,
  nodeToResize,
  minHeight, 
  canResize,
  ...props 
}) => {
      const { updateNode } = useNodeHistoryState();
      const updateNodeInternals = useUpdateNodeInternals();
  const [activeCorner, setActiveCorner] = useState<string | null>(null);
  const resizerEl = useRef<HTMLDivElement>(null);


  const handleResize = (_: any, params: any) => {
    if (!nodeToResize) return;

    // Store new dimensions for both current state and future use
    const newWidth = params.width;
    const newHeight = params.height;

    // Only update expanded dimensions when in expanded state
    if (canResize) {
        updateNode({
            ...nodeToResize,
            data: {
                ...nodeToResize.data,
                expanded: true
            },
            width: newWidth,
            height: newHeight
        });

        // Force update of node internals to ensure proper rendering
        setTimeout(() => updateNodeInternals(nodeToResize.id), 10);
    }
};
  
  // Forward the mousedown event to the actual NodeResizer handle
  const handleMouseDown = (position: string, e: React.MouseEvent) => {
    setActiveCorner(position);
    // Find the corresponding handle in the NodeResizer and trigger its mousedown
    const handle = resizerEl.current?.querySelector(`[data-handle="${position}"]`);
    if (handle) {
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: e.clientX,
        clientY: e.clientY,
        bubbles: true
      });
      handle.dispatchEvent(mouseEvent);
    }
  };

  // Handle global mouseup to reset active state
  React.useEffect(() => {
    const handleMouseUp = () => setActiveCorner(null);
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);
  
  if (!canResize) {
    return null; // Don't render if resizing is not allowed
  }
  return (
    <div className="resizer-wrapper" ref={resizerEl}>
      {/* Custom corner handles */}
      <ResizerCorner
        color={color} 
        position="nw" 
        active={activeCorner === 'nw'}
        onMouseDown={(e) => handleMouseDown('nw', e)}
      />
      <ResizerCorner 
        color={color} 
        position="ne" 
        active={activeCorner === 'ne'}
        onMouseDown={(e) => handleMouseDown('ne', e)}
      />
      <ResizerCorner 
        color={color} 
        position="sw" 
        active={activeCorner === 'sw'}
        onMouseDown={(e) => handleMouseDown('sw', e)}
      />
      <ResizerCorner 
        color={color} 
        position="se" 
        active={activeCorner === 'se'}
        onMouseDown={(e) => handleMouseDown('se', e)}
      />
      
    </div>
  );
};

export default CornerResizer;