import { ClientRequest, ClientResponse, OllamaRequest, OllamaResponse, ModelError } from './types';

/**
 * Ollama Client Wrapper
 * Abstracts all direct Ollama interactions
 * Returns raw model output without any processing
 */

// Ollama API endpoint
const OLLAMA_BASE_URL = 'http://localhost:11434';
const OLLAMA_GENERATE_ENDPOINT = '/api/generate';

/**
 * Send a request to Ollama and return raw response
 * Enforces all limits and handles errors explicitly
 */
export async function callOllama(request: ClientRequest): Promise<ClientResponse> {
  const { prompt, model, maxTokens, maxContext, timeout } = request;

  // Build Ollama API request
  const ollamaRequest: OllamaRequest = {
    model,
    prompt,
    num_predict: maxTokens,
    num_ctx: maxContext,
    stream: false, // Explicitly disable streaming
  };

  try {
    // Make HTTP request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(`${OLLAMA_BASE_URL}${OLLAMA_GENERATE_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ollamaRequest),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Check for HTTP errors
    if (!response.ok) {
      const errorText = await response.text();
      throw new ModelError(
        `Ollama API error: ${response.status} ${response.statusText}`,
        {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          model,
        }
      );
    }

    // Parse response
    const ollamaResponse: OllamaResponse = await response.json();

    // Validate response structure
    if (typeof ollamaResponse.response !== 'string') {
      throw new ModelError(
        'Invalid Ollama response: missing or invalid response field',
        { response: ollamaResponse, model }
      );
    }

    // Extract token usage (fallback to estimated if not provided)
    const tokensUsed = ollamaResponse.eval_count || estimateTokenCount(ollamaResponse.response);

    return {
      output: ollamaResponse.response,
      tokensUsed,
      model: ollamaResponse.model || model,
    };

  } catch (error) {
    // Handle different error types
    if (error instanceof ModelError) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new ModelError(
          `Request timeout after ${timeout}ms`,
          { timeout, model, originalError: error.message }
        );
      }

      if (error.message.includes('fetch')) {
        throw new ModelError(
          'Failed to connect to Ollama. Ensure Ollama is running on localhost:11434',
          { model, originalError: error.message }
        );
      }
    }

    // Generic error fallback
    throw new ModelError(
      'Unknown error occurred during Ollama request',
      { model, originalError: error }
    );
  }
}

/**
 * Rough token estimation for responses that don't provide eval_count
 * This is a fallback and not precise
 */
function estimateTokenCount(text: string): number {
  // Rough estimation: ~4 characters per token for English text
  // This is not accurate but provides a reasonable fallback
  return Math.ceil(text.length / 4);
}