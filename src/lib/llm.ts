// Local LLM Client for Ollama
// Small abstraction layer for communicating with Ollama's OpenAI-compatible API

export interface LLMConfig {
  endpoint: string
  model: string
  temperature?: number
  maxTokens?: number
  timeout?: number // Timeout in milliseconds
}

export interface LLMResponse {
  content: string
  model: string
  usage?: {
    promptTokens?: number
    completionTokens?: number
    totalTokens?: number
  }
}

export class OllamaClient {
  private config: LLMConfig

  constructor(config: LLMConfig) {
    this.config = config
  }

  /**
   * Send a prompt to the local LLM and get a response
   */
  async generate(prompt: string): Promise<LLMResponse> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout || 600000) // 10 minutes default

    try {
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model,
          prompt: prompt,
          stream: false,
          options: {
            temperature: this.config.temperature || 0.7,
            num_predict: this.config.maxTokens || 1024,
          },
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}\n${errorText}`)
      }

      const data = await response.json()

      return {
        content: data.response || '',
        model: this.config.model,
        usage: data.usage ? {
          promptTokens: data.usage.prompt_eval_count,
          completionTokens: data.usage.eval_count,
          totalTokens: (data.usage.prompt_eval_count || 0) + (data.usage.eval_count || 0),
        } : undefined,
      }
    } catch (error) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        throw new Error(`Ollama request timed out after ${this.config.timeout || 600000}ms`)
      }
      throw error
    }
  }

  /**
   * Check if Ollama is running and the model is available
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.endpoint.replace('/api/generate', '/api/tags')}`)
      return response.ok
    } catch {
      return false
    }
  }

  /**
   * Get the current model name
   */
  getModelName(): string {
    return this.config.model
  }
}

// Default configuration for the dynamic UI POC
export const DEFAULT_OLLAMA_CONFIG: LLMConfig = {
  endpoint: 'http://localhost:11434/api/generate',
  model: process.env.OLLAMA_MODEL || 'qwen2.5:7b-instruct',
  temperature: 0.7,
  maxTokens: 2048,
  timeout: 10 * 60 * 1000, // 10 minutes for local LLM inference
}

// Factory function to create configured Ollama client
export function createOllamaClient(config: Partial<LLMConfig> = {}): OllamaClient {
  return new OllamaClient({
    ...DEFAULT_OLLAMA_CONFIG,
    ...config,
  })
}

// Convenience function for one-off generations
export async function generateWithOllama(prompt: string, config?: Partial<LLMConfig>): Promise<LLMResponse> {
  const client = createOllamaClient(config)
  return client.generate(prompt)
}