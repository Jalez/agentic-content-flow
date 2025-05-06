import React, { useState, useEffect } from 'react';
import { NodeProps } from '@xyflow/react';
import { MenuItem } from '@mui/material';
import { DataNodeContainer } from './DataNodeStyles';
import {
    NodeHeader,
    NodeHeaderMenuAction,
    NodeHeaderDeleteAction
} from '../common/NodeHeader';
import { useUpdateNodeInternals, useReactFlow } from '@xyflow/react';
import { LAYOUT_CONSTANTS } from '../../Layout/utils/layoutUtils';
import CornerResizer from '../common/CornerResizer';
import StorageIcon from '@mui/icons-material/Storage';
import ScrollingText from '../common/ScrollingText';
import ConnectionHandles from '../common/ConnectionHandles';
import ExpandCollapseButton from '../common/ExpandCollapseButton';
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


    const color = isExpanded ? //If expanded, use a lighter color
        '#e0f7fa' : // Light blue for expanded state
        '#b2ebf2'; // Teal for collapsed state

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
        <MenuItem key="open" onClick={() => console.log('Open file')}>
            Open File
        </MenuItem>,
        <MenuItem key="download" onClick={() => console.log('Download file')}>
            Download
        </MenuItem>,
        <MenuItem key="share" onClick={() => console.log('Share file')}>
            Share
        </MenuItem>
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
                sx={{
                    width: nodeInFlow?.width || collapsedDimensions.width,
                    height: nodeInFlow?.height || (isExpanded ? expandedDimensions.height : collapsedDimensions.height),
                    backgroundColor: color,
                    display: "flex",
                    flexDirection: "column",
                    userSelect: "none",
                    transition: "width 0.2s ease, height 0.2s ease",
                }}
            >
                {/* Connection handles */}
                <ConnectionHandles color={color} />


                <NodeHeader className="dragHandle">

                    <StorageIcon
                        sx={{
                            color: 'primary.secondary',
                            position: isExpanded ? 'relative' : 'absolute',
                            //When it is not expanded, center the icon 
                            left: isExpanded ? '0' : '50%',
                            top: isExpanded ? '0' : '50%',
                            transform: isExpanded ? 'none' : 'translate(-50%, -50%)',
                            //Make it larger when not expanded
                            fontSize: isExpanded ? '1.5rem' : '5rem',
                        }}
                    />
                    <ScrollingText
                        text={nodeLabel}
                        variant="subtitle1"
                        maxWidth="100%"
                        sx={{
                            flex: 1,
                            fontWeight: 600,
                            position: 'relative',
                        }}
                    />
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