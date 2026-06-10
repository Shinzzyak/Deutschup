// lib/ai-logger.ts — Lightweight AI request logger
// Call logAiRequest() after every AI API call

import { getDb } from './api-utils.js';

interface LogRequest {
  userId?: string;
  endpoint: string;
  model: string;
  latencyMs: number;
  success: boolean;
  errorMessage?: string;
}

export async function logAiRequest(req: LogRequest): Promise<void> {
  try {
    await getDb().from('ai_requests').insert({
      user_id: req.userId || null,
      endpoint: req.endpoint,
      model: req.model,
      latency_ms: req.latencyMs,
      success: req.success,
      error_message: req.errorMessage || null,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    // Silent fail — logging should never break the app
    console.warn('[AI-LOG] Failed to log request:', err);
  }
}

// Helper: wrap an AI call with timing
export async function withAiLogging<T>(
  endpoint: string,
  model: string,
  userId: string | undefined,
  fn: () => Promise<T>
): Promise<T> {
  const start = Date.now();
  let success = true;
  let errorMessage: string | undefined;

  try {
    const result = await fn();
    return result;
  } catch (err: any) {
    success = false;
    errorMessage = err?.message || 'Unknown error';
    throw err;
  } finally {
    logAiRequest({
      userId,
      endpoint,
      model,
      latencyMs: Date.now() - start,
      success,
      errorMessage,
    });
  }
}
