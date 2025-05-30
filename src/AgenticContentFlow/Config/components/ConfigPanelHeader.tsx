import React from 'react';
import { Separator } from '@/components/ui/separator';
import { PanelHeader } from './PanelHeader';
import { PositionSelector } from './PositionSelector';

type PanelPosition = 'top' | 'bottom' | 'left' | 'right';

interface ConfigPanelHeaderProps {
  activeNode: any;
  nodeConfig: any;
  position: PanelPosition;
  onPositionChange: (position: PanelPosition) => void;
}

export const ConfigPanelHeader: React.FC<ConfigPanelHeaderProps> = ({
  activeNode,
  nodeConfig,
  position,
  onPositionChange,
}) => {
  return (
    <div className="space-y-3 pb-4">
      {/* Always visible position selector at the top */}
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-muted-foreground">Panel Position</h3>
        <PositionSelector 
          position={position} 
          onPositionChange={onPositionChange} 
        />
      </div>
      
      <Separator />
      
      {/* Node information */}
      <div className="flex-1">
        <PanelHeader activeNode={activeNode} nodeConfig={nodeConfig} />
      </div>
    </div>
  );
};

export default ConfigPanelHeader;