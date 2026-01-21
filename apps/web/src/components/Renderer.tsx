// Main Renderer Component
//
// AI OUTPUT EXECUTOR:
// - Treats AI JSON as single source of truth
// - Maps UI primitives to React components
// - Renders sections in AI-specified order
// - Falls back gracefully on malformed input
//
// BOUNDARIES:
// - No interpretation of raw data
// - No UI decision logic
// - Only executes AI descriptions

import { TextBlock } from './blocks/TextBlock'
import { CardBlock } from './blocks/CardBlock'
import { TableBlock } from './blocks/TableBlock'
import { ChartBlock } from './blocks/ChartBlock'

export interface UIDescription {
  confidence: number
  layout: string
  sections: Section[]
}

export interface Section {
  title: string
  intent: string
  ui: 'text' | 'card' | 'table' | 'chart'
  content?: string
  data?: any[]
  confidence: number
}

interface RendererProps {
  uiDescription: UIDescription | null
  rawInput: string
  error?: string
}

export function Renderer({ uiDescription, rawInput, error }: RendererProps) {
  // Error state - render raw input with explanation
  if (error || !uiDescription) {
    return (
      <div className="bg-white border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-red-500">⚠️</span>
          <h3 className="text-lg font-semibold text-red-900">AI Processing Error</h3>
        </div>
        <p className="text-red-700 mb-4">
          The AI could not generate a UI description. Showing raw input instead.
        </p>
        {error && (
          <p className="text-sm text-red-600 mb-4">Error: {error}</p>
        )}
        <div className="bg-gray-50 border border-gray-200 rounded p-4">
          <h4 className="font-medium text-gray-800 mb-2">Raw Input:</h4>
          <pre className="text-sm text-gray-700 whitespace-pre-wrap">
            {rawInput}
          </pre>
        </div>
      </div>
    )
  }

  // Malformed AI output - render raw input
  if (!uiDescription.sections || !Array.isArray(uiDescription.sections)) {
    return (
      <div className="bg-white border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-yellow-500">⚠️</span>
          <h3 className="text-lg font-semibold text-yellow-900">Invalid AI Output</h3>
        </div>
        <p className="text-yellow-700 mb-4">
          The AI returned malformed output. Showing raw input instead.
        </p>
        <div className="bg-gray-50 border border-gray-200 rounded p-4">
          <h4 className="font-medium text-gray-800 mb-2">Raw Input:</h4>
          <pre className="text-sm text-gray-700 whitespace-pre-wrap">
            {rawInput}
          </pre>
        </div>
      </div>
    )
  }

  // Valid AI output - render the UI sections
  return (
    <div className="space-y-6">
      {/* Overall confidence indicator */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span>AI Confidence:</span>
        <span className={`px-2 py-1 rounded text-xs ${
          uiDescription.confidence > 0.8 ? 'bg-green-100 text-green-800' :
          uiDescription.confidence > 0.6 ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {Math.round(uiDescription.confidence * 100)}%
        </span>
      </div>

      {/* Render sections in AI-specified order */}
      {uiDescription.sections.map((section, index) => {
        const key = `section-${index}-${section.title}`

        switch (section.ui) {
          case 'text':
            return (
              <TextBlock
                key={key}
                title={section.title}
                content={section.content || ''}
                confidence={section.confidence}
                intent={section.intent}
              />
            )

          case 'card':
            return (
              <CardBlock
                key={key}
                title={section.title}
                content={section.content || ''}
                confidence={section.confidence}
                intent={section.intent}
              />
            )

          case 'table':
            return (
              <TableBlock
                key={key}
                title={section.title}
                data={section.data || []}
                confidence={section.confidence}
                intent={section.intent}
              />
            )

          case 'chart':
            return (
              <ChartBlock
                key={key}
                title={section.title}
                data={section.data || []}
                confidence={section.confidence}
                intent={section.intent}
              />
            )

          default:
            // Unknown UI type - render as text block
            return (
              <TextBlock
                key={key}
                title={section.title}
                content={`Unknown UI type "${section.ui}". Content: ${section.content || JSON.stringify(section.data)}`}
                confidence={section.confidence}
                intent={section.intent}
              />
            )
        }
      })}
    </div>
  )
}