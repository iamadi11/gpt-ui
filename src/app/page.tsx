'use client'

import { useState } from 'react'
import { OutputRenderer } from '@/components/OutputRenderer'
import { AVAILABLE_MODELS, DEFAULT_MODEL, getModelByName } from '@/config/llm'

interface AIResponse {
  intentGraph: any
  rawInput: string
  processingTime: number
  modelUsed: string
  rawOutput?: string
  error?: string
}

export default function Home() {
  const [input, setInput] = useState('')
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL.name)
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/infer-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, model: selectedModel }),
      })

      const data: AIResponse = await response.json()
      setAiResponse(data)
    } catch (error) {
      console.error('Error:', error)
      // Fallback on error
      const fallbackResponse: AIResponse = {
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
        rawOutput: '',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
      setAiResponse(fallbackResponse)
    } finally {
      setLoading(false)
    }
  }

  const currentModel = getModelByName(selectedModel)

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">
          Dynamic UI POC
        </h1>
        <p className="text-gray-600 mb-8">
          AI-driven dynamic UI using local LLM (Ollama only)
        </p>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model Selection
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {AVAILABLE_MODELS.map((model) => (
                  <option key={model.name} value={model.name}>
                    {model.displayName} - {model.memoryUsage} - {model.description}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Larger models = slower + more memory. {!currentModel.recommended && '⚠️ May exceed 2GB limit'}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Input any text or JSON:
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste any text, JSON, or data here..."
                className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Generating...' : 'Generate UI'}
            </button>
          </form>
        </div>

        <OutputRenderer aiResponse={aiResponse} />
      </div>
    </div>
  )
}
