// @ts-nocheck
// Cloudflare Pages Function catch-all for /api/*
import { runVercelHandler } from '../lib/vercel-adapter';

import ping from '../../api/ping';
import diag from '../../api/diag';
import keepalive from '../../api/keepalive';
import ai from '../../api/ai';
import admin from '../../api/admin';
import adminAi from '../../api/admin-ai';
import adminStats from '../../api/admin-stats';
import customProvider from '../../api/custom-provider';
import dbProxy from '../../api/db-proxy';
import debugUser from '../../api/debug-user';
import payment from '../../api/payment';
import webhookNotify from '../../api/webhook-notify';
import curriculum from '../../api/curriculum';

type Handler = (req: any, res: any) => any;

const ROUTES: Record<string, Handler> = {
  ping,
  diag,
  keepalive,
  ai,
  admin,
  'admin-ai': adminAi,
  'admin-stats': adminStats,
  'custom-provider': customProvider,
  'db-proxy': dbProxy,
  'debug-user': debugUser,
  payment,
  'webhook-notify': webhookNotify,
  curriculum,
};

function corsHeaders(origin: string | null): HeadersInit {
  let allow = 'https://deutschup.sintec.my.id';
  if (origin) {
    try {
      const host = new URL(origin).host;
      if (/^(deutschup\.sintec\.my\.id|([a-z0-9-]+\.)?deutschup\.pages\.dev)$/i.test(host)) {
        allow = origin;
      }
    } catch {
      /* keep default */
    }
  }
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-keepalive-secret',
    'Access-Control-Max-Age': '86400',
  };
}

function pathName(params: any, request: Request): string[] {
  const raw = params?.path;
  if (Array.isArray(raw) && raw.length) return raw.map(String);
  if (typeof raw === 'string' && raw) return raw.split('/').filter(Boolean);
  // fallback: parse URL /api/<name>/...
  try {
    const u = new URL(request.url);
    const segs = u.pathname.replace(/^\/api\/?/, '').split('/').filter(Boolean);
    return segs;
  } catch {
    return [];
  }
}

export const onRequest: PagesFunction = async (context) => {
  const { request, params, env } = context;
  // inject Pages env into process.env for legacy handlers
  try {
    const g: any = globalThis as any;
    if (!g.process) g.process = { env: {} };
    if (!g.process.env) g.process.env = {};
    if (env && typeof env === 'object') {
      for (const [k, v] of Object.entries(env as Record<string, unknown>)) {
        if (typeof v === 'string') g.process.env[k] = v;
      }
    }
  } catch {
    /* ignore */
  }

  const parts = pathName(params, request);
  const name = (parts[0] || '').toLowerCase();

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(request.headers.get('Origin')) });
  }

  const handler = ROUTES[name];
  if (!handler) {
    return new Response(JSON.stringify({ error: 'Not found', path: name || null, parts }), {
      status: 404,
      headers: { 'content-type': 'application/json; charset=utf-8', ...corsHeaders(request.headers.get('Origin')) },
    });
  }

  try {
    const res = await runVercelHandler(handler, request, parts.slice(1));
    const headers = new Headers(res.headers);
    const cors = corsHeaders(request.headers.get('Origin'));
    for (const [k, v] of Object.entries(cors)) headers.set(k, v as string);
    return new Response(res.body, { status: res.status, headers });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'function error', path: name }), {
      status: 500,
      headers: { 'content-type': 'application/json; charset=utf-8', ...corsHeaders(request.headers.get('Origin')) },
    });
  }
};
