'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { RuntimeConfig } from '../../shared/runtime-config';

interface ModelPanelProps {
  currentConfig?: RuntimeConfig;
  onUpdate: (updates: Partial<RuntimeConfig>) => Promise<void>;
}

export function ModelPanel({ currentConfig, onUpdate }: ModelPanelProps) {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleModelChange = async (model: 'small' | 'large') => {
    try {
      setUpdating(true);
      setError(null);
      await onUpdate({ activeModel: model });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Model Selection
          {currentConfig && (
            <Badge variant="default" className="capitalize">
              {currentConfig.activeModel}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Choose which AI model to use for UI generation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Small Model Option */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <div className="font-medium">Small Model</div>
            <div className="text-sm text-muted-foreground">
              Fast, efficient, lower resource usage
            </div>
          </div>
          <button
            onClick={() => handleModelChange('small')}
            disabled={updating || currentConfig?.activeModel === 'small'}
            className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentConfig?.activeModel === 'small' ? 'Active' : 'Select'}
          </button>
        </div>

        {/* Large Model Option */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <div className="font-medium">Large Model</div>
            <div className="text-sm text-muted-foreground">
              More capable, slower, higher resource usage
            </div>
          </div>
          <button
            onClick={() => handleModelChange('large')}
            disabled={updating || currentConfig?.activeModel === 'large'}
            className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentConfig?.activeModel === 'large' ? 'Active' : 'Select'}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <div className="text-sm text-destructive font-medium">Error</div>
            <div className="text-sm text-muted-foreground">{error}</div>
          </div>
        )}

        {/* Update Status */}
        {updating && (
          <div className="text-sm text-muted-foreground text-center">
            Updating model selection...
          </div>
        )}
      </CardContent>
    </Card>
  );
}