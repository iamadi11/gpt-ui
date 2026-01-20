import { AIProvider } from '../ai-provider'
import { IntentGraph, AICritiqueResponse, IntentGraphModification } from '@/types/intent-graph'
import { UI_INTENT_INFERENCE_PROMPT, UI_INTENT_CRITIQUE_PROMPT, INTENT_GRAPH_MODIFICATION_PROMPT } from '@/lib/ai-prompt'

export class OpenAIProvider implements AIProvider {
  private apiKey: string
  private model: string

  constructor(apiKey: string, model: string = 'gpt-4') {
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

    const response = await this.callOpenAI(prompt)

    try {
      // Extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }

      const parsed = JSON.parse(jsonMatch[0])
      return parsed.intentGraph || parsed
    } catch (error) {
      console.error('Failed to parse OpenAI response:', error)
      throw new Error('Invalid response format from OpenAI')
    }
  }

  async critiqueIntentGraph(input: string, intentGraph: IntentGraph): Promise<AICritiqueResponse> {
    const prompt = `${UI_INTENT_CRITIQUE_PROMPT}\n\nOriginal Input: ${input}\n\nGenerated Intent Graph:\n${JSON.stringify(intentGraph, null, 2)}\n\nCritique Response:`

    const response = await this.callOpenAI(prompt)

    try {
      // Extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }

      const parsed = JSON.parse(jsonMatch[0])
      return parsed
    } catch (error) {
      console.error('Failed to parse OpenAI critique response:', error)
      throw new Error('Invalid critique response format from OpenAI')
    }
  }

  async modifyIntentGraph(modification: IntentGraphModification): Promise<{
    intentGraph: IntentGraph
    changes: string[]
    explanation: string
  }> {
    const { query, currentIntentGraph, originalInput } = modification

    const prompt = `${INTENT_GRAPH_MODIFICATION_PROMPT}\n\nOriginal Input: ${originalInput}\n\nCurrent Intent Graph:\n${JSON.stringify(currentIntentGraph, null, 2)}\n\nModification Query: "${query}"\n\nModified Response:`

    const response = await this.callOpenAI(prompt)

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
      console.error('Failed to parse OpenAI modification response:', error)
      throw new Error('Invalid modification response format from OpenAI')
    }
  }

  private async callOpenAI(prompt: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      throw new Error('No content in OpenAI response')
    }

    return content
  }
}