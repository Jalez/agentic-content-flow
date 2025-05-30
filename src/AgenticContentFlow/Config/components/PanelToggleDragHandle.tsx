import React, { useRef, useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, GripVertical, GripHorizontal } from 'lucide-react';

type PanelPosition = 'top' | 'bottom' | 'left' | 'right';

interface PanelToggleDragHandleProps {
  isExpanded: boolean;
  position: PanelPosition;
  size: { width: number; height: number };
  hasChanges: boolean;
  onToggle: () => void;
  onResizeStart: (e: React.MouseEvent) => void;
}

export const PanelToggleDragHandle: React.FC<PanelToggleDragHandleProps> = ({
  isExpanded,
  position,
  size,
  hasChanges,
  onToggle,
  onResizeStart,
}) => {
  const handleRef = useRef<HTMLButtonElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartTime = useRef<number>(0);

  const getToggleIcon = () => {
    if (!isExpanded) {
      switch (position) {
        case 'top': return <ChevronDown className="w-3 h-3" />;
        case 'bottom': return <ChevronUp className="w-3 h-3" />;
        case 'left': return <ChevronRight className="w-3 h-3" />;
        case 'right': return <ChevronLeft className="w-3 h-3" />;
      }
    } else {
      switch (position) {
        case 'top': return <ChevronUp className="w-3 h-3" />;
        case 'bottom': return <ChevronDown className="w-3 h-3" />;
        case 'left': return <ChevronLeft className="w-3 h-3" />;
        case 'right': return <ChevronRight className="w-3 h-3" />;
      }
    }
  };

  const getGripIcon = () => {
    return position === 'top' || position === 'bottom' ? 
      <GripHorizontal className="w-3 h-3 opacity-50" /> : 
      <GripVertical className="w-3 h-3 opacity-50" />;
  };

  const getButtonStyles = () => {
    const baseStyle = {
      position: 'fixed' as const,
      zIndex: 50,
      transition: isDragging ? 'none' : 'all 0.3s ease-in-out',
      background: 'var(--background)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '4px',
      cursor: isExpanded ? (position === 'top' || position === 'bottom' ? 'ns-resize' : 'ew-resize') : 'pointer',
    };

    switch (position) {
      case 'top':
        return {
          ...baseStyle,
          top: isExpanded ? `${size.height}px` : '0px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80px',
          height: '28px',
          borderBottomLeftRadius: '8px',
          borderBottomRightRadius: '8px',
          borderTopLeftRadius: '0px',
          borderTopRightRadius: '0px',
          borderTop: 'none',
          flexDirection: 'row' as const,
        };
      case 'bottom':
        return {
          ...baseStyle,
          bottom: isExpanded ? `${size.height}px` : '0px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80px',
          height: '28px',
          borderTopLeftRadius: '8px',
          borderTopRightRadius: '8px',
          borderBottomLeftRadius: '0px',
          borderBottomRightRadius: '0px',
          borderBottom: 'none',
          flexDirection: 'row' as const,
        };
      case 'left':
        return {
          ...baseStyle,
          left: isExpanded ? `${size.width}px` : '0px',
          top: '16px',
          width: '28px',
          height: '80px',
          borderTopRightRadius: '8px',
          borderBottomRightRadius: '8px',
          borderTopLeftRadius: '0px',
          borderBottomLeftRadius: '0px',
          borderLeft: 'none',
          flexDirection: 'column' as const,
        };
      case 'right':
      default:
        return {
          ...baseStyle,
          right: isExpanded ? `${size.width}px` : '0px',
          top: '16px',
          width: '28px',
          height: '80px',
          borderTopLeftRadius: '8px',
          borderBottomLeftRadius: '8px',
          borderTopRightRadius: '0px',
          borderBottomRightRadius: '0px',
          borderRight: 'none',
          flexDirection: 'column' as const,
        };
    }
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragStartTime.current = Date.now();
    
    if (isExpanded) {
      setIsDragging(true);
      onResizeStart(e);
      
      // Listen for mouse up to detect if this was a drag or click
      const handleMouseUp = () => {
        setIsDragging(false);
        const dragDuration = Date.now() - dragStartTime.current;
        
        // If the mouse was down for less than 200ms, treat it as a click
        if (dragDuration < 200) {
          onToggle();
        }
        
        document.removeEventListener('mouseup', handleMouseUp);
      };
      
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      // Panel is collapsed, just toggle it open
      onToggle();
    }
  }, [isExpanded, onToggle, onResizeStart]);

  return (
    <>
      <Button
        ref={handleRef}
        variant="outline"
        size="sm"
        onMouseDown={handleMouseDown}
        className=" border-none select-none"
        style={getButtonStyles()}
        title={isExpanded ? 'Drag to resize or click to close' : 'Click to open panel'}
      >
        {getToggleIcon()}
        {isExpanded && getGripIcon()}
      </Button>

      {/* Change Indicator for Collapsed State */}
      {!isExpanded && hasChanges && (
        <div 
          className="fixed w-2 h-2 bg-amber-400 rounded-full z-50 transition-opacity duration-300"
          style={{ 
            ...(() => {
              switch (position) {
                case 'top': return { top: '32px', left: '50%', transform: 'translateX(-50%)' };
                case 'bottom': return { bottom: '32px', left: '50%', transform: 'translateX(-50%)' };
                case 'left': return { left: '32px', top: '50px' };
                case 'right': return { right: '32px', top: '50px' };
              }
            })(),
            pointerEvents: 'none' 
          }}
        />
      )}
    </>
  );
};

export default PanelToggleDragHandle;