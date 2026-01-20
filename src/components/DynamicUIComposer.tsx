import { useState } from 'react'
import { getComponentForGoal, type AINode } from './registry'
import { LowConfidenceFallback } from './LowConfidenceFallback'
import { AIIntentResponse, CONFIDENCE_THRESHOLDS, type IntentSection, type GoalType } from '@/types/intent-graph'

interface DynamicUIComposerProps {
  aiResponse: AIIntentResponse
}

// Step 4: Runtime UI composer that interprets AI intent graph
export function DynamicUIComposer({ aiResponse }: DynamicUIComposerProps) {
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())
  const [showAllLowConfidence, setShowAllLowConfidence] = useState(false)

  if (!aiResponse.intentGraph) {
    return <div className="text-gray-500">No UI to render</div>
  }

  // Convert AI intent graph to renderable nodes
  const nodes = flattenIntentGraph(aiResponse.intentGraph, aiResponse.rawInput)

  if (nodes.length === 0) {
    return (
      <div className="text-gray-500 p-4 border border-gray-200 rounded">
        <p className="font-medium">No UI sections generated</p>
        <p className="text-sm mt-1">Raw input: {aiResponse.rawInput}</p>
      </div>
    )
  }

  // Check if there are low confidence sections
  const hasLowConfidenceSections = nodes.some(node => node.confidence < CONFIDENCE_THRESHOLDS.MEDIUM)

  const toggleAllLowConfidence = () => {
    const lowConfidenceSectionNames = nodes
      .filter(node => node.confidence < CONFIDENCE_THRESHOLDS.MEDIUM)
      .map(node => node.sectionName)

    if (showAllLowConfidence) {
      // Hide all low confidence sections
      setCollapsedSections(prev => {
        const newSet = new Set(prev)
        lowConfidenceSectionNames.forEach(name => newSet.add(name))
        return newSet
      })
    } else {
      // Show all low confidence sections
      setCollapsedSections(prev => {
        const newSet = new Set(prev)
        lowConfidenceSectionNames.forEach(name => newSet.delete(name))
        return newSet
      })
    }
    setShowAllLowConfidence(!showAllLowConfidence)
  }

  const toggleSection = (sectionName: string) => {
    setCollapsedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionName)) {
        newSet.delete(sectionName)
      } else {
        newSet.add(sectionName)
      }
      return newSet
    })
  }

  return (
    <div className="space-y-6">
      {/* Global confidence controls */}
      {hasLowConfidenceSections && (
        <div className="flex justify-end">
          <button
            onClick={toggleAllLowConfidence}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            {showAllLowConfidence ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
                Hide Low Confidence
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Show All Sections
              </>
            )}
          </button>
        </div>
      )}

      {nodes.map((node, index) => {
        // Use LowConfidenceFallback for very low confidence
        if (node.confidence < CONFIDENCE_THRESHOLDS.LOW) {
          return (
            <div key={index} className="dynamic-component">
              <LowConfidenceFallback
                content={node.content}
                confidence={node.confidence}
                goal={node.goal}
              />
            </div>
          )
        }

        const Component = getComponentForGoal(node.goal)

        // Calculate confidence level and visual effects
        const confidenceLevel = node.confidence >= CONFIDENCE_THRESHOLDS.HIGH ? 'high' :
                               node.confidence >= CONFIDENCE_THRESHOLDS.MEDIUM ? 'medium' :
                               'low'

        const confidenceClass = `confidence-${confidenceLevel}`
        const isCollapsed = collapsedSections.has(node.sectionName)
        const shouldAutoCollapse = node.confidence < CONFIDENCE_THRESHOLDS.MEDIUM

        // Auto-collapse low confidence sections, but respect global setting
        const effectivelyCollapsed = shouldAutoCollapse && !showAllLowConfidence ? true :
                                   shouldAutoCollapse && showAllLowConfidence ? false :
                                   isCollapsed

        return (
          <div
            key={index}
            className={`dynamic-component p-4 border rounded-lg transition-all duration-300 ${confidenceClass} confidence-indicator ${
              node.confidence >= CONFIDENCE_THRESHOLDS.HIGH ? 'border-green-200 bg-green-50' :
              node.confidence >= CONFIDENCE_THRESHOLDS.MEDIUM ? 'border-yellow-200 bg-yellow-50' :
              'border-red-200 bg-red-50'
            }`}
            style={{ '--confidence': node.confidence } as React.CSSProperties}
          >
            <div className="flex justify-between items-center mb-3 section-header-confidence">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-gray-900 capitalize">
                  {node.sectionName.replace(/([A-Z])/g, ' $1').trim()}
                </h3>

                {/* Confidence Badge */}
                <div className={`confidence-badge inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  node.confidence >= CONFIDENCE_THRESHOLDS.HIGH ? 'bg-green-100 text-green-800 border border-green-200' :
                  node.confidence >= CONFIDENCE_THRESHOLDS.MEDIUM ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                  'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    node.confidence >= CONFIDENCE_THRESHOLDS.HIGH ? 'bg-green-500' :
                    node.confidence >= CONFIDENCE_THRESHOLDS.MEDIUM ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`} style={{
                    opacity: node.confidence / 100
                  }}></div>
                  {Math.round(node.confidence * 100)}%
                </div>

                {/* Collapse Toggle for medium/low confidence */}
                {node.confidence < CONFIDENCE_THRESHOLDS.HIGH && (
                  <button
                    onClick={() => toggleSection(node.sectionName)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                    title={effectivelyCollapsed ? "Expand section" : "Collapse section"}
                  >
                    {effectivelyCollapsed ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    )}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  Goal: {node.goal}
                </span>
              </div>
            </div>

            {/* Description */}
            {node.description && !effectivelyCollapsed && (
              <p className="text-sm text-gray-600 mb-3 italic">
                {node.description}
              </p>
            )}

            {/* Collapsible Content */}
            <div className={`collapsible-section ${
              effectivelyCollapsed ? 'collapsed' : 'expanded'
            }`}>
              {!effectivelyCollapsed && (
                <Component content={node.content} goal={node.goal} />
              )}

              {effectivelyCollapsed && (
                <div className="text-sm text-gray-500 italic border-t border-gray-200 pt-2 mt-3">
                  Click to expand this {node.confidence < CONFIDENCE_THRESHOLDS.MEDIUM ? 'lower confidence' : 'section'}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Flatten the AI intent graph into renderable nodes
function flattenIntentGraph(intentGraph: any, rawInput: string): AINode[] {
  const nodes: AINode[] = []

  function traverse(obj: any, path: string[] = []) {
    if (isIntentSection(obj)) {
      // This is a section with goal, confidence, etc.
      nodes.push({
        sectionName: path.join('.') || 'content',
        goal: obj.goal as GoalType, // Type assertion since we validated it
        content: rawInput, // Pass raw input to all components
        confidence: obj.confidence,
        description: obj.description
      })
    } else if (Array.isArray(obj)) {
      // Handle arrays of sections
      obj.forEach((item, index) => {
        if (isIntentSection(item)) {
          nodes.push({
            sectionName: `${path.join('.')}[${index}]`,
            goal: item.goal as GoalType,
            content: rawInput,
            confidence: item.confidence,
            description: item.description
          })
        }
      })
    } else if (obj && typeof obj === 'object') {
      // Recurse into nested objects
      Object.entries(obj).forEach(([key, value]) => {
        traverse(value, [...path, key])
      })
    }
  }

  traverse(intentGraph)
  return nodes
}

// Type guard to check if an object is an IntentSection
function isIntentSection(obj: any): obj is IntentSection {
  return obj &&
         typeof obj === 'object' &&
         typeof obj.goal === 'string' &&
         typeof obj.confidence === 'number' &&
         ['summarize', 'compare', 'detect_trend', 'explore_raw', 'aggregate', 'visualize', 'list', 'highlight'].includes(obj.goal)
}