import { AIProvider } from '../ai-provider'
import { IntentGraph, AICritiqueResponse, IntentGraphModification } from '@/types/intent-graph'
import { UI_INTENT_INFERENCE_PROMPT, UI_INTENT_CRITIQUE_PROMPT, INTENT_GRAPH_MODIFICATION_PROMPT } from '@/lib/ai-prompt'

export class AnthropicProvider implements AIProvider {
  private apiKey: string
  private model: string

  constructor(apiKey: string, model: string = 'claude-3-sonnet-20240229') {
    this.apiKey = apiKey
    this.model = model
  }

  getModelName(): string {
    return this.model
  }

  isAvailable(): boolean {
    return Boolean(this.apiKey)
  }

  async inferIntent(input: string): Promise<IntentGraph> {
    const prompt = `${UI_INTENT_INFERENCE_PROMPT}\n\nInput: ${input}\n\nIntent Graph:`

    const response = await this.callAnthropic(prompt)

    try {
      // Extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }

      const parsed = JSON.parse(jsonMatch[0])
      return parsed.intentGraph || parsed
    } catch (error) {
      console.error('Failed to parse Anthropic response:', error)
      throw new Error('Invalid response format from Anthropic')
    }
  }

  async critiqueIntentGraph(input: string, intentGraph: IntentGraph): Promise<AICritiqueResponse> {
    const prompt = `${UI_INTENT_CRITIQUE_PROMPT}\n\nOriginal Input: ${input}\n\nGenerated Intent Graph:\n${JSON.stringify(intentGraph, null, 2)}\n\nCritique Response:`

    const response = await this.callAnthropic(prompt)

    try {
      // Extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }

      const parsed = JSON.parse(jsonMatch[0])
      return parsed
    } catch (error) {
      console.error('Failed to parse Anthropic critique response:', error)
      throw new Error('Invalid critique response format from Anthropic')
    }
  }

  async modifyIntentGraph(modification: IntentGraphModification): Promise<{
    intentGraph: IntentGraph
    changes: string[]
    explanation: string
  }> {
    const { query, currentIntentGraph, originalInput } = modification

    const prompt = `${INTENT_GRAPH_MODIFICATION_PROMPT}\n\nOriginal Input: ${originalInput}\n\nCurrent Intent Graph:\n${JSON.stringify(currentIntentGraph, null, 2)}\n\nModification Query: "${query}"\n\nModified Response:`

    const response = await this.callAnthropic(prompt)

    try {
      // Extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }

      const parsed = JSON.parse(jsonMatch[0])
      return {
        intentGraph: parsed.modifiedIntentGraph,
        changes: parsed.changes || [],
        explanation: parsed.explanation || 'Intent graph modified successfully'
      }
    } catch (error) {
      console.error('Failed to parse Anthropic modification response:', error)
      throw new Error('Invalid modification response format from Anthropic')
    }
  }

  private async callAnthropic(prompt: string): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Anthropic API error: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`)
    }

    const data = await response.json()
    const content = data.content?.[0]?.text

    if (!content) {
      throw new Error('No content in Anthropic response')
    }

    return content
  }
}