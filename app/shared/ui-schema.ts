/**
 * AI → UI Contract Definition
 * Defines the structure for AI-generated UI without any assumptions
 *
 * AI DECIDES (fully responsible for):
 * - Layout type and structure
 * - Component hierarchy and relationships
 * - Content density and arrangement
 * - Visualization choices for data
 * - Ordering and grouping of elements
 * - Component properties and behaviors
 *
 * APPLICATION DOES (zero interpretation):
 * - Accepts the contract as-is
 * - Validates shape only (no transformation)
 * - Stores the raw AI decision
 * - Passes through to rendering (future phase)
 * - Rejects malformed output (no auto-repair)
 */

/**
 * The complete result of UI generation from AI
 * AI has full control over UI structure and content
 */
export type UIGenerationResult = {
  /** AI confidence in the generated UI (0.0 to 1.0) */
  confidence: number;

  /** The UI structure decided by AI */
  ui: {
    /** Layout structure chosen by AI */
    layout: any;

    /** Array of components decided by AI */
    components: any[];
  };

  /** Optional fallback when AI cannot generate valid UI */
  fallback?: {
    /** Reason AI could not generate UI */
    reason: string;

    /** Raw input or partial result */
    raw: string | object;
  };
};

/**
 * Export types for use across the application
 * These types define the contract boundary between AI and UI
 */
export type { UIGenerationResult };