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
 * Handle GET /api/config - Get current configuration status
 */
export function handleGetConfig() {
  try {
    const status = getConfigStatus();
    return {
      status: 200,
      body: JSON.stringify(status),
      headers: { 'Content-Type': 'application/json' }
    };
  } catch (error) {
    console.error('[API Config] GET error:', error);
    return {
      status: 500,
      body: JSON.stringify({ error: 'Failed to get config status' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
}

/**
 * Handle POST /api/config - Update runtime configuration
 */
export async function handlePostConfig(requestBody: any) {
  try {
    // Validate request body
    if (!requestBody || typeof requestBody !== 'object') {
      return {
        status: 400,
        body: JSON.stringify({ error: 'Request body must be a valid object' }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    // Update configuration with validation
    const updatedConfig = updateRuntimeConfig(requestBody);

    console.log('[API Config] Configuration updated successfully');

    return {
      status: 200,
      body: JSON.stringify({
        success: true,
        config: updatedConfig,
        message: 'Configuration updated successfully'
      }),
      headers: { 'Content-Type': 'application/json' }
    };

  } catch (error) {
    if (error instanceof RuntimeConfigError) {
      console.warn('[API Config] Validation error:', error.message);
      return {
        status: 400,
        body: JSON.stringify({
          error: 'Configuration validation failed',
          details: error.message,
          validationDetails: error.details
        }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    console.error('[API Config] POST error:', error);
    return {
      status: 500,
      body: JSON.stringify({ error: 'Failed to update configuration' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
}

/**
 * Handle DELETE /api/config - Reset configuration to defaults
 */
export function handleDeleteConfig() {
  try {
    const resetConfig = resetRuntimeConfig();

    console.log('[API Config] Configuration reset to defaults');

    return {
      status: 200,
      body: JSON.stringify({
        success: true,
        config: resetConfig,
        message: 'Configuration reset to defaults'
      }),
      headers: { 'Content-Type': 'application/json' }
    };

  } catch (error) {
    console.error('[API Config] DELETE error:', error);
    return {
      status: 500,
      body: JSON.stringify({ error: 'Failed to reset configuration' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
}