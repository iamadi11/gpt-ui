import { NextRequest, NextResponse } from 'next/server'
import { LLMEngine, DEFAULT_ENGINE_OPTIONS } from '@gpt-ui/llm-engine'
import { getCachedUIDescription, setCachedUIDescription, initializeCache, DEFAULT_CACHE_CONFIG, invalidateStaleCacheEntries } from '@gpt-ui/cache'
import type { UIInferenceRequest } from '@gpt-ui/schema'
import { createHash } from 'crypto'

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

    // PERFORMANCE GUARD: Reject inputs that are too large
    const MAX_INPUT_SIZE = 200 * 1024 // 200KB limit
    if (input.length > MAX_INPUT_SIZE) {
      return NextResponse.json(
        { error: `Input too large. Maximum size is ${MAX_INPUT_SIZE} characters (${Math.round(MAX_INPUT_SIZE/1024)}KB)` },
        { status: 400 }
      )
    }

    // Initialize LLM engine
    const engine = new LLMEngine(DEFAULT_ENGINE_OPTIONS)

    // CACHE INVALIDATION: Clear stale entries on config changes
    const currentConfig = {
      temperature: 0.3,
      maxTokens: 256,
      timeout: 180000
    }
    const configHash = createHash('sha256').update(JSON.stringify(currentConfig)).digest('hex')
    invalidateStaleCacheEntries(configHash)

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
    // PERFORMANCE GUARD: Use shorter timeout for guaranteed <2s response
    const inferenceRequest: UIInferenceRequest = {
      input,
      model,
      config: {
        temperature: 0.3,
        maxTokens: 256,
        timeout: 1500 // 1.5s timeout to guarantee <2s total response
      }
    }

    const response = await engine.inferUI(inferenceRequest)

    // PERFORMANCE GUARD: Check processing time (should be < 2s)
    if (response.processingTime > 2000) {
      console.warn(`Performance violation: UI generation took ${response.processingTime}ms (> 2000ms limit)`)
      // Still allow the response but log the violation
    }

    // Debug logging
    console.log('=== API RESPONSE DEBUG ===')
    console.log('Raw output length:', response.rawOutput?.length || 0)
    console.log('Raw output preview:', response.rawOutput?.substring(0, 500))
    console.log('Processing time:', response.processingTime, 'ms')
    console.log('Has error:', !!response.error)
    console.log('Has uiDescription:', !!response.uiDescription)
    console.log('========================')

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