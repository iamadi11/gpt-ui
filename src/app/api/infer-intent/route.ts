import { NextRequest, NextResponse } from 'next/server'
import { callOllama } from '@/lib/llm'
import { DEFAULT_MODEL } from '@/config/llm'

// Simple prompt for POC - optimized for small models and fast responses
const UI_INTENT_PROMPT = `Analyze this input and create a simple UI layout. Output JSON only.

Rules:
- Choose goals: summarize, visualize, list, explore_raw
- Each section needs: goal, confidence (0.0-1.0), description
- Keep it simple - 1-3 sections max

Example: {"summary":{"goal":"summarize","confidence":0.9,"description":"Key points"},"data":{"goal":"list","confidence":0.8,"description":"Raw values"}}

Input:`

// Simple API that calls Ollama directly - no abstractions, no fallbacks
export async function POST(request: NextRequest) {
  try {
    const { input, model } = await request.json()

    if (!input || typeof input !== 'string') {
      return NextResponse.json(
        { error: 'Input must be a non-empty string' },
        { status: 400 }
      )
    }

    const startTime = Date.now()
    const selectedModel = model || DEFAULT_MODEL.name

    // Call Ollama directly with simple prompt
    const prompt = `${UI_INTENT_PROMPT} ${input}`
    const response = await callOllama(selectedModel, prompt)

    // Parse AI response as JSON
    let intentGraph
    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/)
      intentGraph = jsonMatch ? JSON.parse(jsonMatch[0]) : null
    } catch (parseError) {
      // Fallback on parse error - show raw input
      intentGraph = {
        error: {
          goal: 'explore_raw',
          confidence: 0.1,
          description: 'AI parsing failed, showing raw input'
        }
      }
    }

    const result = {
      intentGraph,
      rawInput: input,
      processingTime: Date.now() - startTime,
      modelUsed: selectedModel,
      rawOutput: response.content // Include raw AI output for debugging
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Inference error:', error)
    return NextResponse.json(
      {
        intentGraph: {
          error: {
            goal: 'explore_raw',
            confidence: 0.0,
            description: 'System error, showing raw input'
          }
        },
        rawInput: '',
        processingTime: 0,
        modelUsed: 'error',
        rawOutput: '',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}