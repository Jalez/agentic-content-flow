import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Code2 } from 'lucide-react';
import { FormField } from './FormField';

interface AdvancedTabProps {
  activeNode: any;
  formData: Record<string, any>;
  onFieldChange: (fieldKey: string, value: any) => void;
}

export const AdvancedTab: React.FC<AdvancedTabProps> = ({ 
  activeNode, 
  formData, 
  onFieldChange 
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center space-x-2">
          <Code2 className="w-4 h-4" />
          <span>Advanced Settings</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Accordion type="single" collapsible>
          <AccordionItem value="metadata">
            <AccordionTrigger className="text-sm">Node Metadata</AccordionTrigger>
            <AccordionContent className="space-y-3">
              <FormField
                fieldKey="details"
                config={{
                  fieldType: 'textarea',
                  label: 'Details',
                  placeholder: 'Additional details about this node...'
                }}
                value={formData.details}
                onChange={(value) => onFieldChange('details', value)}
              />
              <FormField
                fieldKey="level"
                config={{
                  fieldType: 'select',
                  label: 'Difficulty Level',
                  defaultValue: 'basic',
                  options: [
                    { value: 'basic', label: 'Basic' },
                    { value: 'intermediate', label: 'Intermediate' },
                    { value: 'advanced', label: 'Advanced' }
                  ]
                }}
                value={formData.level}
                onChange={(value) => onFieldChange('level', value)}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="debug">
            <AccordionTrigger className="text-sm">Debug Information</AccordionTrigger>
            <AccordionContent>
              <div className="bg-muted p-3 rounded-md">
                <pre className="text-xs overflow-auto">
                  {JSON.stringify({
                    id: activeNode.id,
                    type: activeNode.type,
                    position: activeNode.position,
                    data: formData
                  }, null, 2)}
                </pre>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};