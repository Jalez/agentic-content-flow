export interface FieldConfig {
  fieldType: string;
  label: string;
  defaultValue?: any;
  required?: boolean;
  placeholder?: string;
  description?: string;
  options?: Array<{ value: any; label: string }>;
  optionsRef?: string;
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}

export interface NodeConfig {
  nodeType: string;
  metadata: {
    title: string;
    description: string;
    icon: string;
    category: string;
  };
  configFields: Record<string, FieldConfig>;
  variants?: Record<string, Record<string, FieldConfig>>;
}

export interface ConfigPanelProps {
  activeNode: any;
  formData: Record<string, any>;
  hasChanges: boolean;
  onFieldChange: (fieldKey: string, value: any) => void;
  onSave: () => void;
  onReset: () => void;
}