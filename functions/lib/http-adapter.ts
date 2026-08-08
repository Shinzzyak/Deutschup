// Adapts the Node-style (req, res) handlers in api/ to the Fetch API objects
// used by Cloudflare Pages Functions.
// ponytail: in-memory only; no streaming/multipart polish until needed.

import type { ApiRequest, ApiResponse } from '../../lib/http-types';

export async function toApiRequest(request: Request, pathParams?: string[]): Promise<ApiRequest> {
  const url = new URL(request.url);
  const headers: Record<string, string> = {};
  request.headers.forEach((v, k) => {
    headers[k.toLowerCase()] = v;
  });
  // common aliases used by handlers
  if (headers['x-forwarded-for'] == null) {
    headers['x-forwarded-for'] = headers['cf-connecting-ip'] || 'unknown';
  }

  const query: Record<string, string | string[]> = {};
  url.searchParams.forEach((v, k) => {
    if (k in query) {
      const cur = query[k];
      query[k] = Array.isArray(cur) ? [...cur, v] : [cur as string, v];
    } else {
      query[k] = v;
    }
  });

  let rawBody = '';
  let body: any = undefined;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    const ct = headers['content-type'] || '';
    const raw = await request.text();
    rawBody = raw;
    if (!raw) body = undefined;
    else if (ct.includes('application/json')) {
      try {
        body = JSON.parse(raw);
      } catch {
        body = raw;
      }
    } else if (ct.includes('application/x-www-form-urlencoded')) {
      body = Object.fromEntries(new URLSearchParams(raw));
    } else {
      try {
        body = JSON.parse(raw);
      } catch {
        body = raw;
      }
    }
  }

  // path leftover available if needed
  if (pathParams?.length) query.__path = pathParams.join('/');

  return {
    method: request.method,
    url: request.url,
    headers,
    query,
    body,
    rawBody,
    cookies: {},
    // Replay the already-buffered body for handlers that read the request as a
    // stream (e.g. the payment callback parser).
    async *[Symbol.asyncIterator]() {
      if (rawBody) yield new TextEncoder().encode(rawBody);
    },
  };
}

export function createApiResponse(): { res: ApiResponse; wait: Promise<Response> } {
  let resolve!: (r: Response) => void;
  const wait = new Promise<Response>((r) => {
    resolve = r;
  });
  let settled = false;

  const res: ApiResponse = {
    statusCode: 200,
    headers: {},
    body: null,
    headersSent: false,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    setHeader(k: string, v: string | number | string[]) {
      this.headers[k.toLowerCase()] = v;
      return this;
    },
    getHeader(k: string) {
      return this.headers[k.toLowerCase()];
    },
    json(data: any) {
      this.setHeader('content-type', 'application/json; charset=utf-8');
      this.body = JSON.stringify(data);
      return this.end();
    },
    send(data?: any) {
      if (data != null && this.body == null) {
        if (typeof data === 'object' && !(data instanceof Uint8Array)) {
          this.setHeader('content-type', this.getHeader('content-type') || 'application/json; charset=utf-8');
          this.body = JSON.stringify(data);
        } else {
          this.body = data as any;
        }
      }
      return this.end();
    },
    end(data?: any) {
      if (settled) return this;
      settled = true;
      this.headersSent = true;
      if (data != null) this.body = typeof data === 'string' || data instanceof Uint8Array ? data : String(data);
      const headers = new Headers();
      for (const [k, v] of Object.entries(this.headers)) {
        if (Array.isArray(v)) v.forEach((x) => headers.append(k, String(x)));
        else if (v != null) headers.set(k, String(v));
      }
      if (!headers.has('content-type') && this.body != null && typeof this.body === 'string' && this.body.startsWith('{')) {
        headers.set('content-type', 'application/json; charset=utf-8');
      }
      resolve(new Response(this.body as any, { status: this.statusCode, headers }));
      return this;
    },
  };

  // safety: if handler returns without end(), still resolve empty
  queueMicrotask(() => {
    if (!settled) {
      // give async handlers a tick; final settle after await handler()
    }
  });

  return { res, wait };
}

export async function runApiHandler(
  handler: (req: any, res: any) => any,
  request: Request,
  pathParams?: string[]
): Promise<Response> {
  const req = await toApiRequest(request, pathParams);
  const { res, wait } = createApiResponse();
  try {
    const out = await handler(req, res);
    // some handlers return res.json(...) which already ends; others return nothing
    if (!res.headersSent) {
      if (out != null && typeof out === 'object' && 'statusCode' in (out as any)) {
        // already the res object
        res.end();
      } else if (out != null) {
        res.json(out);
      } else {
        res.end();
      }
    }
  } catch (e: any) {
    if (!res.headersSent) {
      res.status(500).json({ error: e?.message || 'Internal error' });
    }
  }
  return wait;
}
