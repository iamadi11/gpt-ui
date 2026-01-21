'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { RuntimeConfig } from '../../shared/runtime-config';

interface CachePanelProps {
  currentConfig?: RuntimeConfig;
  onUpdate: (updates: Partial<RuntimeConfig>) => Promise<void>;
}

export function CachePanel({ currentConfig, onUpdate }: CachePanelProps) {
  const [ttlMinutes, setTtlMinutes] = useState(
    currentConfig ? Math.round(currentConfig.cache.ttlMs / 1000 / 60) : 5
  );
  const [maxSize, setMaxSize] = useState(currentConfig?.cache.maxSize?.toString() || '');
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async () => {
    const ttlValue = ttlMinutes * 60 * 1000; // Convert minutes to milliseconds
    const sizeValue = parseInt(maxSize);

    if (ttlValue < 60000 || ttlValue > 86400000) { // 1 minute to 24 hours
      setError('TTL must be between 1 and 1440 minutes');
      return;
    }

    if (isNaN(sizeValue) || sizeValue < 1 || sizeValue > 10000) {
      setError('Max size must be between 1 and 10000 entries');
      return;
    }

    try {
      setUpdating(true);
      setError(null);
      await onUpdate({
        cache: {
          ttlMs: ttlValue,
          maxSize: sizeValue,
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  const handleInputChange = (setter: (value: any) => void) => (value: string) => {
    setter(value);
    setError(null); // Clear error when user starts typing
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cache Configuration</CardTitle>
        <CardDescription>
          Configure AI response caching behavior
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Cache TTL (minutes)
          </label>
          <input
            type="number"
            value={ttlMinutes}
            onChange={(e) => handleInputChange(setTtlMinutes)(e.target.value)}
            min="1"
            max="1440"
            className="w-full px-3 py-2 border border-input rounded-md bg-background"
            placeholder="Enter TTL in minutes"
          />
          <div className="text-xs text-muted-foreground mt-1">
            Current: {currentConfig ? Math.round(currentConfig.cache.ttlMs / 1000 / 60) : 'Not set'} minutes
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Max Cache Size (entries)
          </label>
          <input
            type="number"
            value={maxSize}
            onChange={(e) => handleInputChange(setMaxSize)(e.target.value)}
            min="1"
            max="10000"
            className="w-full px-3 py-2 border border-input rounded-md bg-background"
            placeholder="Enter max cache size"
          />
          <div className="text-xs text-muted-foreground mt-1">
            Current: {currentConfig?.cache.maxSize || 'Not set'} entries
          </div>
        </div>

        <button
          onClick={handleUpdate}
          disabled={updating}
          className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {updating ? 'Updating...' : 'Update Cache Config'}
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
          Longer TTL reduces API calls but may serve stale results. Larger cache size improves hit rate but uses more memory.
        </div>
      </CardContent>
    </Card>
  );
}