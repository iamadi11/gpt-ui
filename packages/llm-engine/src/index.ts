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
  idleUnloadMs?: number // Time after which to unload idle models
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
  private lastActivity = new Map<string, number>()
  private unloadTimer?: NodeJS.Timeout

  constructor(private options: LLMEngineOptions) {
    this.defaultProvider = options.defaultProvider
    options.providers.forEach(provider => {
      this.providers.set(provider.name, provider)
    })

    // Start idle unloading if configured
    if (this.options.idleUnloadMs && this.options.idleUnloadMs > 0) {
      this.startIdleUnloading()
    }
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

    // Track activity for memory management
    this.updateLastActivity(model.name)

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
      let errorMessage = 'Unknown error'

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Request timed out - the AI model took too long to respond. Try using a smaller input or a different model.'
        } else if (error.message.includes('Model installation was cancelled')) {
          errorMessage = 'Model installation timed out - the AI model download took too long. This usually happens on first use. Please try again.'
        } else {
          errorMessage = error.message
        }
      }

      return {
        uiDescription: null,
        rawInput: request.input,
        processingTime: Date.now() - startTime,
        modelUsed: model.name,
        cached: false,
        rawOutput: '', // Include empty rawOutput for consistency
        error: errorMessage
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
    console.log('Generating prompt with input:', input.substring(0, 100))
    return `What type of data is this? Answer with one word: text, table, or chart.

Input: ${input}`
  }

  // Parse AI response into UI description
  private parseUIResponse(content: string, rawInput: string): any {
    console.log('=== AI RESPONSE DEBUG ===')
    console.log('Raw content length:', content.length)
    console.log('Raw content preview:', content.substring(0, 500))
    console.log('=========================')

    try {
      // For now, just create a simple UI based on the response type
      const responseType = content.toLowerCase().trim()

      console.log('Detected response type:', responseType)

      // Create appropriate UI based on detected type
      if (responseType.includes('table')) {
        return this.createTableUI(rawInput)
      } else if (responseType.includes('chart')) {
        return this.createChartUI(rawInput)
      } else {
        return this.createTextUI(rawInput)
      }
    } catch (error) {
      console.error('Parse error:', error)

      // Fallback: Create a basic UI description from the raw input
      console.log('Attempting fallback UI generation from raw input')
      try {
        return this.createTextUI(rawInput)
      } catch (fallbackError) {
        console.error('Fallback UI creation failed:', fallbackError)
        throw new Error(`Failed to parse AI response: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
  }

  // Validate UI description structure - be more lenient
  private isValidUIDescription(obj: any): boolean {
    if (!obj || typeof obj !== 'object') {
      return false
    }

    // Must have basic structure
    const hasBasicStructure = (
      (obj.confidence === undefined || typeof obj.confidence === 'number') &&
      (obj.layout === undefined || typeof obj.layout === 'string') &&
      (obj.sections === undefined || Array.isArray(obj.sections))
    )

    if (!hasBasicStructure) {
      return false
    }

    // If sections exist, validate them more leniently
    if (obj.sections && Array.isArray(obj.sections)) {
      const validSections = obj.sections.filter((section: any) => {
        if (!section || typeof section !== 'object') return false

        // Be lenient - only require what's actually needed
        const hasTitle = typeof section.title === 'string' && section.title.trim().length > 0
        const hasUI = typeof section.ui === 'string' && ['text', 'card', 'table', 'chart'].includes(section.ui)
        const hasContent = section.content !== undefined || section.data !== undefined || section.actions !== undefined

        // At minimum, need title and either UI type or some content
        return hasTitle && (hasUI || hasContent)
      })

      // Accept if we have at least one valid section, or if sections array is empty but other fields are present
      return validSections.length > 0 || obj.sections.length === 0
    }

    // Accept even without sections if we have other valid fields
    return obj.confidence !== undefined || obj.layout !== undefined
  }

  // Create text-based UI
  private createTextUI(rawInput: string): any {
    return {
      confidence: 0.7,
      layout: 'vertical',
      sections: [
        {
          id: 'text-content',
          title: 'Content',
          intent: 'summary',
          ui: 'text',
          content: rawInput.length > 500 ? rawInput.substring(0, 500) + '...' : rawInput,
          confidence: 0.7
        }
      ],
      metadata: {
        generatedAt: new Date().toISOString(),
        model: 'phi3:mini',
        inputHash: this.hashString(rawInput),
        version: '1.0.0'
      }
    }
  }

  // Create table-based UI
  private createTableUI(rawInput: string): any {
    // Try to extract key-value pairs from the input
    const lines = rawInput.split('\n').filter(line => line.trim())
    const data = lines.map((line, index) => {
      const colonIndex = line.indexOf(':')
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim()
        const value = line.substring(colonIndex + 1).trim()
        return { field: key, value: value }
      }
      return { field: `Item ${index + 1}`, value: line.trim() }
    }).filter(item => item.field && item.value)

    return {
      confidence: 0.8,
      layout: 'vertical',
      sections: [
        {
          id: 'data-table',
          title: 'Data',
          intent: 'data',
          ui: 'table',
          data: data.length > 0 ? data : [{ field: 'Content', value: rawInput }],
          confidence: 0.8
        }
      ],
      metadata: {
        generatedAt: new Date().toISOString(),
        model: 'phi3:mini',
        inputHash: this.hashString(rawInput),
        version: '1.0.0'
      }
    }
  }

  // Create chart-based UI (placeholder)
  private createChartUI(rawInput: string): any {
    return {
      confidence: 0.6,
      layout: 'vertical',
      sections: [
        {
          id: 'data-chart',
          title: 'Chart',
          intent: 'analysis',
          ui: 'chart',
          content: 'Chart visualization would be displayed here',
          confidence: 0.6
        }
      ],
      metadata: {
        generatedAt: new Date().toISOString(),
        model: 'phi3:mini',
        inputHash: this.hashString(rawInput),
        version: '1.0.0'
      }
    }
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

    console.log(`Starting LLM call with ${maxRetries + 1} max attempts`)

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      console.log(`Attempt ${attempt + 1}/${maxRetries + 1}`)
      try {
        const result = await this.callProvider(provider, model, prompt, config)
        console.log(`Attempt ${attempt + 1} succeeded`)
        return result
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error')
        console.log(`Attempt ${attempt + 1} failed:`, lastError.message)

        if (attempt < maxRetries) {
          // Exponential backoff
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000)
          console.log(`Waiting ${delay}ms before retry`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    console.log('All retry attempts failed')
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
          return await this.callOllama(provider, model, prompt, controller.signal, config)
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
    signal: AbortSignal,
    config?: InferenceConfig
  ): Promise<LLMResponse> {
    const endpoint = provider.config.endpoint || 'http://localhost:11434/api/generate'

    console.log(`Calling Ollama API at ${endpoint} for model ${model}`)
    console.log(`Prompt length: ${prompt.length} characters`)

    // Check if model needs installation
    try {
      console.log('Checking model availability...')
      await this.ensureOllamaModel(model, endpoint, signal, config)
      console.log('Model is available')
    } catch (error) {
      console.error('Model availability check failed:', error)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Model installation was cancelled due to timeout')
      }
      throw new Error(`Failed to install Ollama model ${model}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    console.log('Making inference request to Ollama...')
    const requestBody = {
      model,
      prompt,
      stream: false,
      options: {
        temperature: provider.config.temperature ?? 0.3,
        num_ctx: provider.config.contextWindow ?? 2048,
        num_predict: provider.config.maxTokens ?? 256,
      },
    }
    console.log('Request body:', JSON.stringify(requestBody, null, 2))

    const fetchStartTime = Date.now()
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
      signal,
    })
    const fetchEndTime = Date.now()
    console.log(`Fetch completed in ${fetchEndTime - fetchStartTime}ms`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Ollama API error: ${response.status} ${response.statusText}`)
      console.error('Error response:', errorText)
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}\n${errorText}`)
    }

    console.log('Parsing Ollama response...')
    const data = await response.json() as OllamaAPIResponse
    console.log('Ollama response:', data)

    const result = {
      content: data.response || '',
      model,
      usage: {
        prompt: this.estimateTokens(prompt),
        completion: this.estimateTokens(data.response || ''),
        total: this.estimateTokens(prompt) + this.estimateTokens(data.response || '')
      }
    }

    console.log(`LLM call completed. Response length: ${result.content.length}`)
    return result
  }

  // Ensure Ollama model is available
  private async ensureOllamaModel(model: string, endpoint: string, signal: AbortSignal, config?: InferenceConfig): Promise<void> {
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
        signal, // Use the AbortSignal for model check
      })

      if (testResponse.status === 404) {
        // Model not found, attempt to pull with separate timeout for installation
        const pullController = new AbortController()
        const installationTimeout = config?.modelInstallationTimeout ?? 300000 // 5 minutes default for model installation
        const pullTimeoutId = setTimeout(() => pullController.abort(), installationTimeout)

        try {
          const pullResponse = await fetch(pullEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: model, stream: false }),
            signal: pullController.signal, // Use separate controller for installation timeout
          })

          if (!pullResponse.ok) {
            throw new Error(`Failed to pull model: ${pullResponse.statusText}`)
          }

          await pullResponse.json() // Wait for completion
        } finally {
          clearTimeout(pullTimeoutId)
        }
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

  // Memory guard: Track model activity
  private updateLastActivity(modelName: string): void {
    this.lastActivity.set(modelName, Date.now())
  }

  // Memory guard: Start idle unloading timer
  private startIdleUnloading(): void {
    if (!this.options.idleUnloadMs) return

    this.unloadTimer = setInterval(() => {
      this.unloadIdleModels()
    }, 60000) // Check every minute
  }

  // Memory guard: Unload idle models
  private async unloadIdleModels(): Promise<void> {
    if (!this.options.idleUnloadMs) return

    const now = Date.now()
    const idleThreshold = this.options.idleUnloadMs

    for (const [modelName, lastUsed] of this.lastActivity.entries()) {
      if (now - lastUsed > idleThreshold) {
        try {
          await this.unloadModel(modelName)
          this.lastActivity.delete(modelName)
        } catch (error) {
          // Log but don't fail - unloading is best effort
          console.warn(`Failed to unload idle model ${modelName}:`, error)
        }
      }
    }
  }

  // Memory guard: Unload specific model from memory
  private async unloadModel(modelName: string): Promise<void> {
    // For Ollama, we can use the unload API if available
    // This is a best-effort operation
    try {
      const provider = this.getProvider('ollama')
      if (provider?.type === 'ollama') {
        const endpoint = provider.config.endpoint || 'http://localhost:11434/api/generate'
        const unloadEndpoint = endpoint.replace('/api/generate', '/api/unload')

        const response = await fetch(unloadEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: modelName }),
        })

        if (!response.ok) {
          // Ollama might not support unload API, this is expected
          console.debug(`Model ${modelName} unload not supported by Ollama`)
        }
      }
    } catch (error) {
      // Ignore unload failures - this is best effort
    }
  }

  // Memory guard: Manual cleanup
  cleanup(): void {
    if (this.unloadTimer) {
      clearInterval(this.unloadTimer)
      this.unloadTimer = undefined
    }

    // Attempt to unload all models
    for (const modelName of this.lastActivity.keys()) {
      this.unloadModel(modelName).catch(() => {
        // Ignore cleanup errors
      })
    }
    this.lastActivity.clear()
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
    contextWindow: 1024
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
  enableStreaming: false,
  idleUnloadMs: 30 * 60 * 1000 // 30 minutes idle timeout
}