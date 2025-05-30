import React from 'react';
import { FormField } from './FormField';

interface HorizontalFormLayoutProps {
  fields: Record<string, any>;
  formData: Record<string, any>;
  onFieldChange: (fieldKey: string, value: any) => void;
}

export const HorizontalFormLayout: React.FC<HorizontalFormLayoutProps> = ({
  fields,
  formData,
  onFieldChange,
}) => {
  const fieldEntries = Object.entries(fields);
  
  // Group fields into rows of 2-3 depending on field type
  const groupFields = () => {
    const groups: Array<Array<[string, any]>> = [];
    let currentGroup: Array<[string, any]> = [];
    
    fieldEntries.forEach(([key, field]) => {
      // Large fields (textarea, complex selects) get their own row
      if (field.type === 'textarea' || field.type === 'multiselect') {
        if (currentGroup.length > 0) {
          groups.push([...currentGroup]);
          currentGroup = [];
        }
        groups.push([[key, field]]);
      } else {
        currentGroup.push([key, field]);
        // Group smaller fields in pairs
        if (currentGroup.length === 2) {
          groups.push([...currentGroup]);
          currentGroup = [];
        }
      }
    });
    
    // Add any remaining fields
    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }
    
    return groups;
  };

  const fieldGroups = groupFields();

  return (
    <div className="space-y-4">
      {fieldGroups.map((group, groupIndex) => (
        <div 
          key={groupIndex}
          className={`grid gap-4 ${
            group.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
          }`}
        >
          {group.map(([fieldKey, fieldConfig]) => (
            <div key={fieldKey}>
              <FormField
                fieldKey={fieldKey}
                config={fieldConfig}
                value={formData[fieldKey]}
                onChange={(value) => onFieldChange(fieldKey, value)}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default HorizontalFormLayout;