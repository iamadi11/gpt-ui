// Thin Ollama Client for POC
//
// WHY THIS EXISTS:
// - No abstractions - direct API calls keep things simple and debuggable
// - Strict memory limits prevent OOM crashes on consumer hardware
// - Synchronous responses - no streaming to avoid complexity
//
// MEMORY TRADEOFFS:
// - num_ctx=2048: Limits context but keeps memory usage predictable
// - num_predict=256: Constrains output but ensures fast responses
// - No batching: Simpler but less efficient
// - Single timeout: Prevents hanging but may fail on slow models

import { MEMORY_LIMITS, OLLAMA_CONFIG } from '@/config/llm'

export interface OllamaResponse {
  content: string
  model: string
}

// Call Ollama with strict memory limits
// Memory usage stays under 2GB total for model + context + overhead
export async function callOllama(model: string, prompt: string, endpoint?: string): Promise<OllamaResponse> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), OLLAMA_CONFIG.timeoutMs)

  try {
    const response = await fetch(endpoint || OLLAMA_CONFIG.defaultEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        options: {
          temperature: OLLAMA_CONFIG.temperature,
          // Strict memory limits - these values keep RAM usage under 2GB
          num_ctx: MEMORY_LIMITS.maxContextTokens,    // 2048 tokens context
          num_predict: MEMORY_LIMITS.maxOutputTokens, // 256 tokens max output
        },
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}\n${errorText}`)
    }

    const data = await response.json()

    return {
      content: data.response || '',
      model,
    }
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Ollama request timed out after ${OLLAMA_CONFIG.timeoutMs}ms`)
    }
    throw error
  }
}