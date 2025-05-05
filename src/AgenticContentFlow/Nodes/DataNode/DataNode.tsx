import React, { useState, useEffect } from 'react';
import { NodeProps, Position } from '@xyflow/react';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { MenuItem, List, ListItem, ListItemIcon, ListItemText, Box } from '@mui/material';
import { StyledHandle } from '../common/NodeStyles';
import { DataNodeContainer } from './DataNodeStyles';
import { 
  NodeHeader,
  NodeHeaderTitle,
  NodeHeaderMenuAction,
  NodeHeaderDeleteAction
} from '../common/NodeHeader';
import { useNodeHistoryState } from '../../Node/hooks/useNodeState';
import { useUpdateNodeInternals, useReactFlow } from '@xyflow/react';
import { LAYOUT_CONSTANTS } from '../../Layout/utils/layoutUtils';
import FolderExpandButton from './FolderExpandButton';
import CornerResizer from '../common/CornerResizer';

/**
 * Data Node Component
 * 
 * Represents a data source or repository in a flow diagram.
 * Has a distinctive folder appearance.
 * Accepts data primarily from left side, produces data primarily to right side.
 * Also maintains top/bottom connections for sibling/conditional communication.
 */
export const DataNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const { updateNode } = useNodeHistoryState();
  const updateNodeInternals = useUpdateNodeInternals();
  const { getNode } = useReactFlow();
  const nodeInFlow = getNode(id);
  const [isExpanded, setIsExpanded] = useState(false);
  
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

  // Initialize with a proper initial state based on existing dimensions
  useEffect(() => {
    if (nodeInFlow) {
      // Make sure we properly read the expanded state
      const isCurrentlyExpanded = Boolean(nodeInFlow.data?.expanded);
      
      setIsExpanded(isCurrentlyExpanded);
      
      // Ensure dimensions match the expanded state
      if (isCurrentlyExpanded !== isExpanded) {
        updateNode({
          ...nodeInFlow,
          data: {
            ...nodeInFlow.data,
            expanded: isCurrentlyExpanded
          },
          width: isCurrentlyExpanded ? expandedDimensions.width : collapsedDimensions.width,
          height: isCurrentlyExpanded ? expandedDimensions.height : collapsedDimensions.height
        });
      }
    }
  }, []);

  const handleToggleExpand = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    
    // Update node dimensions based on expanded state
    updateNode({
      ...nodeInFlow,
      data: {
        ...nodeInFlow.data,
        expanded: newExpanded
      },
      width: newExpanded ? expandedDimensions.width : collapsedDimensions.width,
      height: newExpanded ? expandedDimensions.height : collapsedDimensions.height,
    });
    
    // Force update of node internals to ensure proper rendering
    setTimeout(() => updateNodeInternals(id), 10);
  };
  
  const handleResize = (_: any, params: any) => {
    if (!nodeInFlow) return;
    
    // Store new dimensions for both current state and future use
    const newWidth = params.width;
    const newHeight = params.height;
    
    // Only update expanded dimensions when in expanded state
    if (isExpanded) {
      updateNode({
        ...nodeInFlow,
        data: {
          ...nodeInFlow.data,
          expanded: true
        },
        width: newWidth,
        height: newHeight
      });
      
      // Force update of node internals to ensure proper rendering
      setTimeout(() => updateNodeInternals(id), 10);
    }
  };

  // Type checking for data properties
  const nodeLabel = data?.label ? String(data.label) : 'Files';
  
  // Generate mock file structure for the explorer view
  const mockFiles = [
    { name: 'document.pdf', type: 'file' },
    { name: 'images', type: 'folder', children: [
      { name: 'photo1.jpg', type: 'file' },
      { name: 'photo2.jpg', type: 'file' }
    ]},
    { name: 'data.json', type: 'file' },
    { name: 'notes.txt', type: 'file' }
  ];

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

  // Helper function to render file icon based on filename
  const getFileIcon = (_fileName: string) => {
    // We're not using the filename yet, but keeping for future extension-specific icons
    return <InsertDriveFileIcon fontSize="small" />;
  };

  // Render the file explorer when expanded
  const renderFileExplorer = () => {
    if (!isExpanded) return null;
    
    return (
      <List dense sx={{ p: 0, overflow: 'auto', flex: 1, mt: 0 }} className="file-explorer-content">
        {mockFiles.map((item, index) => (
          <React.Fragment key={index}>
            <ListItem dense>
              <ListItemIcon sx={{ minWidth: '32px' }}>
                {item.type === 'folder' ? 
                  <FolderIcon fontSize="small" color="primary" /> : 
                  getFileIcon(item.name)}
              </ListItemIcon>
              <ListItemText primary={item.name} />
            </ListItem>
            
            {item.type === 'folder' && item.children && (
              <List dense sx={{ pl: 2 }}>
                {item.children.map((child, childIndex) => (
                  <ListItem dense key={`child-${childIndex}`}>
                    <ListItemIcon sx={{ minWidth: '32px' }}>
                      {getFileIcon(child.name)}
                    </ListItemIcon>
                    <ListItemText primary={child.name} />
                  </ListItem>
                ))}
              </List>
            )}
          </React.Fragment>
        ))}
      </List>
    );
  };

  return (
    <>
      {selected && (
        <CornerResizer
          minHeight={LAYOUT_CONSTANTS.NODE_DEFAULT_HEIGHT}
          minWidth={LAYOUT_CONSTANTS.NODE_DEFAULT_WIDTH}
          onResize={handleResize}
          color={color}
        />
      )}
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
        <StyledHandle
          type="target"
          position={Position.Left}
          id="left"
          color={color}
          style={{ left: '-7px', zIndex: 3 }}
        />
        <StyledHandle
          type="source"
          position={Position.Right}
          id="right"
          color={color}
          style={{ right: '-7px', zIndex: 3 }}
        />
        <StyledHandle
          type="target"
          position={Position.Top}
          id="top"
          color={color}
          style={{ top: '-7px', zIndex: 3 }}
        />
        <StyledHandle
          type="source"
          position={Position.Bottom}
          id="bottom"
          color={color}
          style={{ bottom: '-7px', zIndex: 3 }}
        />

        <NodeHeader className="dragHandle">
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'flex-start',
              borderTopLeftRadius: '4px',
              borderTopRightRadius: '4px',
              padding: isExpanded ? '8px' : '4px 12px',
              width: '100%',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', marginRight: '8px' }}>
              {isExpanded ? 
                <FolderOpenIcon style={{ color }} /> : 
                <FolderIcon style={{ color }} />
              }
            </Box>
            <NodeHeaderTitle>
              <Box
                component="span"
                sx={{ 
                  flex: '1 1 auto',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: isExpanded ? 'calc(100% - 100px)' : 'calc(100% - 80px)'
                }}
              >
                {nodeLabel}
              </Box>
            </NodeHeaderTitle>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                flexShrink: 0,
                marginLeft: 'auto'
              }}
            >
              <FolderExpandButton 
                isExpanded={isExpanded}
                onToggle={handleToggleExpand}
              />
              
              <NodeHeaderMenuAction label="File Options">
                {fileNodeMenuItems}
                <NodeHeaderDeleteAction />
              </NodeHeaderMenuAction>
            </Box>
          </Box>
        </NodeHeader>

        {/* Render content area based on expanded state */}
        {renderFileExplorer()}
      </DataNodeContainer>
    </>
  );
};

export default DataNode;