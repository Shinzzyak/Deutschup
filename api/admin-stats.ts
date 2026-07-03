import { runMiddleware, authMiddleware, adminMiddleware, getDb } from '../lib/api-utils.js';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', 'https://deutschup.sintec.my.id');
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }
  if (req.method !== 'GET') return res.status(405).end();
  
  try {
    await runMiddleware(req, res, authMiddleware);
    try {
      await runMiddleware(req, res, adminMiddleware);
    } catch {
      if (res.headersSent) return;
      return res.status(403).json({ error: 'Forbidden: Admin privileges required' });
    }

    const days = parseInt(req.query.days as string) || 1;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    // Total stats
    const { data: totals } = await getDb()
      .from('ai_requests')
      .select('id, latency_ms, success, user_id, endpoint, model')
      .gte('created_at', since);

    const totalRequests = totals?.length || 0;
    const avgLatency = totalRequests > 0
      ? Math.round(totals!.reduce((sum: number, r: any) => sum + r.latency_ms, 0) / totalRequests)
      : 0;
    const errorRate = totalRequests > 0
      ? Math.round(totals!.filter((r: any) => !r.success).length / totalRequests * 100)
      : 0;

    // Group by endpoint
    const byEndpoint: Record<string, { count: number; avgLatency: number; errors: number }> = {};
    totals?.forEach((r: any) => {
      if (!byEndpoint[r.endpoint]) {
        byEndpoint[r.endpoint] = { count: 0, avgLatency: 0, errors: 0 };
      }
      byEndpoint[r.endpoint].count++;
      byEndpoint[r.endpoint].avgLatency += r.latency_ms;
      if (!r.success) byEndpoint[r.endpoint].errors++;
    });
    
    // Calculate averages
    Object.keys(byEndpoint).forEach(ep => {
      byEndpoint[ep].avgLatency = Math.round(byEndpoint[ep].avgLatency / byEndpoint[ep].count);
    });

    // Group by model
    const byModel: Record<string, number> = {};
    totals?.forEach((r: any) => {
      byModel[r.model] = (byModel[r.model] || 0) + 1;
    });

    return res.json({
      period: `${days} day(s)`,
      summary: {
        total_requests: totalRequests,
        avg_latency_ms: avgLatency,
        error_rate_pct: errorRate,
        unique_users: new Set(totals?.map((r: any) => r.user_id)).size,
      },
      by_endpoint: byEndpoint,
      by_model: byModel,
    });

  } catch (e: any) {
    console.error('[ADMIN-STATS] Error:', e);
    if (res.headersSent) return;
    return res.status(500).json({ error: e.message });
  }
}
