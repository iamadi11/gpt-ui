export interface UIDescription {
    confidence: number;
    layout: 'vertical' | 'horizontal' | 'grid';
    sections: UISection[];
    metadata?: {
        generatedAt: string;
        model: string;
        inputHash: string;
        version: string;
    };
}
export interface UISection {
    id: string;
    title: string;
    intent: 'summary' | 'analysis' | 'data' | 'insight' | 'action';
    ui: UIPrimitive;
    content?: string;
    data?: any[];
    actions?: UIAction[];
    confidence: number;
    metadata?: Record<string, any>;
}
export type UIPrimitive = 'text' | 'card' | 'table' | 'chart' | 'form' | 'list';
export interface UIAction {
    id: string;
    type: 'button' | 'link' | 'input' | 'select';
    label: string;
    value?: any;
    handler?: string;
    variant?: 'primary' | 'secondary' | 'danger';
}
export interface UIRenderContext {
    theme?: UITheme;
    density?: 'compact' | 'normal' | 'comfortable';
    accessibility?: UIAccessibility;
    device?: UIDevice;
}
export interface UITheme {
    mode: 'light' | 'dark' | 'auto';
    colors?: {
        primary?: string;
        secondary?: string;
        accent?: string;
    };
    typography?: {
        fontFamily?: string;
        fontSize?: 'small' | 'medium' | 'large';
    };
}
export interface UIAccessibility {
    highContrast?: boolean;
    reduceMotion?: boolean;
    screenReader?: boolean;
    colorBlind?: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
}
export interface UIDevice {
    type: 'desktop' | 'tablet' | 'mobile';
    orientation?: 'portrait' | 'landscape';
    screenSize?: {
        width: number;
        height: number;
    };
}
export interface LLMProvider {
    name: string;
    type: 'ollama' | 'openai' | 'anthropic';
    config: LLMConfig;
    capabilities: LLMCapabilities;
}
export interface LLMConfig {
    endpoint?: string;
    apiKey?: string;
    timeout?: number;
    temperature?: number;
    maxTokens?: number;
    contextWindow?: number;
}
export interface LLMCapabilities {
    supportsStreaming: boolean;
    supportsFunctionCalling: boolean;
    maxContextLength: number;
    supportedModels: LLMModel[];
}
export interface LLMModel {
    name: string;
    displayName: string;
    memoryUsage: string;
    recommended: boolean;
    description: string;
    contextLength: number;
    capabilities: string[];
}
export interface UIInferenceRequest {
    input: string;
    context?: UIRenderContext;
    model?: string;
    config?: InferenceConfig;
}
export interface InferenceConfig {
    temperature?: number;
    maxTokens?: number;
    timeout?: number;
    retries?: number;
}
export interface UIInferenceResponse {
    uiDescription: UIDescription | null;
    rawInput: string;
    processingTime: number;
    modelUsed: string;
    cached: boolean;
    rawOutput?: string;
    parseError?: string;
    error?: string;
    metadata?: {
        cacheKey?: string;
        promptHash?: string;
        tokenUsage?: {
            prompt: number;
            completion: number;
            total: number;
        };
    };
}
export interface CacheEntry {
    data: any;
    timestamp: number;
    expiresAt?: number;
    metadata: {
        inputHash: string;
        model: string;
        configHash: string;
    };
}
export interface CacheConfig {
    ttl: number;
    maxSize: number;
    strategy: 'lru' | 'fifo' | 'lfu';
}
export interface SystemConfig {
    llm: {
        defaultProvider: string;
        providers: Record<string, LLMProvider>;
        memoryBudget: number;
        timeout: number;
    };
    ui: {
        theme: UITheme;
        density: 'compact' | 'normal' | 'comfortable';
        accessibility: UIAccessibility;
    };
    cache: {
        enabled: boolean;
        config: CacheConfig;
    };
    security: {
        sandboxed: boolean;
        maxExecutionTime: number;
        allowedDomains: string[];
    };
}
export declare const UI_PRIMITIVES: readonly UIPrimitive[];
export declare const UI_INTENTS: readonly ["summary", "analysis", "data", "insight", "action"];
export declare const LLM_PROVIDERS: readonly ["ollama", "openai", "anthropic"];
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
export type ConfigOverride<T> = DeepPartial<T>;
