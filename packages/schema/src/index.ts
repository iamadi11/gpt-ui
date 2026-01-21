// Core schemas for AI-powered UI generation
// These types define the contract between AI and UI runtime

export interface UIDescription {
  confidence: number // 0.0-1.0 overall certainty
  layout: 'vertical' | 'horizontal' | 'grid'
  sections: UISection[]
  metadata?: {
    generatedAt: string
    model: string
    inputHash: string
    version: string
  }
}

export interface UISection {
  id: string // Unique identifier for the section
  title: string
  intent: 'summary' | 'analysis' | 'data' | 'insight' | 'action'
  ui: UIPrimitive
  content?: string // For text-based primitives
  data?: any[] // For data-driven primitives
  actions?: UIAction[] // Interactive elements
  confidence: number // 0.0-1.0 confidence in this section
  metadata?: Record<string, any> // Additional AI metadata
}

export type UIPrimitive = 'text' | 'card' | 'table' | 'chart'

export interface UIAction {
  id: string
  type: 'button' | 'link' | 'input' | 'select'
  label: string
  value?: any
  handler?: string // Function name or URL
  variant?: 'primary' | 'secondary' | 'danger'
}

export interface UIRenderContext {
  theme?: UITheme
  density?: 'compact' | 'normal' | 'comfortable'
  accessibility?: UIAccessibility
  device?: UIDevice
}

export interface UITheme {
  mode: 'light' | 'dark' | 'auto'
  colors?: {
    primary?: string
    secondary?: string
    accent?: string
  }
  typography?: {
    fontFamily?: string
    fontSize?: 'small' | 'medium' | 'large'
  }
}

export interface UIAccessibility {
  highContrast?: boolean
  reduceMotion?: boolean
  screenReader?: boolean
  colorBlind?: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia'
}

export interface UIDevice {
  type: 'desktop' | 'tablet' | 'mobile'
  orientation?: 'portrait' | 'landscape'
  screenSize?: { width: number; height: number }
}

// LLM Provider interfaces
export interface LLMProvider {
  name: string
  type: 'ollama' | 'openai' | 'anthropic'
  config: LLMConfig
  capabilities: LLMCapabilities
}

export interface LLMConfig {
  endpoint?: string
  apiKey?: string
  timeout?: number
  temperature?: number
  maxTokens?: number
  contextWindow?: number
}

export interface LLMCapabilities {
  supportsStreaming: boolean
  supportsFunctionCalling: boolean
  maxContextLength: number
  supportedModels: LLMModel[]
}

export interface LLMModel {
  name: string
  displayName: string
  memoryUsage: string
  recommended: boolean
  description: string
  contextLength: number
  capabilities: string[]
}

// Request/Response types
export interface UIInferenceRequest {
  input: string
  context?: UIRenderContext
  model?: string
  config?: InferenceConfig
}

export interface InferenceConfig {
  temperature?: number
  maxTokens?: number
  timeout?: number
  modelInstallationTimeout?: number // Separate timeout for model download/installation
  retries?: number
}

export interface UIInferenceResponse {
  uiDescription: UIDescription | null
  rawInput: string
  processingTime: number
  modelUsed: string
  cached: boolean
  rawOutput?: string
  parseError?: string
  error?: string
  metadata?: {
    cacheKey?: string
    promptHash?: string
    tokenUsage?: {
      prompt: number
      completion: number
      total: number
    }
  }
}

// Caching interfaces
export interface CacheEntry {
  data: any
  timestamp: number
  expiresAt?: number
  metadata: {
    inputHash: string
    model: string
    configHash: string
  }
}

export interface CacheConfig {
  ttl: number // Time to live in milliseconds
  maxSize: number // Maximum cache size
  strategy: 'lru' | 'fifo' | 'lfu'
}

// Configuration interfaces
export interface SystemConfig {
  llm: {
    defaultProvider: string
    providers: Record<string, LLMProvider>
    memoryBudget: number // GB
    timeout: number // ms
  }
  ui: {
    theme: UITheme
    density: 'compact' | 'normal' | 'comfortable'
    accessibility: UIAccessibility
  }
  cache: {
    enabled: boolean
    config: CacheConfig
  }
  security: {
    sandboxed: boolean
    maxExecutionTime: number // ms
    allowedDomains: string[]
  }
}

// Validation schemas
export const UI_PRIMITIVES: readonly UIPrimitive[] = [
  'text', 'card', 'table', 'chart'
] as const

export const UI_INTENTS = [
  'summary', 'analysis', 'data', 'insight', 'action'
] as const

export const LLM_PROVIDERS = ['ollama', 'openai', 'anthropic'] as const

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type ConfigOverride<T> = DeepPartial<T>