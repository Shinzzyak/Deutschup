/**
 * Discord Webhook Notifier
 * Sends admin notifications to Discord channel via webhook URL.
 * Use: notifyDiscord({ title, description, color, fields, event })
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

type WebhookField = { name: string; value: string; inline?: boolean };

interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  fields?: WebhookField[];
  timestamp?: string;
  footer?: { text: string };
}

interface DiscordPayload {
  username?: string;
  avatar_url?: string;
  content?: string;
  embeds?: DiscordEmbed[];
}

interface NotifyOptions {
  title: string;
  description?: string;
  color?: 'info' | 'success' | 'warning' | 'error';
  fields?: WebhookField[];
  event?: string;
  url?: string; // override webhook URL (for testing)
}

const COLOR_MAP: Record<string, number> = {
  info: 0x3b82f6,    // blue
  success: 0x10b981, // green
  warning: 0xf59e0b, // amber
  error: 0xef4444,   // red
};

const WEBHOOK_TIMEOUT_MS = 5000;

export async function notifyDiscord(opts: NotifyOptions): Promise<{ ok: boolean; status?: number; error?: string }> {
  const url = opts.url || process.env.DISCORD_WEBHOOK_URL;
  if (!url) {
    return { ok: false, error: 'DISCORD_WEBHOOK_URL not configured' };
  }

  const payload: DiscordPayload = {
    username: 'Deutschup Admin',
    embeds: [
      {
        title: opts.title,
        description: opts.description,
        color: COLOR_MAP[opts.color || 'info'],
        fields: opts.fields,
        timestamp: new Date().toISOString(),
        footer: opts.event ? { text: `Event: ${opts.event}` } : undefined,
      },
    ],
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return { ok: false, status: res.status, error: text.slice(0, 200) };
    }

    return { ok: true, status: res.status };
  } catch (e: any) {
    if (e.name === 'AbortError') {
      return { ok: false, error: 'Webhook request timed out (5s)' };
    }
    return { ok: false, error: e.message || String(e) };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Test endpoint — sends a test notification to verify webhook works.
 * POST /api/webhook-notify with { test: true } or { title, description, color }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};
  const isTest = body.test === true;

  const result = await notifyDiscord({
    title: isTest ? '🧪 Deutschup Webhook Test' : (body.title || 'Notification'),
    description: body.description || (isTest ? 'If you see this in Discord, the webhook is configured correctly.' : undefined),
    color: body.color || (isTest ? 'info' : 'info'),
    fields: body.fields,
    event: body.event || (isTest ? 'webhook.test' : 'webhook.notify'),
  });

  if (result.ok) {
    return res.status(200).json({ success: true, status: result.status });
  } else {
    return res.status(500).json({ success: false, error: result.error });
  }
}
