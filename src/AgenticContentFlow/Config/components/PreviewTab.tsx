import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Send, RefreshCw } from 'lucide-react';

interface PreviewTabProps {
  formData: Record<string, any>;
}

export const PreviewTab: React.FC<PreviewTabProps> = ({ formData }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { method, url, headers, body } = formData;
      
      const requestOptions: RequestInit = {
        method: method || 'GET',
        headers: headers ? JSON.parse(headers) : { 'Content-Type': 'application/json' },
      };

      if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        requestOptions.body = body;
      }

      const response = await fetch(url, requestOptions);
      const data = await response.json();
      
      setResponse({
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while testing the endpoint');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">API Response Preview</h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleTest}
          disabled={!formData.url || isLoading}
        >
          {isLoading ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Send className="w-4 h-4 mr-2" />
          )}
          Test Request
        </Button>
      </div>

      <div className="h-[400px] rounded-md border p-4 overflow-y-auto">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}
        
        {response && !error && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-medium">Status:</span>
              <code className="px-2 py-1 rounded bg-slate-100">
                {response.status} {response.statusText}
              </code>
            </div>

            <div className="space-y-2">
              <span className="font-medium">Headers:</span>
              <pre className="text-xs bg-slate-100 p-2 rounded overflow-x-auto">
                {JSON.stringify(response.headers, null, 2)}
              </pre>
            </div>

            <div className="space-y-2">
              <span className="font-medium">Response:</span>
              <pre className="text-xs bg-slate-100 p-2 rounded overflow-x-auto">
                {JSON.stringify(response.data, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {!response && !error && (
          <div className="text-center text-gray-500 py-8">
            Click "Test Request" to see the API response
          </div>
        )}
      </div>
    </div>
  );
};