import { NextRequest, NextResponse } from 'next/server'
import { LLMEngine, DEFAULT_ENGINE_OPTIONS } from '@gpt-ui/llm-engine'
import { getCachedUIDescription, setCachedUIDescription, initializeCache, DEFAULT_CACHE_CONFIG } from '@gpt-ui/cache'
import type { UIInferenceRequest } from '@gpt-ui/schema'

// Initialize cache on module load
initializeCache(DEFAULT_CACHE_CONFIG)

// API Route: AI UI Generation Service
//
// RESPONSIBILITIES:
// - Check cache before calling expensive AI
// - Call local LLM with UI generation prompt
// - Parse AI response into UIDescription format
// - Cache successful results
// - Return UI description for frontend rendering
//
// CACHE BOUNDARIES:
// - Cache key = hash(input + model)
// - Cache hit = return cached UI description
// - Cache miss = call AI, then cache result
// - No cache invalidation - clears on reload

export async function POST(request: NextRequest) {
  try {
    const { input, model } = await request.json()
    console.log('API received:', { input, model })

    if (!input || typeof input !== 'string') {
      return NextResponse.json(
        { error: 'Input must be a non-empty string' },
        { status: 400 }
      )
    }

    // Initialize LLM engine
    const engine = new LLMEngine(DEFAULT_ENGINE_OPTIONS)

    // CACHE CHECK: Avoid expensive AI calls for repeated inputs
    const cachedResult = getCachedUIDescription(input, model)
    if (cachedResult) {
      return NextResponse.json({
        uiDescription: cachedResult,
        rawInput: input,
        processingTime: 0, // Cached result
        modelUsed: model,
        cached: true,
        rawOutput: null,
        metadata: {
          cacheKey: `cached-${Date.now()}`
        }
      })
    }

    // AI CALL: Generate UI description using LLM engine
    const inferenceRequest: UIInferenceRequest = {
      input,
      model,
      config: {
        temperature: 0.3,
        maxTokens: 256,
        timeout: 180000
      }
    }

    const response = await engine.inferUI(inferenceRequest)

    // CACHE SUCCESSFUL RESULTS: Store valid UI descriptions
    if (response.uiDescription) {
      setCachedUIDescription(input, model || 'phi3:mini', response.uiDescription)
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Inference error:', error)
    return NextResponse.json(
      {
        uiDescription: null,
        rawInput: '',
        processingTime: 0,
        modelUsed: 'error',
        cached: false,
        rawOutput: '',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}