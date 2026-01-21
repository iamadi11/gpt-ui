/**
 * Strict TypeScript types for the MCP server
 * Enforces type safety and prevents runtime errors
 */

/**
 * Supported model sizes
 */
export type ModelSize = 'small' | 'large';

/**
 * Generate function input payload
 */
export interface GeneratePayload {
  /** Input can be a string or any serializable object */
  input: string | object;
  /** Intent description for context */
  intent: string;
  /** Model size selection */
  model: ModelSize;
}

/**
 * Generate function response
 */
export interface GenerateResponse {
  /** Raw model output */
  output: any;
  /** Actual tokens used in generation */
  tokensUsed: number;
  /** Model name that was used */
  model: string;
}

/**
 * MCP Configuration interface
 */
export interface MCPConfig {
  /** Default small model name */
  smallModel: string;
  /** Maximum tokens allowed per request */
  maxTokens: number;
  /** Maximum context length */
  maxContext: number;
  /** Request timeout in milliseconds */
  timeout: number;
  /** Memory ceiling in bytes (soft-enforced) */
  memoryCeiling: number;
}

/**
 * Ollama API request payload
 */
export interface OllamaRequest {
  /** Model name */
  model: string;
  /** Prompt to send to model */
  prompt: string;
  /** Maximum tokens to generate */
  num_predict?: number;
  /** Context length */
  num_ctx?: number;
  /** Stream response (always false) */
  stream: false;
}

/**
 * Ollama API response
 */
export interface OllamaResponse {
  /** Generated response text */
  response: string;
  /** Token usage information */
  eval_count?: number;
  /** Model that was used */
  model?: string;
}

/**
 * Internal client request interface
 */
export interface ClientRequest {
  /** Serialized prompt string */
  prompt: string;
  /** Model name */
  model: string;
  /** Token limit */
  maxTokens: number;
  /** Context limit */
  maxContext: number;
  /** Timeout in milliseconds */
  timeout: number;
}

/**
 * Internal client response interface
 */
export interface ClientResponse {
  /** Raw model output */
  output: string;
  /** Tokens actually used */
  tokensUsed: number;
  /** Model that responded */
  model: string;
}

/**
 * Error types for explicit error handling
 */
export class MCPError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'MCPError';
  }
}

export class ValidationError extends MCPError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', details);
  }
}

export class ModelError extends MCPError {
  constructor(message: string, details?: any) {
    super(message, 'MODEL_ERROR', details);
  }
}

export class ConfigError extends MCPError {
  constructor(message: string, details?: any) {
    super(message, 'CONFIG_ERROR', details);
  }
}