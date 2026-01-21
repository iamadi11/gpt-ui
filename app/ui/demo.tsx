import React, { useState } from 'react';
import { UIGenerationResult } from '../shared/ui-schema';
import { AIRenderer } from './ai-renderer';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

/**
 * Demo component showing the complete AI-UI pipeline
 * Input → MCP → AI JSON → Validation → Renderer
 */
export function AIDemo() {
  const [result, setResult] = useState<UIGenerationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState('Show sales data for Q1 2024');

  const handleGenerate = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Call the full pipeline API: Input → Cache → MCP → Validation → Response
      const response = await fetch('/api/generate-ui', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: input,
          intent: 'Generate a dashboard showing the requested data with appropriate visualizations'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || `HTTP ${response.status}`);
      }

      const uiResult: UIGenerationResult = await response.json();

      // Render the AI-generated UI (renderer remains dumb)
      setResult(uiResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>AI-Generated UI Demo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Describe what UI you want:
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full p-3 border rounded-md resize-none"
                rows={3}
                placeholder="e.g., Show sales data for Q1, Create a user profile form..."
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !input.trim()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate UI'}
            </button>

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
                <Badge variant="destructive" className="mb-2">Error</Badge>
                <p className="text-sm">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Render the AI-generated UI */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Generated UI
                <Badge variant="default">
                  {Math.round(result.confidence * 100)}% confidence
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AIRenderer result={result} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}