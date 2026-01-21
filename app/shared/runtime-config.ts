import { ModelSize } from '../mcp/types';

/**
 * Runtime Configuration - Source of Truth
 * Central configuration store for AI-generated UI platform
 *
 * CONTROL PLANE (Dashboard):
 * - Reads current config
 * - Validates and updates config
 * - Provides config status
 *
 * DATA PLANE (MCP/Cache/Server):
 * - Reads config for runtime behavior
 * - No direct writes (only through API)
 * - Respects updated config immediately
 */

/**
 * Runtime configuration interface
 * Defines all configurable aspects of the AI UI platform
 */
export interface RuntimeConfig {
  /** Active AI model selection */
  activeModel: ModelSize;

  /** Token limits */
  maxTokens: number;

  /** Cache configuration */
  cache: {
    ttlMs: number;
    maxSize: number;
  };

  /** UI rendering constraints */
  ui: {
    confidenceThreshold: number;
  };

  /** Last update timestamp */
  lastUpdated: number;

  /** Update version for cache invalidation */
  version: number;
}

/**
 * Default runtime configuration
 * Safe defaults that match the system constraints
 */
const DEFAULT_RUNTIME_CONFIG: RuntimeConfig = {
  activeModel: 'small',  // Start with small model
  maxTokens: 1024,       // Conservative token limit
  cache: {
    ttlMs: 5 * 60 * 1000,  // 5 minutes
    maxSize: 100,          // 100 entries
  },
  ui: {
    confidenceThreshold: 0.5,  // 50% confidence threshold
  },
  lastUpdated: Date.now(),
  version: 1,
};

/**
 * Validation rules for runtime config
 */
const VALIDATION_RULES = {
  maxTokens: { min: 1, max: 4096 },
  cache: {
    ttlMs: { min: 1000, max: 24 * 60 * 60 * 1000 }, // 1 second to 24 hours
    maxSize: { min: 1, max: 10000 }, // 1 to 10k entries
  },
  ui: {
    confidenceThreshold: { min: 0, max: 1 },
  },
};

/**
 * Runtime config error for validation failures
 */
export class RuntimeConfigError extends Error {
  constructor(message: string, public readonly details?: any) {
    super(message);
    this.name = 'RuntimeConfigError';
  }
}

/**
 * In-memory runtime config store
 * Single source of truth for all configuration
 */
let runtimeConfig: RuntimeConfig = { ...DEFAULT_RUNTIME_CONFIG };

/**
 * Get current runtime configuration
 * Used by MCP, cache, server components
 */
export function getRuntimeConfig(): RuntimeConfig {
  return { ...runtimeConfig }; // Return copy to prevent mutation
}

/**
 * Update runtime configuration with validation
 * Used by dashboard API route only
 */
export function updateRuntimeConfig(updates: Partial<RuntimeConfig>): RuntimeConfig {
  // Validate updates
  validateConfigUpdates(updates);

  // Apply updates
  const newConfig = {
    ...runtimeConfig,
    ...updates,
    lastUpdated: Date.now(),
    version: runtimeConfig.version + 1, // Increment version for cache invalidation
  };

  // Store new config
  runtimeConfig = newConfig;

  console.log(`[Runtime Config] Updated config version ${newConfig.version}`);

  return getRuntimeConfig();
}

/**
 * Validate configuration updates
 * Throws RuntimeConfigError for invalid values
 */
function validateConfigUpdates(updates: Partial<RuntimeConfig>): void {
  // Validate activeModel
  if (updates.activeModel !== undefined) {
    if (!['small', 'large'].includes(updates.activeModel)) {
      throw new RuntimeConfigError(
        `Invalid model: ${updates.activeModel}. Must be 'small' or 'large'`,
        { provided: updates.activeModel, allowed: ['small', 'large'] }
      );
    }
  }

  // Validate maxTokens
  if (updates.maxTokens !== undefined) {
    const { min, max } = VALIDATION_RULES.maxTokens;
    if (updates.maxTokens < min || updates.maxTokens > max) {
      throw new RuntimeConfigError(
        `Invalid maxTokens: ${updates.maxTokens}. Must be between ${min} and ${max}`,
        { provided: updates.maxTokens, min, max }
      );
    }
  }

  // Validate cache.ttlMs
  if (updates.cache?.ttlMs !== undefined) {
    const { min, max } = VALIDATION_RULES.cache.ttlMs;
    if (updates.cache.ttlMs < min || updates.cache.ttlMs > max) {
      throw new RuntimeConfigError(
        `Invalid cache TTL: ${updates.cache.ttlMs}ms. Must be between ${min}ms and ${max}ms`,
        { provided: updates.cache.ttlMs, min, max }
      );
    }
  }

  // Validate cache.maxSize
  if (updates.cache?.maxSize !== undefined) {
    const { min, max } = VALIDATION_RULES.cache.maxSize;
    if (updates.cache.maxSize < min || updates.cache.maxSize > max) {
      throw new RuntimeConfigError(
        `Invalid cache maxSize: ${updates.cache.maxSize}. Must be between ${min} and ${max}`,
        { provided: updates.cache.maxSize, min, max }
      );
    }
  }

  // Validate ui.confidenceThreshold
  if (updates.ui?.confidenceThreshold !== undefined) {
    const { min, max } = VALIDATION_RULES.ui.confidenceThreshold;
    if (updates.ui.confidenceThreshold < min || updates.ui.confidenceThreshold > max) {
      throw new RuntimeConfigError(
        `Invalid confidence threshold: ${updates.ui.confidenceThreshold}. Must be between ${min} and ${max}`,
        { provided: updates.ui.confidenceThreshold, min, max }
      );
    }
  }
}

/**
 * Reset runtime config to defaults
 * Useful for testing or emergency reset
 */
export function resetRuntimeConfig(): RuntimeConfig {
  runtimeConfig = { ...DEFAULT_RUNTIME_CONFIG, lastUpdated: Date.now() };
  console.log('[Runtime Config] Reset to defaults');
  return getRuntimeConfig();
}

/**
 * Get config status for dashboard display
 * Includes validation status and last update info
 */
export function getConfigStatus() {
  const config = getRuntimeConfig();
  return {
    config,
    isValid: true, // Always valid since we validate on update
    lastUpdated: new Date(config.lastUpdated).toISOString(),
    version: config.version,
  };
}