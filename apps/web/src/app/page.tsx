'use client'

import { useState } from 'react'
import { UIRenderer, useUIRuntime } from '@gpt-ui/ui-runtime'
import { DEFAULT_OLLAMA_PROVIDER } from '@gpt-ui/llm-engine'
import { getCacheStats, clearCache } from '@gpt-ui/cache'
import type { UIInferenceResponse } from '@gpt-ui/schema'

export default function Home() {
  const [input, setInput] = useState('')
  const [selectedModel, setSelectedModel] = useState('phi3:mini')
  const [aiResponse, setAiResponse] = useState<UIInferenceResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [showDebug, setShowDebug] = useState(false)

  const runtime = useUIRuntime({
    density: 'normal',
    enableValidation: true
  })

  const availableModels = DEFAULT_OLLAMA_PROVIDER.capabilities.supportedModels

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    setLoading(true)
    try {
      console.log('Sending to API:', { input, model: selectedModel })
      const response = await fetch('/api/infer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input,
          model: selectedModel
        }),
      })

      const data: UIInferenceResponse = await response.json()
      console.log('API response:', data)
      setAiResponse(data)
    } catch (error) {
      console.error('Error:', error)
      // Fallback on error
      const fallbackResponse: UIInferenceResponse = {
        uiDescription: null,
        rawInput: input,
        processingTime: 0,
        modelUsed: 'error',
        cached: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
      setAiResponse(fallbackResponse)
    } finally {
      setLoading(false)
    }
  }

  const handleClearCache = () => {
    clearCache()
    alert('Cache cleared')
  }

  const currentModel = availableModels.find(m => m.name === selectedModel)
  const cacheStats = getCacheStats()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">
            AI-Generated Dynamic UI
          </h1>
          <p className="text-gray-600 mb-4">
            The AI model acts as UI designer - frontend only executes AI decisions
          </p>
          <div className="text-sm text-gray-500 space-y-1">
            <p><strong>Philosophy:</strong> Intelligence over rules • Adaptability over precision • Trust over control</p>
            <p><strong>Boundaries:</strong> AI decides UI • Frontend executes only • No data interpretation • No heuristic decisions</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <form onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Local LLM Model
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {availableModels.map((model) => (
                    <option key={model.name} value={model.name}>
                      {model.displayName} - {model.memoryUsage}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {!currentModel?.recommended && '⚠️ May exceed 2GB memory limit'}
                </p>
              </div>

              <div className="flex items-end gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'AI Generating...' : 'Generate UI'}
                </button>
                <button
                  type="button"
                  onClick={handleClearCache}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  title="Clear AI response cache"
                >
                  🗑️
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Any Input (Text, JSON, Data)
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste any text, JSON, CSV, or arbitrary data here. The AI will decide how to present it..."
                className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
              />
            </div>

            <div className="text-xs text-gray-500">
              Cache: {cacheStats.size} entries • No field assumptions • No data interpretation • AI decides everything
            </div>
          </form>
        </div>

        {aiResponse && (
          <div className="mb-6">
            <UIRenderer
              uiDescription={aiResponse.uiDescription}
              runtime={runtime}
            />
          </div>
        )}

        {/* Debug Panel */}
        {aiResponse && (
          <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold">Debug Information</h3>
              <button
                onClick={() => setShowDebug(!showDebug)}
                className="text-gray-400 hover:text-white text-xs"
              >
                {showDebug ? 'Hide' : 'Show'} Debug
              </button>
            </div>

            <div className="space-y-2">
              <div>Model: <span className="text-blue-400">{aiResponse.modelUsed}</span></div>
              <div>Time: <span className="text-yellow-400">{aiResponse.processingTime}ms</span></div>
              <div>Cache: <span className={aiResponse.cached ? 'text-green-400' : 'text-red-400'}>
                {aiResponse.cached ? 'HIT' : 'MISS'}
              </span></div>
              {aiResponse.metadata?.tokenUsage && (
                <div>Tokens: <span className="text-purple-400">
                  {aiResponse.metadata.tokenUsage.total} ({aiResponse.metadata.tokenUsage.prompt}p + {aiResponse.metadata.tokenUsage.completion}c)
                </span></div>
              )}
            </div>

            {showDebug && (
              <div className="mt-4 space-y-3">
                {aiResponse.error && (
                  <div>
                    <div className="text-red-400">Error:</div>
                    <div className="text-red-300 bg-red-900/20 p-2 rounded text-xs">
                      {aiResponse.error}
                    </div>
                  </div>
                )}

                {aiResponse.rawOutput && (
                  <div>
                    <div className="text-blue-400">Raw AI Output:</div>
                    <pre className="text-gray-300 bg-gray-800 p-2 rounded text-xs overflow-x-auto whitespace-pre-wrap">
                      {aiResponse.rawOutput}
                    </pre>
                  </div>
                )}

                <div>
                  <div className="text-purple-400">Final UI Description:</div>
                  <pre className="text-gray-300 bg-gray-800 p-2 rounded text-xs overflow-x-auto">
                    {JSON.stringify(aiResponse.uiDescription, null, 2)}
                  </pre>
                </div>

                {aiResponse.metadata && (
                  <div>
                    <div className="text-cyan-400">Metadata:</div>
                    <pre className="text-gray-300 bg-gray-800 p-2 rounded text-xs overflow-x-auto">
                      {JSON.stringify(aiResponse.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Example Inputs */}
        <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Example Inputs to Try:</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <button
                onClick={() => setInput('Sales increased 15% this quarter to $2.5M')}
                className="w-full text-left p-3 border border-gray-200 rounded hover:bg-gray-50"
              >
                <strong>Business Metric:</strong><br />
                "Sales increased 15% this quarter to $2.5M"
              </button>
            </div>

            <div>
              <button
                onClick={() => setInput('{"users": 1250, "revenue": 45000, "growth": 0.12}')}
                className="w-full text-left p-3 border border-gray-200 rounded hover:bg-gray-50"
              >
                <strong>JSON Data:</strong><br />
                {"{users: 1250, revenue: 45000, growth: 0.12}"}
              </button>
            </div>

            <div>
              <button
                onClick={() => setInput('Product A: 45 units @ $10 = $450\nProduct B: 23 units @ $25 = $575\nTotal: $1025')}
                className="w-full text-left p-3 border border-gray-200 rounded hover:bg-gray-50"
              >
                <strong>Structured Text:</strong><br />
                Product sales data in text format
              </button>
            </div>

            <div>
              <button
                onClick={() => setInput('The weather today is sunny with a high of 75°F and low of 55°F. Chance of rain is 10%.')}
                className="w-full text-left p-3 border border-gray-200 rounded hover:bg-gray-50"
              >
                <strong>Unstructured Text:</strong><br />
                Weather information
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
