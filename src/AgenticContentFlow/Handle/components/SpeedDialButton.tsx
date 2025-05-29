import ChartIcon from '@/components/icons/chart';
import { EyeIcon, DatabaseIcon, GitBranchIcon, FolderIcon, FileTextIcon } from 'lucide-react';
import { useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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



export const SpeedDialButton: React.FC<
    {
        targetCategory: string;
        index: number;
        positions: { x: number; y: number }[];
        isOpen: boolean;
        onNodeTypeSelect?: (nodeType: string) => void;
        buttonSize: number;
        iconSize: number;
    }
> = ({
    targetCategory,
    index,
    positions,
    isOpen,
    onNodeTypeSelect,
    buttonSize = 32, // Default button size in pixels
    iconSize = 18, // Default icon size
}) => {
        const IconComponent = nodeTypeIcons[targetCategory as keyof typeof nodeTypeIcons];
        const nodeName = nodeTypeNames[targetCategory as keyof typeof nodeTypeNames] || targetCategory;

        if (!IconComponent) return null;

        // Position each item using the calculated positions focused around handle direction
        const dialPos = positions[index];

        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            key={targetCategory}
                            className="group absolute text-black hover:text-gray-600 rounded-full flex items-center justify-center pointer-events-auto hover:scale-110 transition-all duration-150"
                            style={{
                                width: `${buttonSize}px`,
                                height: `${buttonSize}px`,
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
                        >
                            <IconComponent size={iconSize} />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{nodeName}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }
