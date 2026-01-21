import { generateUI } from '../../server/generate-ui';

/**
 * Generate UI API Endpoint
 * Full pipeline: Input → Cache → MCP → Validation → Response
 *
 * POST /api/generate-ui
 * Body: { input: string | object, intent: string }
 *
 * Response: UIGenerationResult JSON or error
 */

/**
 * POST /api/generate-ui - Generate UI from AI
 */
export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    // Parse request body
    const body = await request.json();

    if (!body || typeof body !== 'object') {
      return new Response(
        JSON.stringify({
          error: 'Request body must be a valid object',
          code: 'INVALID_REQUEST'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const { input, intent } = body;

    // Validate required fields
    if (input === undefined || input === null) {
      return new Response(
        JSON.stringify({
          error: 'Input is required',
          code: 'MISSING_INPUT'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (!intent || typeof intent !== 'string' || intent.trim() === '') {
      return new Response(
        JSON.stringify({
          error: 'Intent is required and must be a non-empty string',
          code: 'INVALID_INTENT'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`[API Generate UI] Processing request with intent: "${intent}"`);

    // Execute full pipeline: Cache → MCP → Validation
    const result = await generateUI(input, intent);

    const duration = Date.now() - startTime;
    console.log(`[API Generate UI] Completed in ${duration}ms, confidence: ${result.confidence}`);

    // Return successful result
    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[API Generate UI] Failed after ${duration}ms:`, error);

    // Handle different error types
    if (error instanceof Error) {
      // Check for specific error types from our pipeline
      if (error.message.includes('MCP')) {
        return new Response(
          JSON.stringify({
            error: 'AI generation service unavailable',
            details: error.message,
            code: 'MCP_ERROR',
            fallback: {
              reason: 'AI service error',
              raw: { input: 'Service temporarily unavailable' }
            }
          }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      if (error.message.includes('validation') || error.message.includes('Validation')) {
        return new Response(
          JSON.stringify({
            error: 'AI output validation failed',
            details: error.message,
            code: 'VALIDATION_ERROR',
            fallback: {
              reason: 'AI output invalid',
              raw: { input: 'Invalid AI response format' }
            }
          }),
          {
            status: 502,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      // Generic error with fallback
      return new Response(
        JSON.stringify({
          error: 'UI generation failed',
          details: error.message,
          code: 'GENERATION_ERROR',
          fallback: {
            reason: 'Unexpected error',
            raw: { error: error.message }
          }
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Unknown error
    return new Response(
      JSON.stringify({
        error: 'Unknown error occurred',
        code: 'UNKNOWN_ERROR',
        fallback: {
          reason: 'System error',
          raw: { error: 'Unknown system error' }
        }
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * GET /api/generate-ui - Health check
 */
export async function GET() {
  return new Response(
    JSON.stringify({
      status: 'healthy',
      message: 'UI Generation API is operational',
      pipeline: 'Input → Cache → MCP → Validation → Response'
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}