import React from 'react';
import { NodeProps } from '@xyflow/react';
import { useReactFlow, useUpdateNodeInternals } from '@xyflow/react';
import ConnectionHandles from '../common/ConnectionHandles';
import { NodeHeader, NodeHeaderMenuAction, NodeHeaderDeleteAction } from '../common/NodeHeader';
import CornerResizer from '../common/CornerResizer';
import { Globe2 } from 'lucide-react';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Local utilities and components
import { getUrlParts } from './utils/urlUtils';
import { getMethodColor } from './utils/methodUtils';
import { useFavicon } from './hooks/useFavicon';
import { DomainIcon } from './components/DomainIcon';

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

    const color = "white"; // colorByDepth(nodeDepth);

    // Type-safe data extraction
    const nodeLabel = typeof data?.label === 'string' ? data.label : 'REST API';
    const method = typeof data?.method === 'string' ? data.method : 'GET';
    const url = typeof data?.url === 'string' ? data.url : '';
    const lastResponse = data?.lastResponse as { status?: number } | undefined;

    // Extract URL parts and load favicon
    const { domain, pathWithQuery } = getUrlParts(url);
    const favicon = useFavicon(domain);

    if (!nodeInFlow) {
        console.error(`Node with id ${id} not found in store.`);
        return null;
    }

    // Square dimensions
    const nodeDimensions = {
        width: 200,
        height: 200,
    };

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

    const methodColor = getMethodColor(method);

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
                className={cn(
                    "w-full h-full flex flex-col select-none transition-all duration-200 ease-in-out",
                    "rounded-lg shadow-lg overflow-hidden",
                    "bg-white border-2",
                    selected ? "border-blue-500" : "border-gray-200"
                )}
                style={{
                    width: nodeInFlow?.width || nodeDimensions.width,
                    height: nodeInFlow?.height || nodeDimensions.height,
                }}
            >
                <ConnectionHandles 
                    nodeType="restnode"
                    color={color}
                />

                <NodeHeader className={cn("dragHandle", "bg-gradient-to-r from-slate-50 to-slate-100")}>
                    <Globe2 className="w-4 h-4 stroke-slate-700" />
                    <div className="flex-1 font-semibold relative text-ellipsis overflow-hidden whitespace-nowrap">
                        {nodeLabel}
                    </div>
                    <Badge variant="outline" className={cn("text-xs px-2 py-1 font-mono", methodColor)}>
                        {method}
                    </Badge>
                    <NodeHeaderMenuAction label="REST API Options">
                        {restNodeMenuItems}
                        <NodeHeaderDeleteAction />
                    </NodeHeaderMenuAction>
                </NodeHeader>

                <div className="flex-1 flex flex-col items-center justify-center p-4 gap-3">
                    {/* Large Domain Icon */}
                    <div className="flex items-center justify-center">
                        <DomainIcon domain={domain} favicon={favicon} />
                    </div>
                    
                    {/* Path with Query */}
                    <div className="text-center text-sm font-mono text-slate-700 leading-relaxed px-2">
                        {pathWithQuery || 'No endpoint configured'}
                    </div>
                    
                    {/* Status */}
                    {lastResponse && (
                        <div className="text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded">
                            Status: {lastResponse.status || 'N/A'}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default RestNode;