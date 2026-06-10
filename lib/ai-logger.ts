// lib/ai-logger.ts — Lightweight AI request logger
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
