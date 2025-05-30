import React from 'react';

type PanelPosition = 'top' | 'bottom' | 'left' | 'right';

interface PanelContainerProps {
  isExpanded: boolean;
  position: PanelPosition;
  size: { width: number; height: number };
  isResizing: boolean;
  children: React.ReactNode;
}

export const PanelContainer: React.FC<PanelContainerProps> = ({
  isExpanded,
  position,
  size,
  isResizing,
  children,
}) => {
  const getPositionStyles = () => {
    const baseStyle = {
      position: 'fixed' as const,
      backgroundColor: 'var(--background)',
      borderColor: 'var(--border)',
      zIndex: 40,
      transition: isResizing ? 'none' : 'all 0.3s ease-in-out',
      boxShadow: isExpanded ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none',
    };

    switch (position) {
      case 'top':
        return {
          ...baseStyle,
          top: 0,
          left: 0,
          right: 0,
          height: isExpanded ? `${size.height}px` : '0px',
          overflow: 'hidden' as const,
        };
      case 'bottom':
        return {
          ...baseStyle,
          bottom: 0,
          left: 0,
          right: 0,
          height: isExpanded ? `${size.height}px` : '0px',
          overflow: 'hidden' as const,
        };
      case 'left':
        return {
          ...baseStyle,
          top: 0,
          left: 0,
          bottom: 0,
          width: isExpanded ? `${size.width}px` : '0px',
          overflow: 'hidden' as const,
        };
      case 'right':
      default:
        return {
          ...baseStyle,
          top: 0,
          right: 0,
          bottom: 0,
          width: isExpanded ? `${size.width}px` : '0px',
          overflow: 'hidden' as const,
        };
    }
  };

  return (
    <div style={getPositionStyles()}>
      <div 
        className={`h-full w-full transition-opacity duration-300 ${
          isExpanded ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {children}
      </div>
    </div>
  );
};

export default PanelContainer;