import type {
  LLMProvider,
  LLMConfig,
  LLMCapabilities,
  LLMModel,
  UIInferenceRequest,
  UIInferenceResponse,
  InferenceConfig
} from '@gpt-ui/schema'

// Pluggable LLM Engine with Ollama-first architecture
//
// PROVIDER SUPPORT:
// - Ollama (primary) - Local models with memory caps
// - OpenAI (optional) - Cloud API fallback
// - Anthropic (optional) - Alternative cloud provider
//
// FEATURES:
// - Model auto-installation for Ollama
// - Memory usage enforcement
// - Streaming support
// - Retry logic with backoff
// - Timeout handling
// - Token usage tracking

export interface LLMEngineOptions {
  providers: LLMProvider[]
  defaultProvider: string
  memoryBudgetGB: number
  timeoutMs: number
  retryAttempts: number
  enableStreaming: boolean
}

export interface LLMResponse {
  content: string
  model: string
  usage?: {
    prompt: number
    completion: number
    total: number
  }
  metadata?: Record<string, any>
}

interface OllamaAPIResponse {
  response: string
  [key: string]: any
}

export class LLMEngine {
  private providers = new Map<string, LLMProvider>()
  private defaultProvider: string

  constructor(private options: LLMEngineOptions) {
    this.defaultProvider = options.defaultProvider
    options.providers.forEach(provider => {
      this.providers.set(provider.name, provider)
    })
  }

  // Get provider by name
  getProvider(name?: string): LLMProvider {
    const providerName = name || this.defaultProvider
    const provider = this.providers.get(providerName)
    if (!provider) {
      throw new Error(`Provider "${providerName}" not found`)
    }
    return provider
  }

