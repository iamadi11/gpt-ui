import { UIGenerationResult } from '../shared/ui-schema';

/**
 * UI Validation Layer
 * Validates AI output against contract without interpretation
 *
 * RESPONSIBILITIES:
 * - JSON parsing (if needed)
 * - Shape validation (required keys exist)
 * - Type checking (confidence is number)
 * - Structure verification (ui object exists)
 *
 * DOES NOT:
 * - Transform data
 * - Normalize values
 * - Guess intent
 * - Repair malformed output
 * - Add defaults
 * - Interpret meaning
 */

export class UIValidationError extends Error {
  constructor(message: string, public readonly details?: any) {
    super(message);
    this.name = 'UIValidationError';
  }
}

/**
 * Validate raw AI output against UI generation contract
 * Accepts string (JSON) or object input
 * Returns validated UIGenerationResult or throws
 */
export function validateUIGeneration(rawOutput: string | object): UIGenerationResult {
  try {
    // Parse JSON if input is string
    let parsed: any;
    if (typeof rawOutput === 'string') {
      try {
        parsed = JSON.parse(rawOutput);
      } catch (parseError) {
        const errorMessage = parseError instanceof Error ? parseError.message : String(parseError);
        throw new UIValidationError(
          'Invalid JSON format in AI output',
          { parseError: errorMessage, rawOutput: rawOutput.substring(0, 200) }
        );
      }
    } else {
      parsed = rawOutput;
    }

    // Validate top-level structure
    if (!parsed || typeof parsed !== 'object') {
      throw new UIValidationError(
        'AI output must be an object',
        { receivedType: typeof parsed, parsed }
      );
    }

    // Check required keys exist
    if (!('confidence' in parsed)) {
      throw new UIValidationError(
        'Missing required field: confidence',
        { availableKeys: Object.keys(parsed) }
      );
    }

    if (!('ui' in parsed)) {
      throw new UIValidationError(
        'Missing required field: ui',
        { availableKeys: Object.keys(parsed) }
      );
    }

    // Validate confidence is a number
    if (typeof parsed.confidence !== 'number') {
      throw new UIValidationError(
        'Confidence must be a number',
        { receivedType: typeof parsed.confidence, confidence: parsed.confidence }
      );
    }

    // Validate ui structure
    if (!parsed.ui || typeof parsed.ui !== 'object') {
      throw new UIValidationError(
        'UI field must be an object',
        { uiType: typeof parsed.ui, ui: parsed.ui }
      );
    }

    if (!('layout' in parsed.ui)) {
      throw new UIValidationError(
        'UI object missing required field: layout',
        { uiKeys: Object.keys(parsed.ui) }
      );
    }

    if (!('components' in parsed.ui)) {
      throw new UIValidationError(
        'UI object missing required field: components',
        { uiKeys: Object.keys(parsed.ui) }
      );
    }

    // Validate components is an array
    if (!Array.isArray(parsed.ui.components)) {
      throw new UIValidationError(
        'UI components must be an array',
        { componentsType: typeof parsed.ui.components, components: parsed.ui.components }
      );
    }

    // Optional fallback validation (if present)
    if ('fallback' in parsed) {
      if (parsed.fallback && typeof parsed.fallback === 'object') {
        if (!('reason' in parsed.fallback)) {
          throw new UIValidationError(
            'Fallback object missing required field: reason',
            { fallbackKeys: Object.keys(parsed.fallback) }
          );
        }

        if (!('raw' in parsed.fallback)) {
          throw new UIValidationError(
            'Fallback object missing required field: raw',
            { fallbackKeys: Object.keys(parsed.fallback) }
          );
        }
      } else if (parsed.fallback !== undefined) {
        throw new UIValidationError(
          'Fallback must be an object or undefined',
          { fallbackType: typeof parsed.fallback, fallback: parsed.fallback }
        );
      }
    }

    // Return validated result (no transformation)
    return parsed as UIGenerationResult;

  } catch (error) {
    if (error instanceof UIValidationError) {
      throw error;
    }

    // Wrap unexpected errors
    throw new UIValidationError(
      'Unexpected validation error',
      { originalError: error, rawOutput: typeof rawOutput === 'string' ? rawOutput.substring(0, 200) : rawOutput }
    );
  }
}