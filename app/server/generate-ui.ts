import { generate } from '../mcp';
import { UIGenerationResult } from '../shared/ui-schema';
import { validateUIGeneration, UIValidationError } from './validate-ui';

/**
 * UI Generation Service
 * Integrates MCP with AI-UI contract enforcement
 *
 * RESPONSIBILITIES:
 * - Calls MCP for AI generation
 * - Enforces UIGenerationResult contract
 * - Hard failure on invalid output
 * - No retries or auto-repair
 *
 * CONTRACT ENFORCEMENT:
 * - MCP output must be valid UIGenerationResult JSON
 * - Invalid JSON → hard failure
 * - Partial/malformed output → rejected
 * - No transformation or interpretation
 */

export class UIGenerationError extends Error {
  constructor(message: string, public readonly details?: any) {
    super(message);
    this.name = 'UIGenerationError';
  }
}

/**
 * Generate UI using AI through MCP
 * Enforces strict contract compliance
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
    // Call MCP (Phase 1 boundary)
    const mcpResponse = await generate({
      input,
      intent,
      model: 'small', // Only small model implemented
    });

    // Validate MCP output against contract
    // Hard failure - no retries, no auto-repair
    const validatedUI = validateUIGeneration(mcpResponse.output);

    // Log successful generation
    console.log(`[UI Generation] Generated UI with confidence: ${validatedUI.confidence}`);

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