  // Infer UI description from input
  async inferUI(request: UIInferenceRequest): Promise<UIInferenceResponse> {
    const startTime = Date.now()
    const provider = this.getProvider(this.defaultProvider)
    const model = this.selectModel(provider, request)

    try {
      // Generate prompt for UI inference
      const prompt = this.generateUIPrompt(request.input, request.context)

      // Call LLM with retries
      const response = await this.callWithRetry(provider, model.name, prompt, request.config)

      // Parse response into UI description
      const uiDescription = this.parseUIResponse(response.content, request.input)

      return {
        uiDescription,
        rawInput: request.input,
        processingTime: Date.now() - startTime,
        modelUsed: model.name,
        cached: false,
        rawOutput: response.content,
        metadata: {
          tokenUsage: response.usage
        }
      }
    } catch (error) {
      return {
        uiDescription: null,
        rawInput: request.input,
        processingTime: Date.now() - startTime,
        modelUsed: model.name,
        cached: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Select appropriate model based on request
  private selectModel(provider: LLMProvider, request: UIInferenceRequest): LLMModel {
    // Use specified model if available
    if (request.model && provider.capabilities.supportedModels.some(m => m.name === request.model)) {
      return provider.capabilities.supportedModels.find(m => m.name === request.model)!
    }

    // Auto-select based on input complexity and memory budget
    const inputLength = request.input.length
    const isComplex = inputLength > 1000 || request.input.includes('json') || request.input.includes('data')

    const candidates = provider.capabilities.supportedModels.filter(model => {
      const memoryGB = this.parseMemoryUsage(model.memoryUsage)
      return memoryGB <= this.options.memoryBudgetGB
    })

    // Prefer recommended models, then by memory usage (lower first)
    const sorted = candidates.sort((a, b) => {
      if (a.recommended && !b.recommended) return -1
      if (!a.recommended && b.recommended) return 1
      const aMem = this.parseMemoryUsage(a.memoryUsage)
      const bMem = this.parseMemoryUsage(b.memoryUsage)
      return aMem - bMem
    })

    if (sorted.length === 0) {
      throw new Error(`No models available within memory budget of ${this.options.memoryBudgetGB}GB`)
    }

    return sorted[0]
  }

  // Generate UI inference prompt
  private generateUIPrompt(input: string, context?: any): string {
    console.log('Generating prompt with input:', input)
    return `You are a UI designer. Given any input (text, JSON, data), create a user interface that best presents that information to a human.

REASONING PROCESS:
1. Understand what the input contains - do not assume field names have meaning
2. Decide what information is actually important to show
3. Determine the best way for a human to consume this information
4. Design a simple, clear UI layout using basic primitives

UI PRIMITIVES AVAILABLE:
- "text": For summaries, explanations, or formatted content
- "card": For highlighting key information or metrics
- "table": For structured data or comparisons
- "chart": For visualizing trends or distributions (placeholder only)

CRITICAL RULES:
- Do NOT assume field names have semantic meaning
- Do NOT invent missing data or make things up
- Do NOT try to interpret ambiguous data as specific types
- If unsure about anything, lower confidence and simplify UI
- Focus on what the input actually contains, not what you think it should contain

OUTPUT FORMAT (JSON only):
{
  "confidence": 0.0-1.0,
  "layout": "vertical|horizontal|grid",
  "sections": [
    {
      "id": "unique-section-id",
      "title": "Section Title",
      "intent": "summary|analysis|data|insight|action",
      "ui": "text|card|table|chart",
      "content": "...",
      "data": [...],
      "actions": [...],
      "confidence": 0.0-1.0
    }
  ],
  "metadata": {
    "generatedAt": "${new Date().toISOString()}",
    "model": "model-name",
    "inputHash": "${this.hashString(input)}",
    "version": "1.0.0"
  }
}

Now analyze this input and create the best UI for it:

${input}`
  }

  // Parse AI response into UI description
  private parseUIResponse(content: string, rawInput: string): any {
    try {
      // Strip markdown code blocks
      let jsonContent = content.replace(/```(?:json)?\s*\n?/g, '').replace(/\n?```\s*$/g, '')

      // Find JSON object
      const jsonMatches = jsonContent.match(/\{[\s\S]*\}/g)
      if (!jsonMatches) {
        throw new Error('No JSON object found in AI response')
      }

      // Try each JSON match
      const sortedMatches = jsonMatches.sort((a, b) => b.length - a.length)

      for (const jsonMatch of sortedMatches) {
        try {
          let cleanedJson = jsonMatch

          // Fix common AI mistakes
          cleanedJson = cleanedJson.replace(/,(\s*[}\]])/g, '$1') // trailing commas
          cleanedJson = cleanedJson.replace(/:\s*0+(\d)/g, ': $1') // malformed numbers

          const parsed = JSON.parse(cleanedJson)

          // Validate structure
          if (this.isValidUIDescription(parsed)) {
            // Add IDs to sections if missing
            if (parsed.sections) {
              parsed.sections = parsed.sections.map((section: any, index: number) => ({
                ...section,
                id: section.id || `section-${index}-${this.hashString(JSON.stringify(section)).substring(0, 8)}`
              }))
            }
            return parsed
          }
        } catch (parseError) {
          continue
        }
      }

      throw new Error('All JSON parsing attempts failed')
    } catch (error) {
      throw new Error(`Failed to parse AI response: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Validate UI description structure
  private isValidUIDescription(obj: any): boolean {
    return (
      typeof obj === 'object' &&
      typeof obj.confidence === 'number' &&
      typeof obj.layout === 'string' &&
      Array.isArray(obj.sections) &&
      obj.sections.every((section: any) =>
        typeof section.title === 'string' &&
        typeof section.intent === 'string' &&
        typeof section.ui === 'string' &&
        typeof section.confidence === 'number' &&
        ['text', 'card', 'table', 'chart'].includes(section.ui)
      )
    )
  }

  // Call LLM with retry logic
  private async callWithRetry(
    provider: LLMProvider,
    model: string,
    prompt: string,
    config?: InferenceConfig
  ): Promise<LLMResponse> {
    const maxRetries = config?.retries ?? this.options.retryAttempts
    let lastError: Error | null = null

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this.callProvider(provider, model, prompt, config)
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error')

        if (attempt < maxRetries) {
          // Exponential backoff
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    throw lastError || new Error('All retry attempts failed')
  }

  // Call specific provider
  private async callProvider(
    provider: LLMProvider,
    model: string,
    prompt: string,
    config?: InferenceConfig
  ): Promise<LLMResponse> {
    const timeout = config?.timeout ?? this.options.timeoutMs
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      switch (provider.type) {
        case 'ollama':
          return await this.callOllama(provider, model, prompt, controller.signal)
        default:
          throw new Error(`Unsupported provider type: ${provider.type}. Only Ollama is supported.`)
      }
    } finally {
      clearTimeout(timeoutId)
    }
  }

  // Ollama provider implementation
  private async callOllama(
    provider: LLMProvider,
    model: string,
    prompt: string,
    signal: AbortSignal
  ): Promise<LLMResponse> {
    const endpoint = provider.config.endpoint || 'http://localhost:11434/api/generate'

    // Check if model needs installation
    try {
      await this.ensureOllamaModel(model, endpoint)
    } catch (error) {
      throw new Error(`Failed to install Ollama model ${model}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        options: {
          temperature: provider.config.temperature ?? 0.3,
          num_ctx: provider.config.contextWindow ?? 2048,
          num_predict: provider.config.maxTokens ?? 256,
        },
      }),
      signal,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}\n${errorText}`)
    }

    const data = await response.json() as OllamaAPIResponse
    return {
      content: data.response || '',
      model,
      usage: {
        prompt: this.estimateTokens(prompt),
        completion: this.estimateTokens(data.response || ''),
        total: this.estimateTokens(prompt) + this.estimateTokens(data.response || '')
      }
    }
  }

  // Ensure Ollama model is available
  private async ensureOllamaModel(model: string, endpoint: string): Promise<void> {
    const pullEndpoint = endpoint.replace('/api/generate', '/api/pull')

    try {
      // Check if model exists by attempting a minimal call
      const testResponse = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt: 'test',
          stream: false,
          options: { num_predict: 1 }
        }),
      })

      if (testResponse.status === 404) {
        // Model not found, attempt to pull
        const pullResponse = await fetch(pullEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: model, stream: false }),
        })

        if (!pullResponse.ok) {
          throw new Error(`Failed to pull model: ${pullResponse.statusText}`)
        }

        await pullResponse.json() // Wait for completion
      } else if (!testResponse.ok) {
        throw new Error(`Model check failed: ${testResponse.statusText}`)
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw error
      }
      // If we can't verify, assume it's available
    }
  }


  // Utility functions
  private parseMemoryUsage(memoryStr: string): number {
    const match = memoryStr.match(/(\d+(?:\.\d+)?)/)
    return match ? parseFloat(match[1]) : 0
  }

  private hashString(str: string): string {
    return require('crypto').createHash('sha256').update(str).digest('hex')
  }

  private estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters for English text
    return Math.ceil(text.length / 4)
  }

  // Get available providers
  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys())
  }

  // Get provider capabilities
  getProviderCapabilities(providerName: string): LLMCapabilities | null {
    const provider = this.providers.get(providerName)
    return provider ? provider.capabilities : null
  }
}

// Default Ollama provider configuration
export const DEFAULT_OLLAMA_PROVIDER: LLMProvider = {
  name: 'ollama',
  type: 'ollama',
  config: {
    endpoint: 'http://localhost:11434/api/generate',
    timeout: 180000, // 3 minutes
    temperature: 0.3,
    maxTokens: 256,
    contextWindow: 2048
  },
  capabilities: {
    supportsStreaming: true,
    supportsFunctionCalling: false,
    maxContextLength: 2048,
    supportedModels: [
      {
        name: 'phi3:mini',
        displayName: 'Phi-3 Mini',
        memoryUsage: '~800MB',
        recommended: true,
        description: 'Fast, low memory, good for demos',
        contextLength: 2048,
        capabilities: ['text-generation']
      },
      {
        name: 'qwen2.5:3b',
        displayName: 'Qwen 2.5 (3B)',
        memoryUsage: '~1.2GB',
        recommended: true,
        description: 'Balanced performance, still under 2GB',
        contextLength: 4096,
        capabilities: ['text-generation']
      },
      {
        name: 'qwen2.5:7b',
        displayName: 'Qwen 2.5 (7B)',
        memoryUsage: '~2.8GB',
        recommended: false,
        description: 'Higher quality but may exceed 2GB limit',
        contextLength: 4096,
        capabilities: ['text-generation']
      }
    ]
  }
}

// Default engine options
export const DEFAULT_ENGINE_OPTIONS: LLMEngineOptions = {
  providers: [DEFAULT_OLLAMA_PROVIDER],
  defaultProvider: 'ollama',
  memoryBudgetGB: 2,
  timeoutMs: 180000,
  retryAttempts: 2,
  enableStreaming: false
}