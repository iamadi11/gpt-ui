import { AIProvider } from '../ai-provider'
import { IntentGraph, AICritiqueResponse, IntentGraphModification } from '@/types/intent-graph'
import { OllamaClient, createOllamaClient } from '@/lib/llm'
import { UI_INTENT_INFERENCE_PROMPT, UI_INTENT_CRITIQUE_PROMPT, INTENT_GRAPH_MODIFICATION_PROMPT } from '@/lib/ai-prompt'

export class LocalLLMProvider implements AIProvider {
  private client: OllamaClient
  private endpoint: string

  constructor(endpoint: string, model?: string) {
    this.endpoint = endpoint
    this.client = createOllamaClient({
      endpoint,
      model: model || 'qwen2.5:7b-instruct',
    })
  }

  getModelName(): string {
    return this.client.getModelName()
  }

  isAvailable(): boolean {
    // For LocalLLM, we consider it available if endpoint is configured
    // The actual health check happens during getBestAvailableProvider()
    return Boolean(this.endpoint)
  }

  async inferIntent(input: string): Promise<IntentGraph> {
    const prompt = `${UI_INTENT_INFERENCE_PROMPT}\n\n${input}`

    // Log the prompt being sent to the model (for debugging)
    if (process.env.NODE_ENV === 'development') {
      console.log('=== AI PROMPT ===')
      console.log('Input:', input.substring(0, 200) + (input.length > 200 ? '...' : ''))
      console.log('Full Prompt Length:', prompt.length)
      console.log('=================')
    }

    const response = await this.client.generate(prompt)
    const rawOutput = response.content.trim()

    // Log raw AI output
    if (process.env.NODE_ENV === 'development') {
      console.log('=== AI RAW OUTPUT ===')
      console.log(rawOutput)
      console.log('=====================')
    }

    try {
      // Try to parse JSON from the response
      const jsonMatch = rawOutput.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response')
      }

      const parsed = JSON.parse(jsonMatch[0])

      // Extract intentGraph from the response
      if (parsed.intentGraph) {
        return parsed.intentGraph
      }

      // If the response is directly the intent graph, return it
      if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
        return parsed
      }

      throw new Error('No valid intent graph found in AI response')
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError)
      console.error('Raw output:', rawOutput)

      // Fallback: create a minimal intent graph
      return {
        raw_view: {
          goal: 'explore_raw',
          confidence: 0.1,
          description: 'AI parsing failed, showing raw data'
        }
      }
    }
  }

  async critiqueIntentGraph(input: string, intentGraph: IntentGraph): Promise<AICritiqueResponse> {
    const prompt = `${UI_INTENT_CRITIQUE_PROMPT}\n\nOriginal Input: ${input}\n\nGenerated Intent Graph:\n${JSON.stringify(intentGraph, null, 2)}`

    const response = await this.client.generate(prompt)
    const rawOutput = response.content.trim()

    try {
      const jsonMatch = rawOutput.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in critique response')
      }

      const parsed = JSON.parse(jsonMatch[0])

      // Validate required fields
      if (!parsed.critique || !parsed.improvedIntentGraph || !parsed.changesMade || !parsed.overallAssessment) {
        throw new Error('Critique response missing required fields')
      }

      return parsed
    } catch (parseError) {
      console.error('Failed to parse critique response:', parseError)

      // Return a neutral critique that keeps the original
      return {
        critique: 'AI critique parsing failed, keeping original design',
        improvedIntentGraph: intentGraph,
        changesMade: [],
        overallAssessment: 'good'
      }
    }
  }

  async modifyIntentGraph(modification: IntentGraphModification): Promise<{
    intentGraph: IntentGraph
    changes: string[]
    explanation: string
  }> {
    const prompt = `${INTENT_GRAPH_MODIFICATION_PROMPT}\n\nQuery: ${modification.query}\n\nOriginal Input: ${modification.originalInput}\n\nCurrent Intent Graph:\n${JSON.stringify(modification.currentIntentGraph, null, 2)}`

    const response = await this.client.generate(prompt)
    const rawOutput = response.content.trim()

    try {
      const jsonMatch = rawOutput.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in modification response')
      }

      const parsed = JSON.parse(jsonMatch[0])

      // Validate required fields
      if (!parsed.modifiedIntentGraph || !parsed.changes || !parsed.explanation) {
        throw new Error('Modification response missing required fields')
      }

      return {
        intentGraph: parsed.modifiedIntentGraph,
        changes: parsed.changes,
        explanation: parsed.explanation
      }
    } catch (parseError) {
      console.error('Failed to parse modification response:', parseError)

      // Return unchanged intent graph
      return {
        intentGraph: modification.currentIntentGraph,
        changes: [],
        explanation: 'AI modification failed, keeping original intent graph'
      }
    }
  }
}