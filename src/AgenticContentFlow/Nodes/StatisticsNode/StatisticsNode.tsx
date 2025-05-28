import React, { useState, useEffect } from 'react';
import { NodeProps } from '@xyflow/react';
import {
    NodeHeader,
    NodeHeaderMenuAction,
    NodeHeaderDeleteAction
} from '../common/NodeHeader';
import { useUpdateNodeInternals, useReactFlow } from '@xyflow/react';
import { LAYOUT_CONSTANTS } from '../../Layout/utils/layoutUtils';
import CornerResizer from '../common/CornerResizer';
import ConnectionHandles from '../common/ConnectionHandles';
import ExpandCollapseButton from '../common/ExpandCollapseButton';
import { colorByDepth } from '../common/utils/colorByDepth';

import { ArrowLeft } from 'lucide-react';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

// Import ChartIcon instead of BarChart3
import ChartIcon from '@/components/icons/chart';

/**
 * Statistics Node Component
 * 
 * Represents statistical analysis and metrics visualization.
 * Receives data from page nodes via left handle.
 * Displays analytics, metrics, and charts.
 */
export const StatisticsNode: React.FC<NodeProps> = ({ id, data, selected }) => {
    const updateNodeInternals = useUpdateNodeInternals();
    const { getNode } = useReactFlow();
    const nodeInFlow = getNode(id);
    const [isExpanded, setIsExpanded] = useState(nodeInFlow?.data.expanded || false);

    useEffect(() => {
        if (nodeInFlow) {
            setIsExpanded(Boolean(nodeInFlow.data?.expanded));
        }
    }, [nodeInFlow]);

    const nodeDepth = nodeInFlow?.data.depth || 0;
    const color = colorByDepth(nodeDepth as number);

    if (!nodeInFlow) {
        console.error(`Node with id ${id} not found in store.`);
        return null;
    }

    // Default dimensions for the container
    const collapsedDimensions = {
        width: 280,
        height: 80,
    };

    const expandedDimensions = {
        width: nodeInFlow?.width || 280,
        height: nodeInFlow?.height || 200,
    };

    // Type checking for data properties
    const nodeLabel = data?.label ? String(data.label) : 'Statistics';
    const metrics = data?.metrics ? String(data.metrics) : 'No metrics available';
    
    // Custom menu items for statistics operations
    const statisticsMenuItems = [
        <DropdownMenuItem key="export" onClick={() => console.log('Export statistics')}>
            Export Data
        </DropdownMenuItem>,
        <DropdownMenuItem key="refresh" onClick={() => console.log('Refresh statistics')}>
            Refresh Metrics
        </DropdownMenuItem>,
        <DropdownMenuItem key="configure" onClick={() => console.log('Configure charts')}>
            Configure Charts
        </DropdownMenuItem>
    ];

    return (
        <>
            <CornerResizer
                minHeight={LAYOUT_CONSTANTS.NODE_DEFAULT_HEIGHT}
                minWidth={LAYOUT_CONSTANTS.NODE_DEFAULT_WIDTH}
                nodeToResize={nodeInFlow}
                canResize={selected}
                color={color}
            />

            <div
                onTransitionEnd={() => updateNodeInternals(id)}
                className="w-full h-full flex flex-col select-none transition-[width,height] duration-200 ease-in-out border-2 border-gray-300 rounded-lg shadow-md"
                style={{
                    width: nodeInFlow?.width || collapsedDimensions.width,
                    height: nodeInFlow?.height || (isExpanded ? expandedDimensions.height : collapsedDimensions.height),
                    backgroundColor: color,
                    borderColor: selected ? '#3b82f6' : '#d1d5db',
                }}
            >
                {/* Connection handles - only left handle for receiving data */}
                <ConnectionHandles 
                    nodeType="statisticsnode"
                    color={color} 
                    icons={{
                        left: <ArrowLeft className="size-4" />,
                    }}
                />

                <NodeHeader className="dragHandle">
                    <ChartIcon
                        className={`
                            ${isExpanded ? 'relative w-6 h-6' : 'absolute w-12 h-12'} 
                            ${isExpanded ? '' : 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'}
                            stroke-slate-700
                        `}
                    />
                    <div className="flex-1 font-semibold relative text-ellipsis overflow-hidden whitespace-nowrap">
                        {nodeLabel}
                    </div>
                    <ExpandCollapseButton
                        collapsedDimensions={collapsedDimensions}
                        expandedDimensions={expandedDimensions}
                        nodeInFlow={nodeInFlow}
                    />
                    <NodeHeaderMenuAction label="Statistics Options">
                        {statisticsMenuItems}
                        <NodeHeaderDeleteAction />
                    </NodeHeaderMenuAction>
                </NodeHeader>

                {/* Content area - shown when expanded */}
                {isExpanded && data && (
                    <div className="flex-1 p-3 overflow-auto">
                        <div className="text-sm text-gray-700">
                            <p className="font-semibold">Metrics:</p>
                            <p>{metrics}</p>
                        </div>
                        </div>
                )}
            </div>
        </>
    );
};

export default StatisticsNode;