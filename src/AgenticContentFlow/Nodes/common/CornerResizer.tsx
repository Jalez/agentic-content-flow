import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import { NodeResizer, NodeResizerProps } from '@xyflow/react';

// Define the styled corner elements
// These will be positioned in each corner of the node
const ResizerCorner = styled('div')<{ color: string, position: string, active: boolean }>(
  ({ theme, color, position, active }) => ({
    position: 'absolute',
    width: '12px',
    height: '12px',
    borderRadius: '2px',
    backgroundColor: active ? color : 'rgba(255,255,255,0.6)',
    opacity: active ? 0.8 : 0.4,
    boxShadow: active ? '0 0 0 1px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.2)' : '0 0 0 1px rgba(0,0,0,0.1)',
    transition: 'all 0.2s ease',
    zIndex: 10,
    cursor: `${position}-resize`,
    
    // Position in the four corners
    ...(position === 'nw' && {
      top: '-6px',
      left: '-6px'
    }),
    ...(position === 'ne' && {
      top: '-6px',
      right: '-6px'
    }),
    ...(position === 'sw' && {
      bottom: '-6px',
      left: '-6px'
    }),
    ...(position === 'se' && {
      bottom: '-6px',
      right: '-6px'
    }),
    
    '&:hover': {
      backgroundColor: color,
      opacity: 1,
      transform: 'scale(1.2)',
    }
  })
);

interface CornerResizerProps extends Omit<NodeResizerProps, 'handleStyle' | 'lineStyle'> {
  color: string;
}

// Custom resizer that only shows corners
export const CornerResizer: React.FC<CornerResizerProps> = ({ 
  color, 
  minWidth, 
  minHeight, 
  onResize,
  ...props 
}) => {
  const [activeCorner, setActiveCorner] = useState<string | null>(null);
  
  // We'll still use the original NodeResizer but make it invisible
  // This gives us the resize behavior while we show our custom corners
  return (
    <>
      {/* Custom corner handles */}
      <ResizerCorner
        color={color} 
        position="nw" 
        active={activeCorner === 'nw'}
        onMouseDown={() => setActiveCorner('nw')}
        onMouseUp={() => setActiveCorner(null)}
      />
      <ResizerCorner 
        color={color} 
        position="ne" 
        active={activeCorner === 'ne'}
        onMouseDown={() => setActiveCorner('ne')}
        onMouseUp={() => setActiveCorner(null)}
      />
      <ResizerCorner 
        color={color} 
        position="sw" 
        active={activeCorner === 'sw'}
        onMouseDown={() => setActiveCorner('sw')}
        onMouseUp={() => setActiveCorner(null)}
      />
      <ResizerCorner 
        color={color} 
        position="se" 
        active={activeCorner === 'se'}
        onMouseDown={() => setActiveCorner('se')}
        onMouseUp={() => setActiveCorner(null)}
      />
      
      {/* Invisible NodeResizer that provides the actual functionality */}
      <NodeResizer
        minWidth={minWidth}
        minHeight={minHeight}
        onResize={onResize}
        handleStyle={{ opacity: 0 }}  // Make handles invisible
        lineStyle={{ opacity: 0 }}    // Make lines invisible
        isVisible={true}
        {...props}
      />
    </>
  );
};

export default CornerResizer;