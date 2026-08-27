import { getSupabaseAdminClient } from '../lib/api-utils.js';
export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', 'https://deutschup.sintec.my.id');
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }
  // Diagnostic one-liner: ?probe=1&t=TOKEN returns env presence + a real awaited
  // insert. Used 2026-08-27 to disambiguate "service-role env missing" vs
  // "fire-and-forget isolate death". Remove after diagnosis.
  if (req.query?.probe === '1' && req.query?.t === 'r2bdb5kln') {
    const envOk = { url: !!process.env.SUPABASE_URL, service: !!process.env.SUPABASE_SERVICE_ROLE_KEY };
    let ins = { ok: false, msg: '-' };
    try {
      const c = getSupabaseAdminClient();
      const { error } = await c.from('app_errors').insert({ message: 'probe-' + Date.now(), kind: 'probe' }).select().single();
      ins = { ok: !error, msg: error ? error.message.slice(0, 200) : 'inserted' };
    } catch (e: any) { ins = { ok: false, msg: (e?.message || String(e)).slice(0, 200) }; }
    return res.json({ ok: true, time: Date.now(), envOk, ins });
  }
  return res.json({ ok: true, time: Date.now() });
}
