'use client'

import { useState } from 'react'
import { DynamicUIComposer } from '@/components/DynamicUIComposer'
import { AIIntentResponse, CONFIDENCE_THRESHOLDS } from '@/types/intent-graph'

export default function Home() {
  const [input, setInput] = useState('')
  const [aiResponse, setAiResponse] = useState<AIIntentResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [followUpQuery, setFollowUpQuery] = useState('')
  const [modifying, setModifying] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    setLoading(true)
    try {
      // Step 1: Call AI to generate intent graph
      const response = await fetch('/api/infer-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      })

      const aiResponse: AIIntentResponse = await response.json()
      setAiResponse(aiResponse)
      setFollowUpQuery('') // Clear any previous follow-up query
    } catch (error) {
      console.error('Error:', error)
      // Fallback on error
      const fallbackResponse: AIIntentResponse = {
        intentGraph: {
          error: {
            goal: 'explore_raw',
            confidence: 0.0,
            description: 'Error occurred, showing raw input'
          }
        },
        rawInput: input,
        processingTime: 0,
        modelUsed: 'error',
        fallbackUsed: true
      }
      setAiResponse(fallbackResponse)
    } finally {
      setLoading(false)
    }
  }

  const handleFollowUpQuery = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!followUpQuery.trim() || !aiResponse) return

    setModifying(true)
    try {
      const response = await fetch('/api/infer-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: followUpQuery,
          currentIntentGraph: aiResponse.intentGraph,
          originalInput: aiResponse.rawInput
        }),
      })

      const modifiedResponse: AIIntentResponse = await response.json()
      setAiResponse(modifiedResponse)
      setFollowUpQuery('')
    } catch (error) {
      console.error('Modification error:', error)
    } finally {
      setModifying(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">
          Dynamic UI System
        </h1>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <form onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Input any text or JSON:
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste any text, JSON, or data here..."
              className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Generating UI...' : 'Generate Dynamic UI'}
            </button>
          </form>
        </div>

        {aiResponse && (
          <div className="space-y-6">
            {/* Follow-up Query Input */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Refine the UI
              </h3>
              <form onSubmit={handleFollowUpQuery}>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={followUpQuery}
                    onChange={(e) => setFollowUpQuery(e.target.value)}
                    placeholder="e.g., 'show only metrics', 'hide charts', 'add summary', 'simplify'"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={modifying}
                  />
                  <button
                    type="submit"
                    disabled={modifying || !followUpQuery.trim()}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {modifying ? 'Refining...' : 'Refine'}
                  </button>
                </div>
              </form>

              {/* Query Examples */}
              <div className="mt-3 text-sm text-gray-600">
                <span className="font-medium">Try:</span>
                <button
                  onClick={() => setFollowUpQuery('show only metrics')}
                  className="ml-2 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs"
                >
                  show only metrics
                </button>
                <button
                  onClick={() => setFollowUpQuery('hide charts')}
                  className="ml-2 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs"
                >
                  hide charts
                </button>
                <button
                  onClick={() => setFollowUpQuery('add summary')}
                  className="ml-2 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs"
                >
                  add summary
                </button>
                <button
                  onClick={() => setFollowUpQuery('simplify')}
                  className="ml-2 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs"
                >
                  simplify
                </button>
              </div>
            </div>

            {/* Generated UI */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {aiResponse.isModification ? 'Refined AI UI' : 'AI-Generated UI'}
                  {aiResponse.modificationQuery && (
                    <span className="text-sm font-normal text-gray-600 ml-2">
                      (Query: "{aiResponse.modificationQuery}")
                    </span>
                  )}
                </h2>
                <div className="text-sm text-gray-500">
                  Model: {aiResponse.modelUsed} | Time: {aiResponse.processingTime}ms
                  {aiResponse.fallbackUsed && <span className="ml-2 text-orange-500">(Mock)</span>}
                </div>
              </div>

              {/* AI Response Debug Info */}
              <details className="mb-4 p-3 bg-gray-50 rounded text-sm">
                <summary className="cursor-pointer font-medium text-gray-700">
                  AI Reasoning Details
                </summary>
                <div className="mt-2 space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-800">Final Intent Graph:</h4>
                    <pre className="mt-1 text-xs overflow-auto bg-white p-2 rounded border">
                      {JSON.stringify(aiResponse.intentGraph, null, 2)}
                    </pre>
                  </div>

                  {aiResponse.critique && (
                    <div>
                      <h4 className="font-medium text-gray-800">AI Critique & Improvements:</h4>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium">Assessment:</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            aiResponse.critique.overallAssessment === 'excellent' ? 'bg-green-100 text-green-800' :
                            aiResponse.critique.overallAssessment === 'good' ? 'bg-blue-100 text-blue-800' :
                            aiResponse.critique.overallAssessment === 'needs_work' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {aiResponse.critique.overallAssessment.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>

                        <div>
                          <span className="text-xs font-medium">Critique:</span>
                          <p className="text-xs text-gray-600 mt-1">{aiResponse.critique.critique}</p>
                        </div>

                        {aiResponse.critique.changesMade.length > 0 && (
                          <div>
                            <span className="text-xs font-medium">Changes Made:</span>
                            <ul className="text-xs text-gray-600 mt-1 list-disc list-inside">
                              {aiResponse.critique.changesMade.map((change, index) => (
                                <li key={index}>{change}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </details>

              <DynamicUIComposer aiResponse={aiResponse} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
