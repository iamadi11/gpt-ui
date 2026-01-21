import {
  getRuntimeConfig,
  updateRuntimeConfig,
  getConfigStatus,
  resetRuntimeConfig,
  RuntimeConfigError
} from '../../shared/runtime-config';

/**
 * API Route for Runtime Configuration Management
 * Safe configuration updates from dashboard
 *
 * CONTROL PLANE API:
 * - GET: Read current config status
 * - POST: Update config with validation
 * - DELETE: Reset to defaults (emergency)
 */

/**
 * GET /api/config - Get current configuration status
 */
export async function GET() {
  try {
    const status = getConfigStatus();
    return new Response(JSON.stringify(status), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[API Config] GET error:', error);
    return new Response(JSON.stringify({ error: 'Failed to get config status' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * POST /api/config - Update runtime configuration
 */
export async function POST(request: Request) {
  try {
    // Parse request body
    const requestBody = await request.json();

    // Validate request body
    if (!requestBody || typeof requestBody !== 'object') {
      return new Response(JSON.stringify({ error: 'Request body must be a valid object' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update configuration with validation
    const updatedConfig = updateRuntimeConfig(requestBody);

    console.log('[API Config] Configuration updated successfully');

    return new Response(JSON.stringify({
      success: true,
      config: updatedConfig,
      message: 'Configuration updated successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    if (error instanceof RuntimeConfigError) {
      console.warn('[API Config] Validation error:', error.message);
      return new Response(JSON.stringify({
        error: 'Configuration validation failed',
        details: error.message,
        validationDetails: error.details
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.error('[API Config] POST error:', error);
    return new Response(JSON.stringify({ error: 'Failed to update configuration' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * DELETE /api/config - Reset configuration to defaults
 */
export async function DELETE() {
  try {
    const resetConfig = resetRuntimeConfig();

    console.log('[API Config] Configuration reset to defaults');

    return new Response(JSON.stringify({
      success: true,
      config: resetConfig,
      message: 'Configuration reset to defaults'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[API Config] DELETE error:', error);
    return new Response(JSON.stringify({ error: 'Failed to reset configuration' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}