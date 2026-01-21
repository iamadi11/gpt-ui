import React from 'react';
import { UIGenerationResult } from '../shared/ui-schema';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { ScrollArea } from '../../components/ui/scroll-area';

/**
 * AI Renderer - Dumb recursive renderer for AI-generated UI
 *
 * RENDERING RULES:
 * - Every node is a container
 * - Children rendered recursively
 * - Props passed blindly
 * - Unknown structures → raw JSON blocks
 * - No component registry/mapping
 * - No semantic decisions
 */

interface AIRendererProps {
  result: UIGenerationResult;
  confidenceThreshold?: number;
}

/**
 * Main AI renderer component
 * Renders AI-generated UI or fallback based on confidence
 */
export function AIRenderer({
  result,
  confidenceThreshold = 0.5
}: AIRendererProps) {
  // Check if we should show fallback
  const shouldShowFallback =
    result.confidence < confidenceThreshold ||
    !!result.fallback;

  if (shouldShowFallback) {
    return <FallbackRenderer result={result} />;
  }

  // Render the AI-generated UI
  return (
    <div className="w-full h-full">
      <RecursiveRenderer node={result.ui.layout} />
      {result.ui.components.map((component, index) => (
        <RecursiveRenderer key={index} node={component} />
      ))}
    </div>
  );
}

/**
 * Recursively renders any JSON node
 * Treats every node as a container with potential children
 */
function RecursiveRenderer({ node }: { node: any }) {
  // Handle null/undefined
  if (node === null || node === undefined) {
    return <div className="text-muted-foreground italic">Empty</div>;
  }

  // Handle primitive values
  if (typeof node === 'string' || typeof node === 'number' || typeof node === 'boolean') {
    return <div className="text-foreground">{String(node)}</div>;
  }

  // Handle arrays
  if (Array.isArray(node)) {
    return (
      <div className="space-y-2">
        {node.map((item, index) => (
          <RecursiveRenderer key={index} node={item} />
        ))}
      </div>
    );
  }

  // Handle objects (complex nodes)
  if (typeof node === 'object') {
    return <ObjectRenderer node={node} />;
  }

  // Fallback for unknown types
  return <RawJsonRenderer data={node} />;
}

/**
 * Renders complex objects as containers
 * Extracts known properties and renders children recursively
 */
function ObjectRenderer({ node }: { node: any }) {
  const { type, props, children, content, ...otherProps } = node;

  // Use shadcn Card as generic container
  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        {/* Render content if present */}
        {content && (
          <div className="mb-2">
            <RecursiveRenderer node={content} />
          </div>
        )}

        {/* Render children recursively */}
        {children && (
          <div className="space-y-2">
            {Array.isArray(children) ? (
              children.map((child: any, index: number) => (
                <RecursiveRenderer key={index} node={child} />
              ))
            ) : (
              <RecursiveRenderer node={children} />
            )}
          </div>
        )}

        {/* Show other properties as badges */}
        {Object.keys(otherProps).length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {Object.entries(otherProps).map(([key, value]) => (
              <Badge key={key} variant="secondary" className="text-xs">
                {key}: {typeof value === 'object' ? '[object]' : String(value)}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Renders unknown structures as raw JSON blocks
 * Used when the renderer can't interpret the structure
 */
function RawJsonRenderer({ data }: { data: any }) {
  return (
    <Card className="mb-4 border-dashed">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">Raw Data</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-32 w-full">
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
            {JSON.stringify(data, null, 2)}
          </pre>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

/**
 * Renders fallback UI when confidence is low or AI failed
 */
function FallbackRenderer({ result }: { result: UIGenerationResult }) {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          AI Generation Result
          <Badge variant={result.confidence >= 0.5 ? "default" : "destructive"}>
            {Math.round(result.confidence * 100)}% confidence
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {result.fallback && (
          <div>
            <h4 className="font-medium mb-2">Reason:</h4>
            <p className="text-muted-foreground">{result.fallback.reason}</p>
          </div>
        )}

        <Separator />

        <div>
          <h4 className="font-medium mb-2">Raw Input:</h4>
          <ScrollArea className="h-48 w-full">
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
              {JSON.stringify(result.fallback?.raw || result, null, 2)}
            </pre>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}