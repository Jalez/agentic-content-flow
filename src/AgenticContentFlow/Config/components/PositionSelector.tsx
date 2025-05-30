import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Move, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

type PanelPosition = 'top' | 'bottom' | 'left' | 'right';

interface PositionSelectorProps {
  position: PanelPosition;
  onPositionChange: (position: PanelPosition) => void;
}

const positionOptions = [
  { value: 'top', label: 'Top', icon: ArrowUp },
  { value: 'bottom', label: 'Bottom', icon: ArrowDown },
  { value: 'left', label: 'Left', icon: ArrowLeft },
  { value: 'right', label: 'Right', icon: ArrowRight },
] as const;

export const PositionSelector: React.FC<PositionSelectorProps> = ({
  position,
  onPositionChange,
}) => {
  return (
    <div className="flex items-center gap-2">
      <Move className="w-4 h-4 text-muted-foreground" />
      <Select value={position} onValueChange={onPositionChange}>
        <SelectTrigger className="w-32 h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {positionOptions.map(({ value, label, icon: Icon }) => (
            <SelectItem key={value} value={value}>
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default PositionSelector;