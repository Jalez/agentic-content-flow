import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';
import { FormField } from './FormField';
import { FieldConfig } from '../types';

interface PropertiesTabProps {
  fields: Record<string, FieldConfig>;
  formData: Record<string, any>;
  onFieldChange: (fieldKey: string, value: any) => void;
}

export const PropertiesTab: React.FC<PropertiesTabProps> = ({ 
  fields, 
  formData, 
  onFieldChange
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center space-x-2">
          <Settings className="w-4 h-4" />
          <span>Node Configuration</span>
        </CardTitle>
        <CardDescription className="text-xs">
          Configure the behavior and properties of this node
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(fields).map(([fieldKey, fieldConfig]) => (
          <FormField
            key={fieldKey}
            fieldKey={fieldKey}
            config={fieldConfig}
            value={formData[fieldKey]}
            onChange={(value) => onFieldChange(fieldKey, value)}
          />
        ))}
      </CardContent>
    </Card>
  );
};