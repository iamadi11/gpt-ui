import { NextRequest, NextResponse } from 'next/server'
import { callOllama } from '@/lib/llm'
import { DEFAULT_MODEL } from '@/config/llm'
import { UI_GENERATION_PROMPT } from '@/lib/prompts'
import { getCachedResult, setCachedResult } from '@/lib/cache'
import { UIDescription } from '@/components/Renderer'

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

    if (!input || typeof input !== 'string') {
      return NextResponse.json(
        { error: 'Input must be a non-empty string' },
        { status: 400 }
      )
    }

    const startTime = Date.now()
    const selectedModel = model || DEFAULT_MODEL.name

    // CACHE CHECK: Avoid expensive AI calls for repeated inputs
    const cachedResult = getCachedResult(input, selectedModel)
    if (cachedResult) {
      return NextResponse.json({
        uiDescription: cachedResult.uiDescription,
        rawInput: input,
        processingTime: 0, // Cached result
        modelUsed: selectedModel,
        cached: true,
        rawOutput: null
      })
    }

    // AI CALL: Generate UI description using local LLM
    const prompt = `${UI_GENERATION_PROMPT}\n\n${input}`
    const response = await callOllama(selectedModel, prompt)

    // PARSE AI RESPONSE: Robust JSON extraction and validation
    let uiDescription: UIDescription | null = null
    let parseError: string | null = null

    try {
      let jsonContent = response.content

      // Step 1: Strip markdown code blocks if present
      jsonContent = jsonContent.replace(/```(?:json)?\s*\n?/g, '').replace(/\n?```\s*$/g, '')

      // Step 2: Find JSON object (most complete match)
      const jsonMatches = jsonContent.match(/\{[\s\S]*\}/g)
      if (!jsonMatches || jsonMatches.length === 0) {
        parseError = 'No JSON object found in AI response'
      } else {
        // Try each JSON match, starting with the longest/most complete
        const sortedMatches = jsonMatches.sort((a, b) => b.length - a.length)

        for (const jsonMatch of sortedMatches) {
          try {
            // Step 3: Fix common AI mistakes
            let cleanedJson = jsonMatch

            // Fix malformed numbers (like 00.98 -> 0.98)
            cleanedJson = cleanedJson.replace(/:\s*0+(\d)/g, ': $1')

            // Fix trailing commas
            cleanedJson = cleanedJson.replace(/,(\s*[}\]])/g, '$1')

            const parsed = JSON.parse(cleanedJson)

            // Step 4: Validate structure
            if (typeof parsed.confidence === 'number' &&
                typeof parsed.layout === 'string' &&
                Array.isArray(parsed.sections)) {

              // Validate sections
              const validSections = parsed.sections.filter((section: any) =>
                typeof section.title === 'string' &&
                typeof section.intent === 'string' &&
                typeof section.ui === 'string' &&
                typeof section.confidence === 'number' &&
                ['text', 'card', 'table', 'chart'].includes(section.ui)
              )

              if (validSections.length > 0) {
                uiDescription = {
                  ...parsed,
                  sections: validSections
                } as UIDescription
                break // Success - use this parse
              } else {
                parseError = 'No valid sections found in JSON'
              }
            } else {
              parseError = 'Invalid JSON structure - missing required fields'
            }
          } catch (parseAttemptError) {
            // Continue to next match
            continue
          }
        }

        if (!uiDescription) {
          parseError = parseError || 'All JSON parsing attempts failed'
        }
      }
    } catch (error) {
      parseError = `JSON parsing setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }

    // CACHE SUCCESSFUL RESULTS: Store valid UI descriptions
    if (uiDescription) {
      setCachedResult(input, selectedModel, uiDescription)
    }

    const result = {
      uiDescription,
      rawInput: input,
      processingTime: Date.now() - startTime,
      modelUsed: selectedModel,
      cached: false,
      rawOutput: response.content, // For debugging
      parseError // Include parse errors for debugging
    }

    return NextResponse.json(result)
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