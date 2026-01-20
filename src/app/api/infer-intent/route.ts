import { NextRequest, NextResponse } from 'next/server'
import { AIProviderFactory } from '@/lib/ai'
import { IntentGraph, AIIntentResponse, AICritiqueResponse, IntentGraphModification } from '@/types/intent-graph'

// AI-powered intent inference using abstracted AI provider
async function inferIntentWithAI(input: string): Promise<AIIntentResponse> {
  const startTime = Date.now()

  try {
    // Get the best available AI provider
    const { provider, type } = await AIProviderFactory.getBestAvailableProvider()

    // Step 1: Generate initial intent graph
    const initialIntentGraph = await provider.inferIntent(input)

    // Step 2: Generate critique and improvements (if provider supports it)
    let critiqueResponse: AICritiqueResponse | undefined
    try {
      critiqueResponse = await provider.critiqueIntentGraph(input, initialIntentGraph)
    } catch (critiqueError) {
      console.warn('Critique failed, proceeding without critique:', critiqueError)
    }

    // Step 3: Apply critique improvements if available and assessment is positive
    const finalIntentGraph = critiqueResponse && shouldApplyCritique(critiqueResponse)
      ? critiqueResponse.improvedIntentGraph
      : initialIntentGraph

    return {
      intentGraph: finalIntentGraph,
      rawInput: input,
      processingTime: Date.now() - startTime,
      modelUsed: provider.getModelName(),
      fallbackUsed: type === 'mock',
      critique: critiqueResponse
    }
  } catch (error) {
    console.error('AI inference failed:', error)

    // Fallback to minimal UI on AI failure
    return {
      intentGraph: {
        error: {
          goal: 'explore_raw',
          confidence: 0.1,
          description: 'AI inference failed, showing raw data'
        }
      },
      rawInput: input,
      processingTime: Date.now() - startTime,
      modelUsed: 'error-fallback',
      fallbackUsed: true
    }
  }
}



// Decide whether to apply the critique based on assessment
function shouldApplyCritique(critique: AICritiqueResponse): boolean {
  return critique.overallAssessment === 'needs_work' || critique.overallAssessment === 'poor'
}

// Handle intent graph modifications based on user queries
async function modifyIntentGraph(modification: IntentGraphModification): Promise<AIIntentResponse> {
  const startTime = Date.now()

  try {
    // Get the best available AI provider
    const { provider, type } = await AIProviderFactory.getBestAvailableProvider()

    // Use AI provider for modification
    const modifiedResult = await provider.modifyIntentGraph(modification)

    return {
      intentGraph: modifiedResult.intentGraph,
      rawInput: modification.originalInput,
      processingTime: Date.now() - startTime,
      modelUsed: provider.getModelName(),
      fallbackUsed: type === 'mock',
      isModification: true,
      modificationQuery: modification.query
    }
  } catch (error) {
    console.error('Intent graph modification failed:', error)

    // Return original intent graph on error
    return {
      intentGraph: modification.currentIntentGraph,
      rawInput: modification.originalInput,
      processingTime: Date.now() - startTime,
      modelUsed: 'error',
      fallbackUsed: true,
      isModification: true,
      modificationQuery: modification.query
    }
  }
}


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Check if this is a modification request
    if (body.currentIntentGraph && body.query) {
      // Handle intent graph modification
      const modification: IntentGraphModification = {
        query: body.query,
        currentIntentGraph: body.currentIntentGraph,
        originalInput: body.originalInput || body.input
      }

      const aiResponse = await modifyIntentGraph(modification)

      // Log the modification
      console.log('=== INTENT GRAPH MODIFICATION ===')
      console.log('Query:', modification.query)
      console.log('Original sections:', Object.keys(modification.currentIntentGraph))
      console.log('Modified sections:', Object.keys(aiResponse.intentGraph))
      console.log('Processing Time:', aiResponse.processingTime + 'ms')
      console.log('=================================')

      return NextResponse.json(aiResponse)
    }

    // Handle initial intent generation
    const { input } = body

    if (!input || typeof input !== 'string') {
      return NextResponse.json(
        { error: 'Input must be a non-empty string' },
        { status: 400 }
      )
    }

    // Step 1: Call AI to infer intent and generate UI graph
    const aiResponse = await inferIntentWithAI(input)

    // Step 2: Log the AI response for debugging (as required)
    console.log('=== AI INTENT INFERENCE + CRITIQUE ===')
    console.log('Input:', input.substring(0, 200) + (input.length > 200 ? '...' : ''))
    console.log('Final Intent Graph:', JSON.stringify(aiResponse.intentGraph, null, 2))
    if (aiResponse.critique) {
      console.log('Critique Assessment:', aiResponse.critique.overallAssessment)
      console.log('Critique Summary:', aiResponse.critique.critique)
      console.log('Changes Made:', aiResponse.critique.changesMade)
    }
    console.log('Processing Time:', aiResponse.processingTime + 'ms')
    console.log('Model Used:', aiResponse.modelUsed)
    console.log('Fallback Used:', aiResponse.fallbackUsed)
    console.log('====================================')

    return NextResponse.json(aiResponse)
  } catch (error) {
    console.error('Intent inference error:', error)
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
        fallbackUsed: true,
        error: 'Failed to process input'
      },
      { status: 500 }
    )
  }
}