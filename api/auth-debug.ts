import type { ApiRequest, ApiResponse } from '../lib/http-types.js';
import { getVerifiedIdentity, getDb } from '../lib/api-utils.js';

// Debug endpoint: reports exactly why getVerifiedIdentity resolves or fails,
// writing the reason to app_errors so the admin can read it without console.
const REPORT = true;

export default async function handler(req: ApiRequest, res: ApiResponse) {
  const authHeader = req.headers['authorization'] || '';
  const hasBearer = /^Bearer /i.test(authHeader);
  const token = hasBearer ? authHeader.replace(/^Bearer /i, '').trim() : '';

  const detail: any = {
    hasBearerHeader: hasBearer,
    tokenLength: token.length,
    ts: new Date().toISOString(),
  };

  if (!token) {
    detail.message = 'auth-debug: no bearer token';
    detail.result = 'no_token';
  } else {
    // decode JWT payload (no crypto) to capture sub/email/iss/azp
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const pad = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
        const payload = JSON.parse(Buffer.from(pad, 'base64').toString('utf8'));
        detail.jwt = {
          sub: payload.sub,
          email: payload.email,
          iss: payload.iss,
          azp: payload.azp,
          aud: payload.aud,
        };
      }
    } catch (e: any) {
      detail.jwtDecodeError = e.message;
    }

    try {
      const ident = await getVerifiedIdentity(req);
      if (ident) {
        detail.result = 'resolved';
        detail.internalId = ident.internalId;
        detail.email = ident.email;
        detail.emailVerified = ident.emailVerified;
        detail.provider = ident.provider;
      } else {
        detail.result = 'NULL';
        detail.message = 'getVerifiedIdentity returned null (token verification FAILED)';
        detail.env = {
          hasJwtKey: !!(process.env.CLERK_JWT_KEY || '').trim(),
          jwtKeyPreview: (process.env.CLERK_JWT_KEY || '').slice(0, 30),
          hasSecretKey: !!(process.env.CLERK_SECRET_KEY || '').trim(),
          fapi: (process.env.CLERK_FAPI || '').trim(),
          apiUrl: (process.env.CLERK_API_URL || '').trim(),
        };
      }
    } catch (e: any) {
      detail.result = 'threw';
      detail.message = 'getVerifiedIdentity threw: ' + e.message;
      detail.stack = (e.stack || '').split('\n').slice(0, 3).join('\n');
    }
  }

  if (REPORT) {
    try {
      const db = getDb();
      await db.from('app_errors').insert({
        kind: 'auth-debug',
        message: detail.message || ('auth-debug:' + detail.result),
        stack: JSON.stringify(detail).slice(0, 4000),
        url: req.url,
        ua: req.headers['user-agent'] || '',
      });
    } catch (e: any) {
      detail.reportError = e.message;
    }
  }

  return res.status(detail.result === 'resolved' ? 200 : 401).json(detail);
}