import { createHash } from 'crypto'
import type { CacheEntry, CacheConfig, UIDescription, InferenceConfig } from '@gpt-ui/schema'

// Multi-layer caching strategy for AI responses
//
// CACHE LAYERS:
// 1. Prompt Hash Cache - Cache based on prompt content + model + config
// 2. Data Hash Cache - Cache based on input data hash
// 3. UI Schema Cache - Cache final UI descriptions
// 4. Model Output Cache - Cache raw LLM responses
//
// CACHE INVALIDATION:
// - TTL-based expiration
// - Size-based eviction (LRU)
// - Hash-based deterministic keys
// - Manual invalidation on config changes

export interface CacheKey {
  promptHash: string
  dataHash: string
  model: string
  configHash: string
}

export interface CacheStats {
  size: number
  hits: number
  misses: number
  evictions: number
  hitRate: number
}

class AICache {
  private cache = new Map<string, CacheEntry>()
  private accessOrder = new Map<string, number>() // For LRU eviction
  private accessCounter = 0
  private stats = { hits: 0, misses: 0, evictions: 0 }

  constructor(private config: CacheConfig) {}

  // Generate deterministic cache key from components
  generateKey(input: string, model: string, config?: InferenceConfig): CacheKey {
    const dataHash = createHash('sha256').update(input.trim()).digest('hex')
    const configHash = config ? createHash('sha256').update(JSON.stringify(config)).digest('hex') : ''
    const promptHash = createHash('sha256').update(`${dataHash}|${model}|${configHash}`).digest('hex')

    return {
      promptHash,
      dataHash,
      model,
      configHash
    }
  }

  // Get cache key string for storage
  private getCacheKeyString(key: CacheKey): string {
    return `${key.promptHash}|${key.dataHash}|${key.model}|${key.configHash}`
  }

  // Check if entry exists and is not expired
  get(key: CacheKey): CacheEntry | null {
    const keyString = this.getCacheKeyString(key)
    const entry = this.cache.get(keyString)

    if (!entry) {
      this.stats.misses++
      return null
    }

    // Check TTL
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.cache.delete(keyString)
      this.stats.misses++
      return null
    }

    // Update access order for LRU
    this.accessOrder.set(keyString, ++this.accessCounter)
    this.stats.hits++

    return entry
  }

  // Store entry in cache
  set(key: CacheKey, data: any, metadata?: Partial<CacheEntry['metadata']>): void {
    const keyString = this.getCacheKeyString(key)
    const expiresAt = this.config.ttl > 0 ? Date.now() + this.config.ttl : undefined

    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      expiresAt,
      metadata: {
        inputHash: key.dataHash,
        model: key.model,
        configHash: key.configHash,
        ...metadata
      }
    }

    // Check size limits and evict if necessary
    if (this.cache.size >= this.config.maxSize) {
      this.evict()
    }

    this.cache.set(keyString, entry)
    this.accessOrder.set(keyString, ++this.accessCounter)
  }

  // Evict entries based on strategy
  private evict(): void {
    if (this.config.strategy === 'lru') {
      // Find least recently used
      let oldestKey = ''
      let oldestTime = Infinity

      for (const entry of Array.from(this.accessOrder.entries())) {
        const [key, time] = entry
        if (time < oldestTime) {
          oldestTime = time
          oldestKey = key
        }
      }

      if (oldestKey) {
        this.cache.delete(oldestKey)
        this.accessOrder.delete(oldestKey)
        this.stats.evictions++
      }
    } else if (this.config.strategy === 'fifo') {
      // Find oldest entry
      let oldestKey = ''
      let oldestTime = Infinity

      for (const entry of Array.from(this.cache.entries())) {
        const [key, cacheEntry] = entry
        if (cacheEntry.timestamp < oldestTime) {
          oldestTime = cacheEntry.timestamp
          oldestKey = key
        }
      }

      if (oldestKey) {
        this.cache.delete(oldestKey)
        this.accessOrder.delete(oldestKey)
        this.stats.evictions++
      }
    }
  }

  // Clear all cache entries
  clear(): void {
    this.cache.clear()
    this.accessOrder.clear()
    this.stats = { hits: 0, misses: 0, evictions: 0 }
  }

  // Get cache statistics
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses
    return {
      size: this.cache.size,
      hits: this.stats.hits,
      misses: this.stats.misses,
      evictions: this.stats.evictions,
      hitRate: total > 0 ? this.stats.hits / total : 0
    }
  }

  // Get all cache entries (for debugging)
  getAllEntries(): Array<{ key: CacheKey; entry: CacheEntry }> {
    return Array.from(this.cache.entries()).map(([keyString, entry]) => {
      const [promptHash, dataHash, model, configHash] = keyString.split('|')
      return {
        key: { promptHash, dataHash, model, configHash },
        entry
      }
    })
  }
}

// Global cache instance
let globalCache: AICache | null = null

export function initializeCache(config: CacheConfig): void {
  globalCache = new AICache(config)
}

export function getCache(): AICache {
  if (!globalCache) {
    throw new Error('Cache not initialized. Call initializeCache() first.')
  }
  return globalCache
}

// Convenience functions for UI inference caching
export function getCachedUIDescription(input: string, model: string, config?: InferenceConfig): UIDescription | null {
  if (!globalCache) return null

  const key = globalCache.generateKey(input, model, config)
  const entry = globalCache.get(key)

  return entry ? entry.data : null
}

export function setCachedUIDescription(input: string, model: string, uiDescription: UIDescription, config?: InferenceConfig): void {
  if (!globalCache) return

  const key = globalCache.generateKey(input, model, config)
  globalCache.set(key, uiDescription)
}

export function getCacheStats(): CacheStats {
  return globalCache ? globalCache.getStats() : { size: 0, hits: 0, misses: 0, evictions: 0, hitRate: 0 }
}

export function clearCache(): void {
  globalCache?.clear()
}

// Invalidate cache entries that don't match current configuration
export function invalidateStaleCacheEntries(currentConfigHash: string): void {
  if (!globalCache) return

  const allEntries = globalCache.getAllEntries()
  for (const { key } of allEntries) {
    if (key.configHash !== currentConfigHash) {
      globalCache['cache'].delete(globalCache['getCacheKeyString'](key))
      globalCache['accessOrder'].delete(globalCache['getCacheKeyString'](key))
    }
  }
}

// Default cache configuration
export const DEFAULT_CACHE_CONFIG: CacheConfig = {
  ttl: 30 * 60 * 1000, // 30 minutes
  maxSize: 1000, // 1000 entries
  strategy: 'lru'
}