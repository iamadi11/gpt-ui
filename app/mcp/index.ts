import { GeneratePayload, GenerateResponse, ValidationError, ModelError } from './types';
import { getModelName, getConfig } from './config';
import { callOllama } from './client';

// Re-export config functions for external usage
export { getConfig } from './config';

/**
 * MCP Server Entry Point
 * Single interface between application and Ollama
 * Enforces all limits and provides deterministic responses
 */

/**
 * Generate content using Ollama models
 * This is the ONLY public API for AI interactions
 *
 * @param payload - Generation request payload
 * @returns Promise resolving to generation response
 * @throws ValidationError for invalid input
 * @throws ModelError for model/ollama errors
 */
export async function generate(payload: GeneratePayload): Promise<GenerateResponse> {
  const startTime = Date.now();

  try {
    // Input validation
    validatePayload(payload);

    // Safe serialization of input
    const serializedInput = serializeInput(payload.input);

    // Build prompt with intent context
    const prompt = buildPrompt(serializedInput, payload.intent);

    // Get model configuration
    const config = getConfig();
    const modelName = getModelName(payload.model);

    // Log invocation (required)
    logInvocation(payload, modelName);

    // Call Ollama client
    const clientResponse = await callOllama({
      prompt,
      model: modelName,
      maxTokens: config.maxTokens,
      maxContext: config.maxContext,
      timeout: config.timeout,
    });

    // Log completion
    const duration = Date.now() - startTime;
    console.log(`[MCP] Generation completed in ${duration}ms, tokens: ${clientResponse.tokensUsed}`);

    return {
      output: clientResponse.output,
      tokensUsed: clientResponse.tokensUsed,
      model: clientResponse.model,
    };

  } catch (error) {
    // Log errors
    const duration = Date.now() - startTime;
    console.error(`[MCP] Generation failed after ${duration}ms:`, error);

    // Re-throw with proper typing
    if (error instanceof ValidationError || error instanceof ModelError) {
      throw error;
    }

    // Wrap unknown errors
    throw new ModelError(
      'Unexpected error during generation',
      { originalError: error }
    );
  }
}

/**
 * Validate input payload
 * Rejects invalid or empty input explicitly
 */
function validatePayload(payload: GeneratePayload): void {
  if (!payload) {
    throw new ValidationError('Payload is required');
  }

  if (payload.input === null || payload.input === undefined) {
    throw new ValidationError('Input cannot be null or undefined');
  }

  if (typeof payload.input === 'string' && payload.input.trim() === '') {
    throw new ValidationError('String input cannot be empty');
  }

  if (!payload.intent || payload.intent.trim() === '') {
    throw new ValidationError('Intent is required and cannot be empty');
  }

  if (!payload.model || !['small', 'large'].includes(payload.model)) {
    throw new ValidationError(
      'Model must be "small" or "large"',
      { providedModel: payload.model }
    );
  }
}

/**
 * Safely serialize input to string
 * Handles both string and object inputs
 */
function serializeInput(input: string | object): string {
  if (typeof input === 'string') {
    return input;
  }

  try {
    // Safe JSON serialization with error handling
    return JSON.stringify(input, null, 0); // Compact JSON
  } catch (error) {
    throw new ValidationError(
      'Input object cannot be serialized to JSON',
      { input, serializationError: error }
    );
  }
}

/**
 * Build prompt from serialized input and intent
 * Provides context without any UI logic
 */
function buildPrompt(serializedInput: string, intent: string): string {
  return `${intent}\n\nInput: ${serializedInput}`;
}

/**
 * Log MCP invocation details
 * Required for monitoring and debugging
 */
function logInvocation(payload: GeneratePayload, modelName: string): void {
  const inputPreview = typeof payload.input === 'string'
    ? payload.input.substring(0, 100) + (payload.input.length > 100 ? '...' : '')
    : '[object]';

  console.log(`[MCP] Generating with model "${modelName}" for intent: "${payload.intent}"`);
  console.log(`[MCP] Input preview: ${inputPreview}`);
}

// Export types for external usage
export type { GeneratePayload, GenerateResponse };