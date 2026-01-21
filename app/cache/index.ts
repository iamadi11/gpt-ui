import { createHash } from 'crypto';
import {
  UICache,
  CacheEntry,
  CacheConfig,
  CacheKey,
  CacheKeyComponents,
  CacheStats,
  UIGenerationResult
} from './types';

/**
 * In-Memory LRU Cache for AI UI Generation
 *
 * FEATURES:
 * - LRU eviction when max size exceeded
 * - TTL-based expiration
 * - Deterministic key generation
 * - Memory-bounded (no persistence)
 * - Thread-safe for single-threaded Node.js
 */

/**
 * Simple LRU Cache implementation using Map
 * Map maintains insertion order, so we can implement LRU by re-inserting on access
 */
class LRUCache implements UICache {
  private cache = new Map<CacheKey, CacheEntry>();
  private accessOrder = new Map<CacheKey, number>(); // key -> last access time
  private config: CacheConfig;
  private stats = {
    hits: 0,
    misses: 0,
  };

  constructor(config: CacheConfig) {
    this.config = config;
  }

  /**
   * Get cached result if it exists and hasn't expired
   */
  get(key: CacheKey): UIGenerationResult | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check TTL
    const now = Date.now();
    const age = now - entry.timestamp;

    if (age > this.config.ttlMs) {
      // Expired - remove it
      this.cache.delete(key);
      this.accessOrder.delete(key);
      this.stats.misses++;
      return null;
    }

    // Update access order (re-insert to move to end)
    this.accessOrder.set(key, now);
    this.stats.hits++;

    return entry.result;
  }

  /**
   * Store result in cache with current timestamp
   */
  set(key: CacheKey, result: UIGenerationResult): void {
    const now = Date.now();
    const entry: CacheEntry = {
      result,
      timestamp: now,
    };

    // Remove if already exists (to update timestamp)
    this.cache.delete(key);

    // Add new entry
    this.cache.set(key, entry);
    this.accessOrder.set(key, now);

    // Enforce max size (LRU eviction)
    this.enforceMaxSize();
  }

  /**
   * Remove entry from cache
   */
  invalidate(key: CacheKey): void {
    this.cache.delete(key);
    this.accessOrder.delete(key);
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder.clear();
    this.stats.hits = 0;
    this.stats.misses = 0;
  }

  /**
   * Get current cache statistics
   */
  getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;

    return {
      size: this.cache.size,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: Math.round(hitRate * 100) / 100, // Round to 2 decimal places
    };
  }

  /**
   * Generate deterministic cache key using SHA-256
   * Key is based on input content, not timing or randomness
   */
  generateKey(components: CacheKeyComponents): CacheKey {
    const { input, intent, model, aiVersion } = components;

    // Create deterministic string representation
    const keyString = JSON.stringify({
      input,
      intent,
      model,
      aiVersion,
    }, Object.keys(components).sort()); // Sort keys for consistency

    // Hash to create fixed-length key
    return createHash('sha256').update(keyString).digest('hex');
  }

  /**
   * Enforce maximum cache size using LRU eviction
   */
  private enforceMaxSize(): void {
    while (this.cache.size > this.config.maxSize) {
      // Find least recently used (oldest access time)
      let lruKey: CacheKey | null = null;
      let oldestAccess = Infinity;

      for (const [key, accessTime] of this.accessOrder) {
        if (accessTime < oldestAccess) {
          oldestAccess = accessTime;
          lruKey = key;
        }
      }

      // Remove LRU entry
      if (lruKey) {
        this.cache.delete(lruKey);
        this.accessOrder.delete(lruKey);
      }
    }
  }
}

/**
 * Create and configure the UI cache instance
 */
function createCache(config: CacheConfig): UICache {
  return new LRUCache(config);
}

// Export the cache interface and factory
export type { UICache };
export { createCache };