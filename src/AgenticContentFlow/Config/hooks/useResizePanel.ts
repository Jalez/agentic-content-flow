import { useState, useCallback, useEffect } from 'react';

type PanelPosition = 'top' | 'bottom' | 'left' | 'right';

interface UseResizePanelProps {
  position: PanelPosition;
  defaultSizes: Record<PanelPosition, { width: number; height: number }>;
}

export const useResizePanel = ({ position, defaultSizes }: UseResizePanelProps) => {
  const [size, setSize] = useState(defaultSizes[position]);
  const [isResizing, setIsResizing] = useState(false);

  // Reset size when position changes
  useEffect(() => {
    setSize(defaultSizes[position]);
  }, [position, defaultSizes]);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    const startX = e.clientX;
    const startY = e.clientY;
    const startSize = { ...size };
    
    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      let newSize = { ...startSize };
      
      switch (position) {
        case 'right':
          newSize.width = Math.max(300, Math.min(800, startSize.width - deltaX));
          break;
        case 'left':
          newSize.width = Math.max(300, Math.min(800, startSize.width + deltaX));
          break;
        case 'bottom':
          newSize.height = Math.max(200, Math.min(600, startSize.height - deltaY));
          break;
        case 'top':
          newSize.height = Math.max(200, Math.min(600, startSize.height + deltaY));
          break;
      }
      
      setSize(newSize);
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [size, position]);

  return {
    size,
    isResizing,
    handleResizeStart,
  };
};

export default useResizePanel;