import React, { useRef, useState } from 'react';
import { NodeResizerProps } from '@xyflow/react';
import { cn } from '@/lib/utils';

interface CornerProps {
  color: string;
  position: 'nw' | 'ne' | 'sw' | 'se';
  active: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
}

const ResizerCorner: React.FC<CornerProps> = ({
  color,
  position,
  active,
  onMouseDown
}) => {
  const positionClasses = {
    'nw': 'top-0.5 left-0.5',
    'ne': 'top-0.5 right-0.5',
    'sw': 'bottom-0.5 left-0.5',
    'se': 'bottom-0.5 right-0.5'
  };

  const cursorClasses = {
    'nw': 'cursor-nw-resize',
    'ne': 'cursor-ne-resize',
    'sw': 'cursor-sw-resize',
    'se': 'cursor-se-resize'
  };

  return (
    <div
      onMouseDown={onMouseDown}
      className={cn(
        'absolute w-1.5 h-1.5 z-10',
        'opacity-0 transition-all duration-200 ease-in-out',
        'group-hover:opacity-50 group-hover:bg-white/90',
        'hover:opacity-100 hover:scale-110 hover:shadow',
        positionClasses[position],
        cursorClasses[position]
      )}
      style={{
        backgroundColor: active ? color : 'transparent',
        border: active ? `2px solid ${color}` : '2px solid rgba(255,255,255,0.4)',
        boxShadow: `0 0 3px 1px ${color}20`
      }}
    />
  );
};

interface CornerResizerProps extends Omit<NodeResizerProps, 'handleStyle' | 'lineStyle'> {
  color: string;
  minWidth?: number;
  minHeight?: number;
  nodeToResize: any;
  canResize: boolean;
}

export const CornerResizer: React.FC<CornerResizerProps> = ({ 
  color, 
  canResize
}) => {
  const [activeCorner, setActiveCorner] = useState<string | null>(null);
  const resizerEl = useRef<HTMLDivElement>(null);
  
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
    <div className="group relative" ref={resizerEl}>
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