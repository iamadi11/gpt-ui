'use client'

import { useState } from 'react'
import { DynamicUIComposer } from '@/components/DynamicUIComposer'

interface Intent {
  userIntent: string
  dataNature: string
  density: 'sparse' | 'medium' | 'dense'
  suggestedViews: string[]
}

interface IntentNode {
  type: 'text' | 'metric' | 'collection' | 'visual'
  content: any
  affordance: string
}

export default function Home() {
  const [input, setInput] = useState('')
  const [intentGraph, setIntentGraph] = useState<IntentNode[]>([])
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    setLoading(true)
    try {
      // Step 1: Call LLM to infer intent
      const response = await fetch('/api/infer-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      })

      const intent: Intent = await response.json()

      // Step 2: Convert intent to Intent Graph
      const graph = createIntentGraph(intent, input)
      setIntentGraph(graph)
    } catch (error) {
      console.error('Error:', error)
      // For demo purposes, create a mock intent graph
      const mockGraph: IntentNode[] = [
        { type: 'text', content: input, affordance: 'display' },
      ]
      setIntentGraph(mockGraph)
    } finally {
      setLoading(false)
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

        {intentGraph.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              Generated UI
            </h2>
            <DynamicUIComposer intentGraph={intentGraph} />
          </div>
        )}
      </div>
    </div>
  )
}

// Step 3: Convert intent to Intent Graph (array of nodes)
function createIntentGraph(intent: Intent, rawInput: string): IntentNode[] {
  const nodes: IntentNode[] = []

  // Parse input - try JSON first, fallback to text
  let parsedData: any
  try {
    parsedData = JSON.parse(rawInput)
    console.log('JSON parsed successfully:', parsedData, 'Type:', typeof parsedData)
  } catch {
    parsedData = { text: rawInput }
    console.log('JSON parse failed, using text wrapper')
  }

  // Based on data nature, create appropriate nodes
  switch (intent.dataNature) {
    case 'text':
      nodes.push({
        type: 'text',
        content: parsedData.text || parsedData,
        affordance: 'display'
      })
      break

    case 'metrics':
      console.log('Processing metrics case, dataNature:', intent.dataNature)
      // Extract numeric values as metrics
      let metrics = extractMetrics(parsedData)
      console.log('Metrics from parsedData:', metrics)

      // If no metrics found, try extracting from text (use parsedData if it's a string, otherwise rawInput)
      if (metrics.length === 0) {
        const textToAnalyze = typeof parsedData === 'string' ? parsedData : rawInput
        console.log('No metrics found, trying extractMetricsFromText on:', textToAnalyze)
        metrics = extractMetricsFromText(textToAnalyze)
        console.log('Metrics from text:', metrics)
      }

      if (metrics.length > 0) {
        metrics.forEach(metric => {
          nodes.push({
            type: 'metric',
            content: metric,
            affordance: 'highlight'
          })
        })
      } else {
        console.log('Still no metrics, falling back to text')
        // Fallback to text if no metrics found
        nodes.push({
          type: 'text',
          content: typeof parsedData === 'string' ? parsedData : rawInput,
          affordance: 'display'
        })
      }
      break

    case 'collection':
      nodes.push({
        type: 'collection',
        content: parsedData,
        affordance: 'list'
      })
      break

    case 'visual':
      nodes.push({
        type: 'visual',
        content: parsedData,
        affordance: 'chart'
      })
      break

    default:
      // Fallback to text display
      nodes.push({
        type: 'text',
        content: rawInput,
        affordance: 'display'
      })
  }

  return nodes
}

function extractMetrics(data: any): Array<{ label: string; value: number; unit?: string }> {
  const metrics: Array<{ label: string; value: number; unit?: string }> = []

  function traverse(obj: any, path: string[] = []) {
    if (typeof obj === 'number') {
      metrics.push({
        label: path.join(' ') || 'Value',
        value: obj
      })
    } else if (Array.isArray(obj)) {
      obj.forEach((item, index) => traverse(item, [...path, `[${index}]`]))
    } else if (obj && typeof obj === 'object') {
      Object.entries(obj).forEach(([key, value]) => {
        traverse(value, [...path, key])
      })
    }
  }

  traverse(data)
  return metrics.slice(0, 6) // Limit to 6 metrics for demo
}

function extractMetricsFromText(text: string): Array<{ label: string; value: number; unit?: string }> {
  const metrics: Array<{ label: string; value: number; unit?: string }> = []

  // Simple approach: find numbers and extract context manually
  const numberRegex = /(\d+(?:,\d{3})*(?:\.\d+)?)/g
  let match

  // Process the entire text for numbers
  while ((match = numberRegex.exec(text)) !== null) {
    const numberStr = match[1]
    const value = parseFloat(numberStr.replace(/,/g, ''))

    if (!isNaN(value) && value > 0) {
      // Get position in text
      const index = match.index

      // Extract context (20 chars before and after)
      const start = Math.max(0, index - 20)
      const end = Math.min(text.length, index + numberStr.length + 20)
      const context = text.slice(start, end)

      // Clean context and create label
      let label = context
        .replace(numberStr, '') // Remove the number itself
        .replace(/[^\w\s]/g, ' ') // Remove punctuation
        .replace(/\s+/g, ' ') // Normalize spaces
        .trim()
        .split(/\s+/)
        .filter(word => word.length > 1)
        .slice(0, 3)
        .join(' ')

      // Determine unit - be more precise
      let unit: string | undefined
      const lowerContext = context.toLowerCase()

      // Check for % symbol or percent/growth within close proximity to the number
      const percentNearby = lowerContext.includes('%') ||
        (lowerContext.includes('percent') && Math.abs(lowerContext.indexOf('percent') - 10) < 20) ||
        (lowerContext.includes('growth') && Math.abs(lowerContext.indexOf('growth') - 10) < 15)

      // Check for currency indicators
      const currencyNearby = lowerContext.includes('$') ||
        lowerContext.includes('dollar') ||
        lowerContext.includes('revenue') ||
        lowerContext.includes('sales')

      if (currencyNearby) {
        unit = 'USD'
      } else if (percentNearby) {
        unit = '%'
      }

      // Handle multipliers (million, billion, etc.)
      let multiplier = 1
      if (lowerContext.includes('billion')) {
        multiplier = 1000000000
      } else if (lowerContext.includes('million')) {
        multiplier = 1000000
      } else if (lowerContext.includes('thousand')) {
        multiplier = 1000
      }

      const finalValue = value * multiplier

      // Only add if we haven't seen this value before
      if (!metrics.find(m => m.value === finalValue)) {
        metrics.push({
          label: label || `Metric ${metrics.length + 1}`,
          value: finalValue,
          unit
        })
      }
    }
  }

  return metrics.slice(0, 6)
}