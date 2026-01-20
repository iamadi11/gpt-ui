import { AIProvider } from '../ai-provider'
import { IntentGraph, AICritiqueResponse, IntentGraphModification } from '@/types/intent-graph'
import { UI_INTENT_INFERENCE_PROMPT, UI_INTENT_CRITIQUE_PROMPT, INTENT_GRAPH_MODIFICATION_PROMPT } from '@/lib/ai-prompt'

export class CloudLLMProvider implements AIProvider {
  private apiKey: string
  private baseURL: string
  private model: string

  constructor(apiKey: string, baseURL: string = 'https://api.openai.com/v1', model: string = 'gpt-4o-mini') {
    this.apiKey = apiKey
    this.baseURL = baseURL
    this.model = model
  }

  getModelName(): string {
    return this.model
  }

  isAvailable(): boolean {
    return Boolean(this.apiKey)
  }

  async inferIntent(input: string): Promise<IntentGraph> {
    const prompt = `${UI_INTENT_INFERENCE_PROMPT}\n\n${input}`

    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 1024,
      }),
    })

    if (!response.ok) {
      throw new Error(`Cloud LLM API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content || ''

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }

      const parsed = JSON.parse(jsonMatch[0])
      return parsed.intentGraph || parsed
    } catch (parseError) {
      console.error('Failed to parse response:', parseError)
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

    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 1024,
      }),
    })

    if (!response.ok) {
      throw new Error(`Cloud LLM API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content || ''

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in critique response')
      }

      return JSON.parse(jsonMatch[0])
    } catch (parseError) {
      console.error('Failed to parse critique response:', parseError)
      return {
        critique: 'AI critique parsing failed',
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

    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 1024,
      }),
    })

    if (!response.ok) {
      throw new Error(`Cloud LLM API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content || ''

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in modification response')
      }

      const parsed = JSON.parse(jsonMatch[0])
      return {
        intentGraph: parsed.modifiedIntentGraph,
        changes: parsed.changes,
        explanation: parsed.explanation
      }
    } catch (parseError) {
      console.error('Failed to parse modification response:', parseError)
      return {
        intentGraph: modification.currentIntentGraph,
        changes: [],
        explanation: 'AI modification failed'
      }
    }
  }
}