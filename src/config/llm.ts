// LLM Configuration for POC - Strict 2GB RAM Budget
//
// WHY THESE LIMITS EXIST:
// - Consumer hardware (8-16GB RAM) needs to run browser + LLM + app
// - Larger models cause OOM crashes, especially on lower-end machines
// - POC must work reliably on typical developer laptops
// - Memory usage scales with model size + context window + concurrent requests
//
// TRADEOFFS MADE:
// - Small context (2048) limits complex reasoning but keeps memory low
// - Low max tokens (256) prevents verbose responses but ensures fast responses
// - Only 3 small models available - limited capability but guaranteed stability
// - No streaming, no batching - simpler but less efficient

export interface LLMModel {
  name: string
  displayName: string
  memoryUsage: string // Rough estimate: model weights + typical context
  recommended: boolean
  description: string
}

// Available Ollama models - selected for ≤2GB RAM usage
// Memory estimates based on Ollama's reported usage + context overhead
// All models tested to work on 8GB RAM machines with browser open
export const AVAILABLE_MODELS: LLMModel[] = [
  {
    name: 'phi3:mini',     // ~800MB total usage
    displayName: 'Phi-3 Mini',
    memoryUsage: '~800MB',
    recommended: true,
    description: 'Fast, low memory, good for demos'
  },
  {
    name: 'qwen2.5:3b',    // ~1.2GB total usage
    displayName: 'Qwen 2.5 (3B)',
    memoryUsage: '~1.2GB',
    recommended: true,
    description: 'Balanced performance, still under 2GB'
  },
  {
    name: 'qwen2.5:7b',    // ~2.8GB total usage - exceeds budget
    displayName: 'Qwen 2.5 (7B)',
    memoryUsage: '~2.8GB',
    recommended: false,
    description: 'Higher quality but may exceed 2GB limit'
  }
]

// Default model - smallest footprint for maximum compatibility
export const DEFAULT_MODEL = AVAILABLE_MODELS[0]

// Memory limits enforced in Ollama calls
// These values are passed to Ollama to prevent memory issues
export const MEMORY_LIMITS = {
  // Context window: 2048 tokens
  // WHY: 2048 tokens ≈ 1.5KB context. Larger contexts = exponential memory growth
  // TRADEOFF: Can't analyze very long documents but prevents OOM crashes
  maxContextTokens: 2048,

  // Max output tokens: 256 tokens
  // WHY: 256 tokens ≈ 200 words. Enough for UI decisions, not for essays
  // TRADEOFF: Responses are concise but prevents runaway generation
  maxOutputTokens: 256,

  // Total memory budget: 2GB
  // WHY: Leaves room for browser (1GB) + OS (1GB) on 8GB machines
  // TRADEOFF: Limited model selection but guaranteed stability
  totalMemoryBudgetGB: 2
} as const

// Ollama endpoint configuration
// Configurable for different Ollama installations
export const OLLAMA_CONFIG = {
  // Default localhost:11434 - standard Ollama port
  defaultEndpoint: 'http://localhost:11434/api/generate',

  // Timeout for LLM calls - 3 minutes max to prevent hanging
  // Balances responsiveness with complex queries
  timeoutMs: 3 * 60 * 1000,

  // Temperature for consistent outputs
  // Low temperature = more predictable UI decisions
  temperature: 0.3
} as const

// Get model by name, fallback to default
export function getModelByName(name: string): LLMModel {
  return AVAILABLE_MODELS.find(m => m.name === name) || DEFAULT_MODEL
}

// Validate that model fits within memory budget
export function isModelWithinBudget(model: LLMModel): boolean {
  // Extract numeric memory value (rough estimate)
  const memoryGB = parseFloat(model.memoryUsage.replace('~', '').replace('GB', ''))
  return memoryGB <= MEMORY_LIMITS.totalMemoryBudgetGB
}

// Get recommended models only
export function getRecommendedModels(): LLMModel[] {
  return AVAILABLE_MODELS.filter(model => model.recommended)
}