/** @format */
import React, { useState, useEffect } from 'react';
import { handleRegistry } from '../registry/handleTypeRegistry';
import { HandleTypeDefinition } from '../../types/handleTypes';

// Import node type icons

import { SpeedDialButton } from './SpeedDialButton';

interface HandleSpeedDialProps {
    nodeType: string;
    handleDefinition: HandleTypeDefinition;
    onNodeTypeSelect?: (nodeType: string) => void;
    // Configurable parameters for fine-tuning
    radius?: number; // Distance from center
    buttonSize?: number; // Size of each speed dial button
    iconSize?: number; // Size of the icon within each button
    arcSpan?: number; // Arc span in degrees (90 = quarter circle)
}


// Calculate positions for dial items focused around the handle direction
const calculateDialPositions = (numItems: number, handlePosition: string, radius: number = 32, arcSpanDegrees: number = 90) => {
    const positions = [];

    // Convert degrees to radians
    const arcSpan = (arcSpanDegrees * Math.PI) / 180;

    // Calculate starting angle based on handle position - position on OPPOSITE side
    let centerAngle;
    switch (handlePosition) {
        case 'right':
            centerAngle = Math.PI; // Point left (opposite of right)
            break;
        case 'left':
            centerAngle = 0; // Point right (opposite of left)
            break;
        case 'top':
            centerAngle = Math.PI / 2; // Point down (opposite of up)
            break;
        case 'bottom':
            centerAngle = -Math.PI / 2; // Point up (opposite of down)
            break;
        default:
            centerAngle = Math.PI; // Default to left
    }

    // Calculate starting angle for the arc
    const startAngle = centerAngle - arcSpan / 2;

    // If only one item, place it directly in the center direction
    if (numItems === 1) {
        const x = radius * Math.cos(centerAngle);
        const y = radius * Math.sin(centerAngle);
        positions.push({ x, y });
        return positions;
    }

    // For multiple items, distribute them along the arc
    const angleStep = arcSpan / (numItems - 1);

    for (let i = 0; i < numItems; i++) {
        const angle = startAngle + (i * angleStep);
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        positions.push({ x, y });
    }

    return positions;
};

const HandleSpeedDial: React.FC<HandleSpeedDialProps> = ({
    nodeType,
    handleDefinition,
    onNodeTypeSelect,
    radius = 30, // Increased default radius for more spacing
    buttonSize = 20, // Increased default button size (in pixels)
    iconSize = 20, // Increased default icon size
    arcSpan = 100, // Default arc span in degrees
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
    const positions = calculateDialPositions(compatibleTargets.length, handleDefinition.position, radius, arcSpan);

    // Calculate position based on handle position
    const getPositionStyle = () => {
        const containerSize = Math.max(buttonSize * 3, 80); // Ensure container is large enough
        const baseStyle: React.CSSProperties = {
            position: 'absolute',
            pointerEvents: 'none',
            width: `${containerSize}px`,
            height: `${containerSize}px`,
        };

        const offset = containerSize / 2;

        switch (handleDefinition.position) {
            case 'right':
                return {
                    ...baseStyle,
                    top: '50%',
                    right: `-${offset}px`,
                    transform: 'translateY(-50%)',
                };
            case 'left':
                return {
                    ...baseStyle,
                    top: '50%',
                    left: `-${offset}px`,
                    transform: 'translateY(-50%)',
                };
            case 'top':
                return {
                    ...baseStyle,
                    top: `-${offset}px`,
                    left: '50%',
                    transform: 'translateX(-50%)',
                };
            case 'bottom':
                return {
                    ...baseStyle,
                    bottom: `-${offset}px`,
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
                return (
                    <SpeedDialButton
                        key={targetCategory}
                        targetCategory={targetCategory}
                        index={index}
                        positions={positions}
                        isOpen={isOpen}
                        onNodeTypeSelect={onNodeTypeSelect}
                        buttonSize={buttonSize}
                        iconSize={iconSize}
                    />
                );
            })}
        </div>
    );
};

export default HandleSpeedDial;

