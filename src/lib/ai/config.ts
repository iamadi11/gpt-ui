import { AIProviderConfig, AIProviderType } from './ai-provider'

/**
 * AI Configuration
 * This file contains configuration for AI providers.
 * You can override these settings using environment variables.
 */

// Default configuration - will use the best available provider
export const DEFAULT_AI_CONFIG: AIProviderConfig = {
  type: AIProviderType.MOCK // Will be overridden by environment detection
}

/**
 * Get AI configuration from environment variables
 */
export function getAIConfigFromEnv(): AIProviderConfig {
  // Check for explicit provider selection
  const explicitProvider = process.env.AI_PROVIDER?.toLowerCase()

  if (explicitProvider === 'openai') {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is required when AI_PROVIDER=openai')
    }
    return {
      type: AIProviderType.OPENAI,
      openai: {
        apiKey,
        model: process.env.OPENAI_MODEL || 'gpt-4'
      }
    }
  }

  if (explicitProvider === 'anthropic') {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is required when AI_PROVIDER=anthropic')
    }
    return {
      type: AIProviderType.ANTHROPIC,
      anthropic: {
        apiKey,
        model: process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229'
      }
    }
  }

  if (explicitProvider === 'local-llm') {
    const endpoint = process.env.LOCAL_LLM_ENDPOINT
    if (!endpoint) {
      throw new Error('LOCAL_LLM_ENDPOINT is required when AI_PROVIDER=local-llm')
    }
    return {
      type: AIProviderType.LOCAL_LLM,
      localLLM: {
        endpoint,
        model: process.env.LOCAL_LLM_MODEL
      }
    }
  }

  if (explicitProvider === 'cloud-llm') {
    const apiKey = process.env.CLOUD_LLM_API_KEY
    if (!apiKey) {
      throw new Error('CLOUD_LLM_API_KEY is required when AI_PROVIDER=cloud-llm')
    }
    return {
      type: AIProviderType.CLOUD_LLM,
      cloudLLM: {
        apiKey,
        baseURL: process.env.CLOUD_LLM_BASE_URL,
        model: process.env.CLOUD_LLM_MODEL
      }
    }
  }

  if (explicitProvider === 'mock') {
    return {
      type: AIProviderType.MOCK
    }
  }

  // If no explicit provider, use auto-detection (existing behavior)
  return DEFAULT_AI_CONFIG
}

/**
 * Validate AI configuration
 */
export function validateAIConfig(config: AIProviderConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  switch (config.type) {
    case AIProviderType.OPENAI:
      if (!config.openai?.apiKey) {
        errors.push('OpenAI API key is required')
      }
      break

    case AIProviderType.ANTHROPIC:
      if (!config.anthropic?.apiKey) {
        errors.push('Anthropic API key is required')
      }
      break

    case AIProviderType.LOCAL_LLM:
      if (!config.localLLM?.endpoint) {
        errors.push('Local LLM endpoint is required')
      }
      break

    case AIProviderType.CLOUD_LLM:
      if (!config.cloudLLM?.apiKey) {
        errors.push('Cloud LLM API key is required')
      }
      break

    case AIProviderType.MOCK:
      // Mock provider requires no configuration
      break

    default:
      errors.push(`Unknown AI provider type: ${config.type}`)
  }

  return {
    valid: errors.length === 0,
    errors
  }
}