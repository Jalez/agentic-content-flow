import { NodeConfig } from './types';
import { 
  Database, 
  Globe, 
  FileText, 
  Workflow,
  Settings
} from 'lucide-react';

// Mock configurations - in a real app, these would be loaded from the actual config files
export const mockConfigurations: Record<string, NodeConfig> = {
  restnode: {
    nodeType: 'restnode',
    metadata: {
      title: 'REST API Node',
      description: 'Specialized node for making HTTP requests to REST APIs',
      icon: 'globe',
      category: 'integration'
    },
    configFields: {
      requestName: {
        fieldType: 'text',
        label: 'Request Name',
        defaultValue: 'API Request',
        required: true
      },
      method: {
        fieldType: 'select',
        label: 'HTTP Method',
        defaultValue: 'GET',
        required: true,
        options: [
          { value: 'GET', label: 'GET' },
          { value: 'POST', label: 'POST' },
          { value: 'PUT', label: 'PUT' },
          { value: 'DELETE', label: 'DELETE' }
        ]
      },
      url: {
        fieldType: 'text',
        label: 'API Endpoint',
        required: true,
        placeholder: 'https://api.example.com/endpoint'
      },
      timeout: {
        fieldType: 'number',
        label: 'Timeout (seconds)',
        defaultValue: 30,
        validation: { min: 1, max: 300 }
      }
    },
    variants: {
      POST: {
        body: {
          fieldType: 'textarea',
          label: 'Request Body',
          placeholder: '{"key": "value"}',
          description: 'JSON payload for POST request'
        }
      }
    }
  },
  datanode: {
    nodeType: 'datanode',
    metadata: {
      title: 'Data Node',
      description: 'Node for handling and storing data',
      icon: 'database',
      category: 'data'
    },
    configFields: {
      label: {
        fieldType: 'text',
        label: 'Node Label',
        defaultValue: 'Data Node',
        required: true
      },
      dataFormat: {
        fieldType: 'select',
        label: 'Data Format',
        defaultValue: 'json',
        options: [
          { value: 'json', label: 'JSON' },
          { value: 'csv', label: 'CSV' },
          { value: 'xml', label: 'XML' },
          { value: 'yaml', label: 'YAML' }
        ]
      },
      autoRefresh: {
        fieldType: 'boolean',
        label: 'Auto Refresh',
        defaultValue: false
      }
    }
  },
  pagenode: {
    nodeType: 'pagenode',
    metadata: {
      title: 'Page Node',
      description: 'Node for web pages and content',
      icon: 'filetext',
      category: 'content'
    },
    configFields: {
      label: {
        fieldType: 'text',
        label: 'Page Title',
        defaultValue: 'New Page',
        required: true
      },
      description: {
        fieldType: 'textarea',
        label: 'Page Description',
        placeholder: 'Describe what this page contains...'
      },
      publishStatus: {
        fieldType: 'select',
        label: 'Publish Status',
        defaultValue: 'draft',
        options: [
          { value: 'draft', label: 'Draft' },
          { value: 'published', label: 'Published' },
          { value: 'archived', label: 'Archived' }
        ]
      }
    }
  }
};

// Icon mapping for node types
export const getNodeIcon = (nodeType: string) => {
  switch (nodeType) {
    case 'restnode': return <Globe className="w-4 h-4" />;
    case 'datanode': return <Database className="w-4 h-4" />;
    case 'pagenode': return <FileText className="w-4 h-4" />;
    case 'contentnode': return <FileText className="w-4 h-4" />;
    case 'conditionalnode': return <Workflow className="w-4 h-4" />;
    default: return <Settings className="w-4 h-4" />;
  }
};

// Utility function to get node configuration
export const getNodeConfig = (nodeType: string, nodeData: any): NodeConfig => {
  return mockConfigurations[nodeType] || {
    nodeType,
    metadata: {
      title: `${nodeType} Configuration`,
      description: `Configure ${nodeType} properties`,
      icon: 'settings',
      category: 'general'
    },
    configFields: {
      label: {
        fieldType: 'text',
        label: 'Label',
        defaultValue: nodeData?.label || 'Node',
        required: true
      }
    }
  };
};

// Utility function to get variant-specific fields
export const getVariantFields = (nodeConfig: NodeConfig, formData: Record<string, any>, nodeData: any) => {
  if (!nodeConfig.variants) return {};
  
  let variantFields = {};
  Object.entries(nodeConfig.variants).forEach(([variantKey, fields]) => {
    if (formData[variantKey] || nodeData?.[variantKey]) {
      variantFields = { ...variantFields, ...fields };
    }
  });
  
  return variantFields;
};