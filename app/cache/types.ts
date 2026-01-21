import { UIGenerationResult } from '../shared/ui-schema';

// Re-export for convenience
export type { UIGenerationResult };

/**
 * Cache Types for AI UI Generation
 * Transparent caching layer that sits before MCP
 */

/**
 * Cache entry with timestamp for TTL handling
 */
export interface CacheEntry {
  /** The cached AI generation result */
  result: UIGenerationResult;
  /** Timestamp when entry was stored (milliseconds since epoch) */
  timestamp: number;
}

/**
 * Cache configuration
 */
export interface CacheConfig {
  /** Time-to-live in milliseconds */
  ttlMs: number;
  /** Maximum number of entries to store */
  maxSize: number;
  /** AI version string for deterministic cache keys */
  aiVersion: string;
}

/**
 * Cache key components for deterministic key generation
 */
export interface CacheKeyComponents {
  /** Serialized input */
  input: string;
  /** Intent string */
  intent: string;
  /** Model used for generation */
  model: string;
  /** AI version for cache versioning */
  aiVersion: string;
}

/**
 * Cache key (string representation)
 */
export type CacheKey = string;

/**
 * Cache statistics for monitoring (optional)
 */
export interface CacheStats {
  /** Total number of entries */
  size: number;
  /** Number of cache hits */
  hits: number;
  /** Number of cache misses */
  misses: number;
  /** Hit rate percentage */
  hitRate: number;
}

/**
 * Cache interface - in-memory LRU with TTL
 */
export interface UICache {
  /**
   * Get cached result if it exists and hasn't expired
   */
  get(key: CacheKey): UIGenerationResult | null;

  /**
   * Store result in cache
   */
  set(key: CacheKey, result: UIGenerationResult): void;

  /**
   * Remove entry from cache
   */
  invalidate(key: CacheKey): void;

  /**
   * Clear all entries from cache
   */
  clear(): void;

  /**
   * Get current cache statistics
   */
  getStats(): CacheStats;

  /**
   * Generate deterministic cache key from components
   */
  generateKey(components: CacheKeyComponents): CacheKey;
}