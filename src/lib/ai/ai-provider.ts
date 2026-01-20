import { IntentGraph, AICritiqueResponse, IntentGraphModification } from '@/types/intent-graph'

// AI Provider Interface
export interface AIProvider {
  /**
   * Generate an intent graph from raw input
   */
  inferIntent(input: string): Promise<IntentGraph>

  /**
   * Generate a critique of an existing intent graph
   */
  critiqueIntentGraph(input: string, intentGraph: IntentGraph): Promise<AICritiqueResponse>

  /**
   * Modify an existing intent graph based on a user query
   */
  modifyIntentGraph(modification: IntentGraphModification): Promise<{
    intentGraph: IntentGraph
    changes: string[]
    explanation: string
  }>

  /**
   * Get the name of the AI model being used
   */
  getModelName(): string

  /**
   * Check if this provider is available (has required API keys, etc.)
   */
  isAvailable(): boolean
}

// AI Provider Types
export enum AIProviderType {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  LOCAL_LLM = 'local-llm',
  MOCK = 'mock'
}

// Configuration for AI providers
export interface AIProviderConfig {
  type: AIProviderType
  openai?: {
    apiKey: string
    model?: string
  }
  anthropic?: {
    apiKey: string
    model?: string
  }
  localLLM?: {
    endpoint: string
    model?: string
  }
}