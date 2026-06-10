import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).end();
  }

  const key = process.env.BAYAR_GG_API_KEY || '';
  const appUrl = process.env.APP_URL || '';
  
  return res.json({
    bayarKeyLength: key.length,
    bayarKeyPrefix: key.substring(0, 8),
    bayarKeySuffix: key.substring(key.length - 4),
    appUrlValue: appUrl,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    deploymentTime: new Date().toISOString(),
  });
}
