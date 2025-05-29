/** @format */
import { forwardRef, useMemo, useState, useRef, useEffect } from "react";
import { BaseHandle, BaseHandleProps } from "@/components/base-handle";
import { HandleTypeDefinition } from "../../types/handleTypes";
import { handleRegistry } from "../registry/handleTypeRegistry";
import { Position, HandleType } from "@xyflow/react";

// Import icon components
import { PackageIcon } from "@/components/icons/package";
import ChartIcon from "@/components/icons/chart";
import { ChevronDownIcon, LinkIcon } from "lucide-react";
import HandleSpeedDial from "./HandleSpeedDial";

export interface TypedHandleProps extends Omit<BaseHandleProps, 'position' | 'id' | 'type'> {
  nodeType: string;
  handleDefinition: HandleTypeDefinition;
  nodeBackgroundColor?: string; // New prop for node's background color
  onConnectionAttempt?: (isValid: boolean, targetType?: string) => void;
  // Speed dial configuration props
  speedDialRadius?: number; // Distance of speed dial buttons from center
  speedDialButtonSize?: number; // Size of each speed dial button
  speedDialIconSize?: number; // Size of icons within speed dial buttons
  speedDialArcSpan?: number; // Arc span in degrees for speed dial layout
}

// Icon mapping - added ChartIcon
const iconMap = {
  'package': PackageIcon,
  'arrow-down': ChevronDownIcon,
  'link': LinkIcon,
  'chart': ChartIcon,
};

// Position mapping for react flow
const positionMap = {
  'top': Position.Top,
  'bottom': Position.Bottom,
  'left': Position.Left,
  'right': Position.Right,
};

// Handle type mapping - convert our "both" type to React Flow compatible types
const getReactFlowHandleType = (handleType: 'source' | 'target' | 'both'): HandleType => {
  if (handleType === 'both') {
    return 'source'; // Default to source for "both" types, could be made configurable
  }
  return handleType as HandleType;
};

export const TypedHandle = forwardRef<HTMLDivElement, TypedHandleProps>(
  ({ 
    nodeType, 
    handleDefinition, 
    nodeBackgroundColor, 
    onConnectionAttempt, 
    speedDialRadius,
    speedDialButtonSize,
    speedDialIconSize,
    speedDialArcSpan,
    style = {}, 
    ...props 
  }, ref) => {
    
    const [isHovered, setIsHovered] = useState(false);
    const handleRef = useRef<HTMLDivElement>(null);
    
    // Use similar hover logic as InvisibleNode - track mouse position globally
    useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
        if (!handleRef.current) return;
        const rect = handleRef.current.getBoundingClientRect();
        
        // Expand the hover area to include the speed dial
        const expandedRect = {
          left: rect.left - 30,
          right: rect.right + 30,
          top: rect.top - 30,
          bottom: rect.bottom + 30
        };
        
        const inside =
          e.clientX >= expandedRect.left &&
          e.clientX <= expandedRect.right &&
          e.clientY >= expandedRect.top &&
          e.clientY <= expandedRect.bottom;
        setIsHovered(inside);
      };
      
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);
    
    // Get the icon component
    const IconComponent = handleDefinition.icon ? iconMap[handleDefinition.icon as keyof typeof iconMap] : null;
    
    // Merge handle definition styles with passed styles
    const handleStyle = useMemo(() => {
      const baseStyle = { ...style } as Record<string, any>;
      
      // Use node background color if provided, otherwise fall back to handle definition color
      const backgroundColor = nodeBackgroundColor || handleDefinition.color;
      
      if (backgroundColor) {
        baseStyle.backgroundColor = backgroundColor;
        baseStyle['--handle-color'] = backgroundColor; // CSS custom property
      }
      
      if (isHovered) {
        // Use CSS pseudo-elements or box-shadow to create visual expansion
        // without changing the actual element dimensions
        // Create a larger visual appearance using multiple box shadows
        // Make the shadows more opaque and solid to look like the element itself
        baseStyle.boxShadow = "none"
        // Use separate border properties to avoid conflicts
        baseStyle.borderWidth = '2px';
        baseStyle.borderStyle = 'solid';
        baseStyle.borderColor = 'black';

        //baseStyle.borderColor = backgroundColor;
      } else {
        // Reset effects when not hovered
        baseStyle.boxShadow = 'none';
        baseStyle.borderWidth = '2px';
        baseStyle.borderStyle = 'solid';
        baseStyle.borderColor = 'black';
      }
      
      return baseStyle;
    }, [style, handleDefinition.color, nodeBackgroundColor, isHovered]);

    // Get compatible target categories for this handle
    const compatibleTargets = useMemo(() => {
      return handleRegistry.getCompatibleTargets(nodeType, handleDefinition.position);
    }, [nodeType, handleDefinition.position]);

    // Only show speed dial for source handles that can connect to multiple types
    const showSpeedDial = handleDefinition.type === 'source' && compatibleTargets.length > 1;

    return (
      <>
        <BaseHandle
          ref={(node) => {
            handleRef.current = node;
            if (typeof ref === 'function') {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
          }}
          {...props}
          type={getReactFlowHandleType(handleDefinition.type)}
          position={positionMap[handleDefinition.position]}
          id={handleDefinition.position}
          style={{
            ...handleStyle,
            transition: 'all 300ms ease',
          }}
          title={`${handleDefinition.dataFlow} flow - connects to: ${compatibleTargets.join(', ')}`}
        >
          {IconComponent && (
            <div className="w-3.5 h-3.5 flex items-center justify-center text-black">
              <IconComponent size={14} />
            </div>
          )}
        </BaseHandle>

        {/* Speed Dial for compatible node types - positioned as sibling */}
        {showSpeedDial && isHovered && (
          <HandleSpeedDial
            nodeType={nodeType}
            handleDefinition={handleDefinition}
            radius={speedDialRadius}
            buttonSize={speedDialButtonSize}
            iconSize={speedDialIconSize}
            arcSpan={speedDialArcSpan}
            onNodeTypeSelect={(nodeType) => {
              console.log(`Selected to connect to: ${nodeType}`);
              // Here you could trigger node creation or highlight compatible nodes
            }}
          />
        )}
      </>
    );
  },
);

TypedHandle.displayName = "TypedHandle";