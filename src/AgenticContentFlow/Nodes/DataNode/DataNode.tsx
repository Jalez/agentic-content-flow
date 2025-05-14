import React, { useState, useEffect } from 'react';
import { NodeProps } from '@xyflow/react';
import { DataNodeContainer } from './DataNodeStyles';
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

// Replace MUI icons with Lucide icons
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

// Components that might need conversion but are used as-is for now
import CircleStackIcon from '@/components/icons/circle-stack';

/**
 * Data Node Component
 * 
 * Represents a data source or repository in a flow diagram.
 * Has a distinctive folder appearance.
 * Accepts data primarily from left side, produces data primarily to right side.
 * Also maintains top/bottom connections for sibling/conditional communication.
 */
export const DataNode: React.FC<NodeProps> = ({ id, data, selected }) => {
    const updateNodeInternals = useUpdateNodeInternals();
    const { getNode } = useReactFlow();
    const nodeInFlow = getNode(id);
    const [isExpanded, setIsExpanded] = useState(nodeInFlow?.data.expanded || false);

    useEffect(() => {
        if (nodeInFlow) {
            setIsExpanded(Boolean(nodeInFlow.data?.expanded));
        }
    }
        , [nodeInFlow]);


    const nodeDepth = nodeInFlow?.data.depth || 0;
    const color = colorByDepth(nodeDepth as number);

    if (!nodeInFlow) {
        console.error(`Node with id ${id} not found in store.`);
        return null;
    }

    // Default dimensions for the container
    const collapsedDimensions = {
        width: 300,
        height: 60,
    };

    const expandedDimensions = {
        width: nodeInFlow?.width || 300,
        height: nodeInFlow?.height || 300,
    };


    // Type checking for data properties
    const nodeLabel = data?.label ? String(data.label) : 'Files';
    // Custom menu items for file operations
    const fileNodeMenuItems = [
        <DropdownMenuItem key="open" onClick={() => console.log('Open file')}>
            Open File
        </DropdownMenuItem>,
        <DropdownMenuItem key="download" onClick={() => console.log('Download file')}>
            Download
        </DropdownMenuItem>,
        <DropdownMenuItem key="share" onClick={() => console.log('Share file')}>
            Share
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

            <DataNodeContainer
                onTransitionEnd={() => updateNodeInternals(id)}
                selected={selected}
                color={color}
                isCollapsed={!isExpanded}
                className="w-full h-full flex flex-col select-none transition-[width,height] duration-200 ease-in-out"
                style={{
                    width: nodeInFlow?.width || collapsedDimensions.width,
                    height: nodeInFlow?.height || (isExpanded ? expandedDimensions.height : collapsedDimensions.height),
                    backgroundColor: color,
                }}
            >
                {/* Connection handles */}
                <ConnectionHandles 
                    color={color} 
                    icons={{
                        left: <ArrowLeft className="size-4" />,
                        right: <ArrowRight className="size-4" />,
                        top: <ArrowUp className="size-4" />,
                        bottom: <ArrowDown className="size-4" />
                    }}
                />

                <NodeHeader className="dragHandle">

                    <CircleStackIcon
                        className={`
                            ${isExpanded ? 'relative w-6 h-6' : 'absolute w-16 h-16'} 
                            ${isExpanded ? '' : 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'}
                            stroke-slate
                        `}
                    />
                    <div
                        className="flex-1 font-semibold relative text-ellipsis overflow-hidden whitespace-nowrap"
                    >
                        {nodeLabel}
                    </div>
                    <ExpandCollapseButton
                        collapsedDimensions={collapsedDimensions}
                        expandedDimensions={expandedDimensions}
                        nodeInFlow={nodeInFlow}
                    />
                    <NodeHeaderMenuAction label="File Options">
                        {fileNodeMenuItems}
                        <NodeHeaderDeleteAction />
                    </NodeHeaderMenuAction>
                </NodeHeader>

            </DataNodeContainer>
        </>
    );
};

export default DataNode;