import { AIProvider, AIProviderType, AIProviderConfig } from './ai-provider'
import { OpenAIProvider } from './providers/openai-provider'
import { AnthropicProvider } from './providers/anthropic-provider'
import { LocalLLMProvider } from './providers/local-llm-provider'
import { CloudLLMProvider } from './providers/cloud-llm-provider'
import { MockProvider } from './providers/mock-provider'

export class AIProviderFactory {
  /**
   * Create an AI provider based on configuration
   */
  static createProvider(config: AIProviderConfig): AIProvider {
    switch (config.type) {
      case AIProviderType.OPENAI:
        if (!config.openai?.apiKey) {
          throw new Error('OpenAI API key is required')
        }
        return new OpenAIProvider(config.openai.apiKey, config.openai.model)

      case AIProviderType.ANTHROPIC:
        if (!config.anthropic?.apiKey) {
          throw new Error('Anthropic API key is required')
        }
        return new AnthropicProvider(config.anthropic.apiKey, config.anthropic.model)

      case AIProviderType.LOCAL_LLM:
        if (!config.localLLM?.endpoint) {
          throw new Error('Local LLM endpoint is required')
        }
        return new LocalLLMProvider(config.localLLM.endpoint, config.localLLM.model)

      case AIProviderType.CLOUD_LLM:
        if (!config.cloudLLM?.apiKey) {
          throw new Error('Cloud LLM API key is required')
        }
        return new CloudLLMProvider(
          config.cloudLLM.apiKey,
          config.cloudLLM.baseURL,
          config.cloudLLM.model
        )

      case AIProviderType.MOCK:
        return new MockProvider()

      default:
        throw new Error(`Unknown AI provider type: ${config.type}`)
    }
  }

  /**
   * Create a provider based on environment variables
   * This maintains backward compatibility with existing code
   */
  static createProviderFromEnv(): AIProvider {
    // Check for OpenAI
    const openaiKey = process.env.OPENAI_API_KEY
    if (openaiKey) {
      const model = process.env.OPENAI_MODEL || 'gpt-4'
      return new OpenAIProvider(openaiKey, model)
    }

    // Check for Anthropic
    const anthropicKey = process.env.ANTHROPIC_API_KEY
    if (anthropicKey) {
      const model = process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229'
      return new AnthropicProvider(anthropicKey, model)
    }

    // Check for Local LLM
    const localEndpoint = process.env.LOCAL_LLM_ENDPOINT
    if (localEndpoint) {
      const model = process.env.LOCAL_LLM_MODEL
      return new LocalLLMProvider(localEndpoint, model)
    }

    // Check for Cloud LLM (OpenAI-compatible)
    const cloudApiKey = process.env.CLOUD_LLM_API_KEY
    if (cloudApiKey) {
      const baseURL = process.env.CLOUD_LLM_BASE_URL || 'https://api.openai.com/v1'
      const model = process.env.CLOUD_LLM_MODEL || 'gpt-4o-mini'
      return new CloudLLMProvider(cloudApiKey, baseURL, model)
    }

    // Default to mock provider
    return new MockProvider()
  }

  /**
   * Get the best available provider based on environment
   * Prioritizes local LLM (Ollama) for cost-free, offline operation
   */
  static async getBestAvailableProvider(): Promise<{ provider: AIProvider; type: AIProviderType }> {
    // For local LLM, we can try to use Ollama directly without explicit env vars
    const localEndpoint = process.env.LOCAL_LLM_ENDPOINT || 'http://localhost:11434/api/generate'
    const localModel = process.env.LOCAL_LLM_MODEL || 'qwen2.5:7b-instruct'

    try {
      const localProvider = new LocalLLMProvider(localEndpoint, localModel)
      // Check if Ollama is running and available
      if (await localProvider.isAvailable()) {
        return {
          provider: localProvider,
          type: AIProviderType.LOCAL_LLM
        }
      }
    } catch (error) {
      console.warn('Local LLM check failed:', error)
    }

    // Try OpenAI second
    if (process.env.OPENAI_API_KEY) {
      const model = process.env.OPENAI_MODEL || 'gpt-4'
      return {
        provider: new OpenAIProvider(process.env.OPENAI_API_KEY, model),
        type: AIProviderType.OPENAI
      }
    }

    // Try Cloud LLM (OpenAI-compatible) third
    if (process.env.CLOUD_LLM_API_KEY) {
      const baseURL = process.env.CLOUD_LLM_BASE_URL || 'https://api.openai.com/v1'
      const model = process.env.CLOUD_LLM_MODEL || 'gpt-4o-mini'
      return {
        provider: new CloudLLMProvider(process.env.CLOUD_LLM_API_KEY, baseURL, model),
        type: AIProviderType.CLOUD_LLM
      }
    }

    // Try Anthropic fourth
    if (process.env.ANTHROPIC_API_KEY) {
      const model = process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229'
      return {
        provider: new AnthropicProvider(process.env.ANTHROPIC_API_KEY, model),
        type: AIProviderType.ANTHROPIC
      }
    }

    // Fall back to mock
    return {
      provider: new MockProvider(),
      type: AIProviderType.MOCK
    }
  }
}