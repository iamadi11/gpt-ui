import { generate, getConfig } from '../mcp';
import { UIGenerationResult } from '../shared/ui-schema';
import { validateUIGeneration, UIValidationError } from './validate-ui';
import { createCache, UICache } from '../cache';
import { getRuntimeConfig } from '../shared/runtime-config';

/**
 * UI Generation Service
 * Integrates MCP with AI-UI contract enforcement and transparent caching
 *
 * RESPONSIBILITIES:
 * - Transparent caching of AI results
 * - Calls MCP for AI generation (only on cache miss)
 * - Enforces UIGenerationResult contract
 * - Hard failure on invalid output
 * - No retries or auto-repair
 *
 * CACHE STRATEGY:
 * - Cache sits before MCP in request flow
 * - Stores only validated UIGenerationResult
 * - Deterministic keys from input + intent + model + aiVersion
 * - TTL and size-bounded memory usage
 * - Completely invisible to UI logic
 */

export class UIGenerationError extends Error {
  constructor(message: string, public readonly details?: any) {
    super(message);
    this.name = 'UIGenerationError';
  }
}

// Lazy-initialized cache instance
let uiCache: UICache | null = null;

function getCache(): UICache {
  if (!uiCache) {
    const config = getConfig();
    uiCache = createCache(config.cache);
  }
  return uiCache;
}

/**
 * Safely serialize input for cache key generation
 */
function serializeInput(input: string | object): string {
  if (typeof input === 'string') {
    return input;
  }

  try {
    return JSON.stringify(input, null, 0); // Compact JSON
  } catch (error) {
    throw new UIGenerationError(
      'Input object cannot be serialized to JSON',
      { input, serializationError: error }
    );
  }
}

/**
 * Generate UI using AI through MCP with transparent caching
 * Enforces strict contract compliance
 *
 * CACHE FLOW:
 * 1. Generate deterministic cache key
 * 2. Check cache for existing result
 * 3. If hit: return cached result
 * 4. If miss: call MCP → validate → store → return
 *
 * @param input - User input for UI generation
 * @param intent - Intent description for AI context
 * @returns Validated UIGenerationResult
 * @throws UIGenerationError on any validation failure
 */
export async function generateUI(
  input: string | object,
  intent: string
): Promise<UIGenerationResult> {
  try {
    // Get runtime config for dynamic model selection
    const runtimeConfig = getRuntimeConfig();

    // Get cache instance
    const cache = getCache();
    const config = getConfig();

    // Serialize input for cache key
    const serializedInput = serializeInput(input);

    // Generate deterministic cache key using runtime model
    const cacheKey = cache.generateKey({
      input: serializedInput,
      intent,
      model: runtimeConfig.activeModel,
      aiVersion: config.cache.aiVersion,
    });

    // Check cache first (with error handling)
    let cachedResult: UIGenerationResult | null = null;
    try {
      cachedResult = cache.get(cacheKey);
      if (cachedResult) {
        console.log(`[UI Generation] Cache hit for key: ${cacheKey.substring(0, 16)}...`);
        return cachedResult;
      }
    } catch (cacheError) {
      console.warn(`[UI Generation] Cache read failed, continuing without cache:`, cacheError);
    }

    // Cache miss - proceed with MCP call
    console.log(`[UI Generation] Cache miss, calling MCP for key: ${cacheKey.substring(0, 16)}...`);

    const mcpResponse = await generate({
      input,
      intent,
      model: runtimeConfig.activeModel, // Use runtime model selection
    });

    // Validate MCP output against contract
    // Hard failure - no retries, no auto-repair
    const validatedUI = validateUIGeneration(mcpResponse.output);

    // Store validated result in cache (with error handling)
    try {
      cache.set(cacheKey, validatedUI);
    } catch (cacheError) {
      console.warn(`[UI Generation] Cache write failed, continuing without caching:`, cacheError);
    }

    // Log successful generation
    console.log(`[UI Generation] Generated and cached UI with confidence: ${validatedUI.confidence}`);

    return validatedUI;

  } catch (error) {
    // Handle MCP errors
    if (error instanceof Error && error.message.includes('MCP')) {
      throw new UIGenerationError(
        `MCP generation failed: ${error.message}`,
        { mcpError: error }
      );
    }

    // Handle validation errors
    if (error instanceof UIValidationError) {
      throw new UIGenerationError(
        `AI output validation failed: ${error.message}`,
        { validationError: error, details: error.details }
      );
    }

    // Handle unexpected errors
    throw new UIGenerationError(
      'Unexpected UI generation error',
      { originalError: error }
    );
  }
}
