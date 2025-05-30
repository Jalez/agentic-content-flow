import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye } from 'lucide-react';
import { FormField } from './FormField';

interface AppearanceTabProps {
  activeNode: any;
  formData: Record<string, any>;
  onFieldChange: (fieldKey: string, value: any) => void;
}

export const AppearanceTab: React.FC<AppearanceTabProps> = ({ 
  activeNode, 
  formData, 
  onFieldChange 
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center space-x-2">
          <Eye className="w-4 h-4" />
          <span>Visual Settings</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          fieldKey="width"
          config={{
            fieldType: 'number',
            label: 'Width',
            defaultValue: activeNode.width || 280,
            validation: { min: 100, max: 800 }
          }}
          value={formData.width}
          onChange={(value) => onFieldChange('width', value)}
        />
        <FormField
          fieldKey="height"
          config={{
            fieldType: 'number',
            label: 'Height',
            defaultValue: activeNode.height || 180,
            validation: { min: 80, max: 600 }
          }}
          value={formData.height}
          onChange={(value) => onFieldChange('height', value)}
        />
        <FormField
          fieldKey="expanded"
          config={{
            fieldType: 'boolean',
            label: 'Expanded by Default',
            defaultValue: activeNode.data?.expanded || false
          }}
          value={formData.expanded}
          onChange={(value) => onFieldChange('expanded', value)}
        />
      </CardContent>
    </Card>
  );
};