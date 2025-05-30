import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, RotateCcw } from 'lucide-react';

interface PanelFooterProps {
  hasChanges: boolean;
  onSave: () => void;
  onReset: () => void;
}

export const PanelFooter: React.FC<PanelFooterProps> = ({ hasChanges, onSave, onReset }) => {
  return (
    <div className="flex items-center justify-between space-x-2">
      <div className="flex items-center space-x-2">
        {hasChanges && (
          <div className="flex items-center space-x-1 text-xs text-amber-600">
            <div className="w-2 h-2 bg-amber-400 rounded-full" />
            <span>Unsaved changes</span>
          </div>
        )}
      </div>
      
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onReset}
          disabled={!hasChanges}
        >
          <RotateCcw className="w-3 h-3 mr-1" />
          Reset
        </Button>
        <Button 
          size="sm" 
          onClick={onSave}
          disabled={!hasChanges}
        >
          <Save className="w-3 h-3 mr-1" />
          Save
        </Button>
      </div>
    </div>
  );
};