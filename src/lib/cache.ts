// In-memory cache for AI responses
//
// CACHING STRATEGY:
// - Cache key = hash(input + selected_model)
// - Prevents expensive AI calls for repeated inputs
// - In-memory only - clears on page reload
// - No persistence required for POC
//
// CACHE KEY DESIGN:
// Hash ensures:
// - Same input + model = same cache hit
// - Different models = different cache entries
// - Input changes invalidate cache
//
// BOUNDARIES:
// - Frontend only - AI decisions cached client-side
// - Clear on reload - no complex invalidation needed
// - No size limits - POC usage is low volume

import { createHash } from 'crypto'

export interface CacheEntry {
  uiDescription: any // AI-generated UI description JSON
  timestamp: number
  model: string
}

// Simple in-memory cache map
// Key: hash of input + model
// Value: cached AI response
const cache = new Map<string, CacheEntry>()

// Generate cache key from input and model
// Uses SHA-256 hash for uniqueness
function generateCacheKey(input: string, model: string): string {
  const data = `${input.trim()}|${model}`
  return createHash('sha256').update(data).digest('hex')
}

// Check if cached result exists for input + model
export function getCachedResult(input: string, model: string): CacheEntry | null {
  const key = generateCacheKey(input, model)
  const entry = cache.get(key)

  if (entry) {
    console.log(`Cache hit for input hash: ${key.substring(0, 8)}...`)
    return entry
  }

  console.log(`Cache miss for input hash: ${key.substring(0, 8)}...`)
  return null
}

// Store AI response in cache
export function setCachedResult(input: string, model: string, uiDescription: any): void {
  const key = generateCacheKey(input, model)
  const entry: CacheEntry = {
    uiDescription,
    timestamp: Date.now(),
    model
  }

  cache.set(key, entry)
  console.log(`Cached result for input hash: ${key.substring(0, 8)}...`)
}

// Get cache statistics for debugging
export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()).map(key => key.substring(0, 8) + '...')
  }
}

// Clear entire cache (useful for debugging)
export function clearCache(): void {
  cache.clear()
  console.log('Cache cleared')
}