import type { ApiRequest, ApiResponse } from '../lib/http-types.js';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', 'https://deutschup.sintec.my.id');
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // Health check only — no sensitive data exposed
  return res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
}
