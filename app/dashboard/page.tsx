'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { ModelPanel } from './panels/model';
import { TokensPanel } from './panels/tokens';
import { CachePanel } from './panels/cache';
import { RuntimeConfig } from '../shared/runtime-config';

/**
 * Admin Dashboard - Configuration Control Plane
 * Internal dashboard for configuring AI-generated UI platform
 *
 * FEATURES:
 * - Real-time config status display
 * - Individual config panels
 * - Safe update validation
 * - No UI generation (purely configurational)
 */

interface ConfigStatus {
  config: RuntimeConfig;
  isValid: boolean;
  lastUpdated: string;
  version: number;
}

export default function DashboardPage() {
  const [configStatus, setConfigStatus] = useState<ConfigStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load current config status
  const loadConfig = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would call the API
      // For now, we'll simulate the API call
      const response = await fetch('/api/config');
      if (!response.ok) throw new Error('Failed to load config');
      const status = await response.json();
      setConfigStatus(status);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setConfigStatus(null);
    } finally {
      setLoading(false);
    }
  };

  // Load config on mount
  useEffect(() => {
    loadConfig();
  }, []);

  // Handle config updates
  const handleConfigUpdate = async (updates: Partial<RuntimeConfig>) => {
    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Update failed');
      }

      // Reload config after successful update
      await loadConfig();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Update failed');
    }
  };

  // Handle config reset
  const handleConfigReset = async () => {
    try {
      const response = await fetch('/api/config', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Reset failed');
      }

      await loadConfig();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="text-muted-foreground">Loading dashboard...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">AI UI Platform Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Configure the AI-generated UI system
            </p>
          </div>

          <div className="flex items-center gap-2">
            {configStatus && (
              <>
                <Badge variant="outline">
                  Version {configStatus.version}
                </Badge>
                <Badge variant="secondary">
                  {configStatus.isValid ? 'Valid' : 'Invalid'}
                </Badge>
              </>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="text-destructive font-medium">Error</div>
              <div className="text-sm text-muted-foreground mt-1">{error}</div>
            </CardContent>
          </Card>
        )}

        {/* Current Status */}
        {configStatus && (
          <Card>
            <CardHeader>
              <CardTitle>Current Configuration</CardTitle>
              <CardDescription>
                Last updated: {new Date(configStatus.lastUpdated).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Active Model</div>
                  <div className="text-lg font-semibold capitalize">{configStatus.config.activeModel}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Max Tokens</div>
                  <div className="text-lg font-semibold">{configStatus.config.maxTokens}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Cache TTL</div>
                  <div className="text-lg font-semibold">{Math.round(configStatus.config.cache.ttlMs / 1000 / 60)}min</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Confidence Threshold</div>
                  <div className="text-lg font-semibold">{configStatus.config.ui.confidenceThreshold}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Configuration Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ModelPanel
            currentConfig={configStatus?.config}
            onUpdate={handleConfigUpdate}
          />
          <TokensPanel
            currentConfig={configStatus?.config}
            onUpdate={handleConfigUpdate}
          />
          <CachePanel
            currentConfig={configStatus?.config}
            onUpdate={handleConfigUpdate}
          />
        </div>

        <Separator />

        {/* Emergency Controls */}
        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="text-destructive">Emergency Controls</CardTitle>
            <CardDescription>
              Reset configuration to safe defaults
            </CardDescription>
          </CardHeader>
          <CardContent>
            <button
              onClick={handleConfigReset}
              className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90"
            >
              Reset to Defaults
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}