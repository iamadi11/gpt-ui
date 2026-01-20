import { useState } from 'react'
import { TextBlock } from './TextBlock'

interface LowConfidenceFallbackProps {
  content: any
  confidence: number
  goal: string
}

export function LowConfidenceFallback({ content, confidence, goal }: LowConfidenceFallbackProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const confidencePercent = Math.round(confidence * 100)

  return (
    <div className="border border-red-200 bg-red-50 rounded-lg p-4 confidence-very-low transition-all duration-300">
      <div className="flex justify-between items-center mb-3 section-header-confidence">
        <div className="flex items-center gap-2">
          <span className="text-red-600 text-lg">⚠️</span>
          <span className="text-sm font-medium text-red-800">
            Very Low Confidence Section
          </span>
          <div className="confidence-badge inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
            <div className="w-2 h-2 rounded-full bg-red-500" style={{
              opacity: confidence / 100
            }}></div>
            {confidencePercent}%
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-red-600 hover:text-red-800 transition-colors"
          title={isExpanded ? "Collapse raw data" : "Expand raw data"}
        >
          {isExpanded ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>
      </div>

      <div className="text-sm text-red-700 mb-3">
        The AI had very low confidence ({confidencePercent}%) in interpreting this data.
        {!isExpanded && " Click to view the raw data."}
      </div>

      <div className={`collapsible-section ${isExpanded ? 'expanded' : 'collapsed'}`}>
        {isExpanded && (
          <div className="mt-3">
            <TextBlock content={content} goal="explore_raw" />
          </div>
        )}
      </div>
    </div>
  )
}