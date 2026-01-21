'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { RuntimeConfig } from '../../shared/runtime-config';

interface TokensPanelProps {
  currentConfig?: RuntimeConfig;
  onUpdate: (updates: Partial<RuntimeConfig>) => Promise<void>;
}

export function TokensPanel({ currentConfig, onUpdate }: TokensPanelProps) {
  const [maxTokens, setMaxTokens] = useState(currentConfig?.maxTokens?.toString() || '');
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async () => {
    const tokenValue = parseInt(maxTokens);
    if (isNaN(tokenValue) || tokenValue < 1 || tokenValue > 4096) {
      setError('Token limit must be between 1 and 4096');
      return;
    }

    try {
      setUpdating(true);
      setError(null);
      await onUpdate({ maxTokens: tokenValue });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  const handleInputChange = (value: string) => {
    setMaxTokens(value);
    setError(null); // Clear error when user starts typing
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Token Limits</CardTitle>
        <CardDescription>
          Configure maximum tokens for AI generation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Maximum Tokens
          </label>
          <input
            type="number"
            value={maxTokens}
            onChange={(e) => handleInputChange(e.target.value)}
            min="1"
            max="4096"
            className="w-full px-3 py-2 border border-input rounded-md bg-background"
            placeholder="Enter token limit (1-4096)"
          />
          <div className="text-xs text-muted-foreground mt-1">
            Current: {currentConfig?.maxTokens || 'Not set'}
          </div>
        </div>

        <button
          onClick={handleUpdate}
          disabled={updating || maxTokens === currentConfig?.maxTokens?.toString()}
          className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {updating ? 'Updating...' : 'Update Token Limit'}
        </button>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <div className="text-sm text-destructive font-medium">Error</div>
            <div className="text-sm text-muted-foreground">{error}</div>
          </div>
        )}

        {/* Info */}
        <div className="text-xs text-muted-foreground">
          Higher limits allow more detailed UI generation but increase costs and response time.
        </div>
      </CardContent>
    </Card>
  );
}