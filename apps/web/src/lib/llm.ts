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

// Pull/install a model from Ollama
export async function pullModel(model: string, endpoint?: string): Promise<void> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), OLLAMA_CONFIG.modelPullTimeoutMs)

  try {
    const pullEndpoint = endpoint ? endpoint.replace('/api/generate', '/api/pull') : 'http://localhost:11434/api/pull'

    const response = await fetch(pullEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: model,
        stream: false,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to pull model ${model}: ${response.status} ${response.statusText}\n${errorText}`)
    }

    // Wait for the response to complete (model installation)
    await response.json()
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Model pull timed out after ${OLLAMA_CONFIG.modelPullTimeoutMs}ms`)
    }
    throw error
  }
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

      // Check if the model is not found and attempt to install it
      if (response.status === 404 || errorText.toLowerCase().includes('model not found') || errorText.toLowerCase().includes('no such model')) {
        console.log(`Model "${model}" not found. Attempting to install...`)

        try {
          await pullModel(model, endpoint)
          console.log(`Model "${model}" installed successfully. Retrying request...`)

          // Retry the original request after installation
          return await callOllama(model, prompt, endpoint)
        } catch (pullError) {
          throw new Error(`Model "${model}" not found and installation failed: ${pullError instanceof Error ? pullError.message : 'Unknown error'}`)
        }
      }

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