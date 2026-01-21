import { MCPConfig, ModelSize, ConfigError } from './types';
import { CacheConfig } from '../cache/types';
import { getRuntimeConfig } from '../shared/runtime-config';

/**
 * MCP Server Configuration
 * Enforces strict limits and provides model selection
 */

// Memory ceiling: 2GB in bytes
const MEMORY_CEILING_BYTES = 2 * 1024 * 1024 * 1024;

// Cache defaults
const CACHE_DEFAULTS: CacheConfig = {
  ttlMs: 5 * 60 * 1000, // 5 minutes
  maxSize: 100, // Max 100 entries
  aiVersion: 'v1.0', // AI version for cache key generation
};

/**
 * Default MCP configuration with strict limits
 */
const DEFAULT_CONFIG: MCPConfig = {
  // Small model (only implemented model)
  smallModel: 'llama2:7b', // Common small model, can be overridden

  // Large model (config-only, not implemented yet)
  // largeModel: 'llama2:13b',

  // Strict token limits
  maxTokens: 1024,

  // Context window limits
  maxContext: 4096,

  // Request timeout (30 seconds)
  timeout: 30000,

  // Memory ceiling (soft-enforced)
  memoryCeiling: MEMORY_CEILING_BYTES,

  // Cache configuration
  cache: CACHE_DEFAULTS,
};

// Current configuration state
let config: MCPConfig = { ...DEFAULT_CONFIG };

/**
 * Validate configuration values against constraints
 */
function validateConfig(config: MCPConfig): void {
  if (config.maxTokens > 1024) {
    throw new ConfigError(
      `Max tokens (${config.maxTokens}) exceeds limit of 1024`,
      { maxTokens: config.maxTokens, limit: 1024 }
    );
  }

  if (config.maxContext > 4096) {
    throw new ConfigError(
      `Max context (${config.maxContext}) exceeds limit of 4096`,
      { maxContext: config.maxContext, limit: 4096 }
    );
  }

  if (config.memoryCeiling > MEMORY_CEILING_BYTES) {
    throw new ConfigError(
      `Memory ceiling (${config.memoryCeiling}) exceeds limit of ${MEMORY_CEILING_BYTES}`,
      { memoryCeiling: config.memoryCeiling, limit: MEMORY_CEILING_BYTES }
    );
  }

  if (config.timeout <= 0) {
    throw new ConfigError(
      `Timeout must be positive, got ${config.timeout}`,
      { timeout: config.timeout }
    );
  }

  if (!config.smallModel || config.smallModel.trim() === '') {
    throw new ConfigError(
      'Small model name cannot be empty',
      { smallModel: config.smallModel }
    );
  }

  // Validate cache configuration
  if (config.cache.ttlMs <= 0) {
    throw new ConfigError(
      'Cache TTL must be positive',
      { ttlMs: config.cache.ttlMs }
    );
  }

  if (config.cache.maxSize <= 0) {
    throw new ConfigError(
      'Cache max size must be positive',
      { maxSize: config.cache.maxSize }
    );
  }

  if (!config.cache.aiVersion || config.cache.aiVersion.trim() === '') {
    throw new ConfigError(
      'Cache AI version cannot be empty',
      { aiVersion: config.cache.aiVersion }
    );
  }
}

/**
 * Get model name for the specified size
 * Only 'small' is implemented, 'large' throws error
 */
export function getModelName(size: ModelSize): string {
  if (size === 'large') {
    throw new ConfigError(
      'Large model not implemented yet',
      { requestedSize: size }
    );
  }

  return config.smallModel;
}

/**
 * Get current MCP configuration
 * Merges runtime config with defaults
 * Validates constraints on first access
 */
let validated = false;

export function getConfig(): MCPConfig {
  // Get runtime config
  const runtimeConfig = getRuntimeConfig();

  // Merge with defaults
  const mergedConfig: MCPConfig = {
    smallModel: DEFAULT_CONFIG.smallModel,
    maxTokens: runtimeConfig.maxTokens,
    maxContext: DEFAULT_CONFIG.maxContext, // Keep static for now
    timeout: DEFAULT_CONFIG.timeout,       // Keep static for now
    memoryCeiling: DEFAULT_CONFIG.memoryCeiling, // Keep static for now
    cache: {
      ...DEFAULT_CONFIG.cache,
      ...runtimeConfig.cache,
      aiVersion: DEFAULT_CONFIG.cache.aiVersion, // Keep static version
    },
  };

  // Validate merged config
  if (!validated) {
    validateConfig(mergedConfig);
    validated = true;
  }

  return { ...mergedConfig }; // Return copy to prevent mutation
}

/**
 * Override configuration (for testing or customization)
 * Validates new config before applying
 */
export function setConfig(newConfig: Partial<MCPConfig>): void {
  const updatedConfig = { ...config, ...newConfig };
  validateConfig(updatedConfig);
  config = updatedConfig;
  validated = true;
}

/**
 * Reset configuration to defaults
 */
export function resetConfig(): void {
  config = { ...DEFAULT_CONFIG };
  validated = false;
}

// Export the current config for direct access
export { config as currentConfig };