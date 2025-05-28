/** @format */
import React, { useState, useEffect } from 'react';
import { handleRegistry } from '../registry/handleTypeRegistry';
import { HandleTypeDefinition } from '../../types/handleTypes';

// Import node type icons
import ChartIcon from '@/components/icons/chart';
import { EyeIcon, DatabaseIcon, GitBranchIcon, FolderIcon, FileTextIcon } from 'lucide-react';

interface HandleSpeedDialProps {
  nodeType: string;
  handleDefinition: HandleTypeDefinition;
  onNodeTypeSelect?: (nodeType: string) => void;
}

// Icon mapping for different node types
const nodeTypeIcons = {
  'data': DatabaseIcon,
  'view': EyeIcon,
  'logic': GitBranchIcon,
  'container': FolderIcon,
  'page': FileTextIcon,
  'statistics': ChartIcon,
};

// Friendly names for node categories
const nodeTypeNames = {
  'data': 'Data Node',
  'view': 'View Node', 
  'logic': 'Logic Node',
  'container': 'Container Node',
  'page': 'Page Node',
  'statistics': 'Statistics Node',
};

// Calculate positions for dial items in a circle
const calculateDialPositions = (numItems: number, radius: number = 18) => {
  const positions = [];
  const angleStep = (2 * Math.PI) / numItems;
  
  for (let i = 0; i < numItems; i++) {
    const angle = i * angleStep - Math.PI/2; // Start from top
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    positions.push({ x, y });
  }
  
  return positions;
};

const HandleSpeedDial: React.FC<HandleSpeedDialProps> = ({ 
  nodeType, 
  handleDefinition, 
  onNodeTypeSelect 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const compatibleTargets = handleRegistry.getCompatibleTargets(nodeType, handleDefinition.position);
  

  // Only show speed dial for source handles with multiple compatible targets
  if (handleDefinition.type !== 'source' || compatibleTargets.length <= 1) {
    console.log('Speed dial not shown:', { nodeType, handleDefinition, compatibleTargets });
    return null;
  }

  // Show on hover
  useEffect(() => {
    const timer = setTimeout(() => setIsOpen(true), 150);
    return () => clearTimeout(timer);
  }, []);

  // Calculate positions for each dial item
  const positions = calculateDialPositions(compatibleTargets.length);

  // Calculate position based on handle position
  const getPositionStyle = () => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      zIndex: 2000,
      pointerEvents: 'none',
      width: '60px',
      height: '60px',
    };

    switch (handleDefinition.position) {
      case 'right':
        return {
          ...baseStyle,
          top: '50%',
          right: '-30px', // Position to the right of the node
          transform: 'translateY(-50%)',
        };
      case 'left':
        return {
          ...baseStyle,
          top: '50%',
          left: '-30px', // Position to the left of the node
          transform: 'translateY(-50%)',
        };
      case 'top':
        return {
          ...baseStyle,
          top: '-30px', // Position above the node
          left: '50%',
          transform: 'translateX(-50%)',
        };
      case 'bottom':
        return {
          ...baseStyle,
          bottom: '-30px', // Position below the node
          left: '50%',
          transform: 'translateX(-50%)',
        };
      default:
        return baseStyle;
    }
  };

  return (
    <div style={getPositionStyle()}>
      {/* Speed dial options */}
      {isOpen && compatibleTargets.map((targetCategory, index) => {
        const IconComponent = nodeTypeIcons[targetCategory as keyof typeof nodeTypeIcons];
        const nodeName = nodeTypeNames[targetCategory as keyof typeof nodeTypeNames] || targetCategory;
        
        
        if (!IconComponent) return null;
        
        // Position each item in a circle within the expanded handle
        const dialPos = positions[index];
        
        return (
          <button
            key={targetCategory}
            className="group absolute w-6 h-6 text-black hover:text-gray-600 rounded-full flex items-center justify-center pointer-events-auto hover:scale-125 transition-all duration-150"
            style={{
              left: `calc(50% + ${dialPos.x}px)`,
              top: `calc(50% + ${dialPos.y}px)`,
              transform: 'translate(-50%, -50%)',
              transitionDelay: `${index * 40}ms`,
              opacity: isOpen ? 1 : 0,
              scale: isOpen ? 1 : 0.3,
            }}
            onClick={() => {
              onNodeTypeSelect?.(targetCategory);
            }}
            title={`Connect to ${nodeName}`}
          >
            <IconComponent size={16} />
            
            {/* Tooltip */}
            <div className="absolute whitespace-nowrap bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10"
              style={{
                bottom: '100%',
                left: '50%', 
                transform: 'translateX(-50%)', 
                marginBottom: '8px'
              }}>
              {nodeName}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default HandleSpeedDial;