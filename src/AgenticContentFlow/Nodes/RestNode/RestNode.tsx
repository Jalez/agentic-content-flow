import React from 'react';
import { NodeProps } from '@xyflow/react';
import { useReactFlow, useUpdateNodeInternals } from '@xyflow/react';
import ConnectionHandles from '../common/ConnectionHandles';
import { NodeHeader, NodeHeaderMenuAction, NodeHeaderDeleteAction } from '../common/NodeHeader';
import CornerResizer from '../common/CornerResizer';
import { colorByDepth } from '../common/utils/colorByDepth';
import { Globe2 } from 'lucide-react';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

/**
 * REST Node Component
 * 
 * Represents a REST API endpoint configuration and execution.
 * Non-collapsible node that shows HTTP method prominently.
 */
export const RestNode: React.FC<NodeProps> = ({ id, data, selected }) => {
    const { getNode } = useReactFlow();
    const updateNodeInternals = useUpdateNodeInternals();
    const nodeInFlow = getNode(id);

    const nodeDepth = nodeInFlow?.data.depth || 0;
    const color = colorByDepth(nodeDepth as number);

    if (!nodeInFlow) {
        console.error(`Node with id ${id} not found in store.`);
        return null;
    }

    // Fixed dimensions - no collapse/expand functionality
    const nodeDimensions = {
        width: 280,
        height: 120,
    };

    // Type-safe data extraction
    const nodeLabel = typeof data?.label === 'string' ? data.label : 'REST API';
    const method = typeof data?.method === 'string' ? data.method : 'GET';
    const url = typeof data?.url === 'string' ? data.url : '';
    const details = typeof data?.details === 'string' ? data.details : '';

    // Custom menu items for REST operations
    const restNodeMenuItems = [
        <DropdownMenuItem key="test" onClick={() => console.log('Test API')}>
            Test Connection
        </DropdownMenuItem>,
        <DropdownMenuItem key="configure" onClick={() => console.log('Configure API')}>
            Configure API
        </DropdownMenuItem>,
        <DropdownMenuItem key="history" onClick={() => console.log('View history')}>
            View History
        </DropdownMenuItem>
    ];

    return (
        <>
            <CornerResizer
                minHeight={nodeDimensions.height}
                minWidth={nodeDimensions.width}
                nodeToResize={nodeInFlow}
                canResize={selected}
                color={color}
            />

            <div 
                onTransitionEnd={() => updateNodeInternals(id)}
                className="w-full h-full flex flex-col select-none transition-[width,height] duration-200 ease-in-out border-2 border-gray-300 rounded-lg shadow-md"
                style={{
                    width: nodeInFlow?.width || nodeDimensions.width,
                    height: nodeInFlow?.height || nodeDimensions.height,
                    backgroundColor: color,
                    borderColor: selected ? '#3b82f6' : '#d1d5db',
                }}
            >
                <ConnectionHandles 
                    nodeType="restnode"
                    color={color}
                />

                <NodeHeader className="dragHandle">
                    <Globe2 className="w-5 h-5 stroke-slate-700" />
                    <div className="flex-1 font-semibold relative text-ellipsis overflow-hidden whitespace-nowrap">
                        {nodeLabel}
                    </div>
                    <NodeHeaderMenuAction label="REST API Options">
                        {restNodeMenuItems}
                        <NodeHeaderDeleteAction />
                    </NodeHeaderMenuAction>
                </NodeHeader>

                {/* Main content area - always visible */}
                <div className="flex-1 p-3 flex flex-col justify-center">
                    <div className="text-center">
                        {/* Prominent HTTP method display */}
                        <div className="text-2xl font-bold text-blue-600 mb-2">
                            {method}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default RestNode;