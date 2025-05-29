import React, { useEffect, useState } from 'react';
import { NodeProps } from '@xyflow/react';
import { PageNodeContainer } from './PageNodeStyles';
import {
  NodeHeader,
  NodeHeaderActions
} from '../common/NodeHeader';
import { useUpdateNodeInternals, useReactFlow } from '@xyflow/react';
import { LAYOUT_CONSTANTS } from '../../Layout/utils/layoutUtils';
import ExpandCollapseButton from '../common/ExpandCollapseButton';
import ConnectionHandles from '../common/ConnectionHandles';
import CornerResizer from '../common/CornerResizer';
import { colorByDepth } from '../common/utils/colorByDepth';
import WebIcon from '@/components/icons/web';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useSelect } from '../../Select/contexts/SelectContext';

export const PageNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const updateNodeInternals = useUpdateNodeInternals();
  const { getNode } = useReactFlow();
  const { deleteSelected } = useSelect();
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

  const collapsedDimensions = {
    width: 300,
    height: 200,
  };

  const expandedDimensions = {
    width: nodeInFlow?.width || collapsedDimensions.width,
    height: nodeInFlow?.height || collapsedDimensions.height,
  };

  const nodeLabel = data?.label ? String(data.label) : 'Page';

  const handleEditContent = () => console.log('Edit page content');
  const handlePreview = () => console.log('View page preview');

  return (
    <>
      <CornerResizer
        minHeight={LAYOUT_CONSTANTS.NODE_DEFAULT_HEIGHT}
        minWidth={LAYOUT_CONSTANTS.NODE_DEFAULT_WIDTH}
        nodeToResize={nodeInFlow}
        canResize={selected}
        color={color}
      />
      <PageNodeContainer
        onTransitionEnd={() => updateNodeInternals(id)}
        isExpanded={isExpanded as boolean}
        selected={selected}
        color={color}
        className="w-full h-full flex flex-col select-none transition-[width,height] duration-200 ease-in-out"
        style={{
          width: nodeInFlow?.width,
          height: nodeInFlow?.height,
          backgroundColor: color,
        }}
      >
        <ConnectionHandles nodeType="pagenode" 
                            color={color} 

        />
        <NodeHeader className="dragHandle">
          <WebIcon
            className={`
              ${isExpanded ? 'relative size-6' : 'absolute size-16'} 
              ${isExpanded ? '' : 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'}
              stroke-slate
            `}
          />
          <div className="flex-1 relative font-semibold text-sm text-ellipsis overflow-hidden whitespace-nowrap max-w-full">
            {nodeLabel}
          </div>
          <NodeHeaderActions>
            <ExpandCollapseButton
              collapsedDimensions={collapsedDimensions}
              expandedDimensions={expandedDimensions}
              nodeInFlow={nodeInFlow}
            />
            <DropdownMenu>
              <DropdownMenuTrigger className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800">
                <span className="sr-only">Page options</span>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                  <path d="M3 7.5C3 8.32843 2.32843 9 1.5 9C0.671573 9 0 8.32843 0 7.5C0 6.67157 0.671573 6 1.5 6C2.32843 6 3 6.67157 3 7.5ZM8.5 7.5C8.5 8.32843 7.82843 9 7 9C6.17157 9 5.5 8.32843 5.5 7.5C5.5 6.67157 6.17157 6 7 6C7.82843 6 8.5 6.67157 8.5 7.5ZM14 7.5C14 8.32843 13.3284 9 12.5 9C11.6716 9 11 8.32843 11 7.5C11 6.67157 11.6716 6 12.5 6C13.3284 6 14 6.67157 14 7.5Z" fill="currentColor" />
                </svg>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleEditContent}>
                  Edit HTML
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handlePreview}>
                  Preview Page
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => deleteSelected()} className="text-red-600">
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </NodeHeaderActions>
        </NodeHeader>
      </PageNodeContainer>
    </>
  );
};

export default PageNode;