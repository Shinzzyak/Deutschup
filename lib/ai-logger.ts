import { getSupabaseAdminClient } from './api-utils.js';

interface AiLogParams {
  userId?: string;
  endpoint?: string;
  model?: string;
  latencyMs?: number;
  success?: boolean;
  errorMessage?: string | null;
  providerId?: string;
  modelId?: string;
  tokensIn?: number;
  tokensOut?: number;
  costUsd?: number;
}

/**
 * Log AI request to ai_usage_log table.
 * Non-blocking — errors are caught and logged to console only.
 */
export async function logAiRequest(params: AiLogParams): Promise<void> {
  try {
    const supabase = getSupabaseAdminClient();

    // Use new ai_usage_log table
    await supabase.from('ai_usage_log').insert({
      user_id: params.userId || 'anonymous',
      provider_id: params.providerId || 'unknown',
      model_id: params.modelId || params.model || 'unknown',
      endpoint: params.endpoint || 'unknown',
      latency_ms: params.latencyMs || 0,
      tokens_in: params.tokensIn || 0,
      tokens_out: params.tokensOut || 0,
      cost_usd: params.costUsd || 0,
      success: params.success !== false,
      error_message: params.errorMessage || null,
    });
  } catch (error) {
    // Non-blocking: just log to console
    console.error('[AI-LOGGER] Failed to log AI request:', error);
  }
}
