import { useState } from 'react'

interface OutputRendererProps {
  aiResponse: {
    intentGraph: any
    rawInput: string
    processingTime: number
    modelUsed: string
    rawOutput?: string
    error?: string
  } | null
}

// Simple renderer for AI intent output - shows raw AI response for POC
export function OutputRenderer({ aiResponse }: OutputRendererProps) {
  const [showRaw, setShowRaw] = useState(false)

  if (!aiResponse) return null

  return (
    <div className="mt-8 space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            AI Response
          </h2>
          <div className="text-sm text-gray-500">
            Model: {aiResponse.modelUsed} | Time: {aiResponse.processingTime}ms
          </div>
        </div>

        {/* Intent Graph Display */}
        {aiResponse.intentGraph && (
          <div className="space-y-3">
            <h3 className="font-medium text-gray-800">UI Sections:</h3>
            {Object.entries(aiResponse.intentGraph).map(([sectionName, section]: [string, any]) => (
              <div key={sectionName} className="border border-gray-200 rounded p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium capitalize">{sectionName}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{section.goal}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      section.confidence > 0.8 ? 'bg-green-100 text-green-800' :
                      section.confidence > 0.6 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {Math.round(section.confidence * 100)}%
                    </span>
                  </div>
                </div>
                {section.description && (
                  <p className="text-sm text-gray-600">{section.description}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Raw Input Fallback */}
        {(!aiResponse.intentGraph || Object.keys(aiResponse.intentGraph).includes('error')) && (
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <h4 className="font-medium text-gray-800 mb-2">Raw Input:</h4>
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
              {aiResponse.rawInput}
            </pre>
          </div>
        )}

        {/* Debug Info */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={() => setShowRaw(!showRaw)}
            className="text-sm text-gray-600 hover:text-gray-800 underline"
          >
            {showRaw ? 'Hide' : 'Show'} Raw AI Output
          </button>

          {showRaw && (
            <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
              <pre className="whitespace-pre-wrap text-gray-700">
                {aiResponse.rawOutput || 'No raw output available'}
              </pre>
            </div>
          )}

          {aiResponse.error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              Error: {aiResponse.error}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}