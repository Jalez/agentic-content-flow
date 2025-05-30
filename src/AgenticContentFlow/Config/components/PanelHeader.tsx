import React from 'react';
import { Badge } from '@/components/ui/badge';
import { getNodeIcon } from '../nodeConfigs';
import { NodeConfig } from '../types';

interface PanelHeaderProps {
  activeNode: any;
  nodeConfig: NodeConfig;
}

export const PanelHeader: React.FC<PanelHeaderProps> = ({ activeNode, nodeConfig }) => {
  return (
    <>
      <div className="flex items-center space-x-4">
        {getNodeIcon(activeNode.type)}
        <div>
          <h2 className="text-lg font-semibold leading-none tracking-tight">
            {nodeConfig.metadata.title}
          </h2>
          <p className="text-sm text-muted-foreground">
            {nodeConfig.metadata.description}
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <Badge variant="secondary">{activeNode.type}</Badge>
        <Badge variant="outline">{nodeConfig.metadata.category}</Badge>
        {activeNode.id && (
          <Badge variant="outline" className="font-mono text-xs">
            {activeNode.id}
          </Badge>
        )}
      </div>
    </>
  );
};