import type { VercelRequest, VercelResponse } from '@vercel/node';
import { runMiddleware, authMiddleware, getDb } from '../lib/api-utils.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const webhookPayload = req.body;
  console.log('[WEBHOOK-DEBUG] Received:', JSON.stringify(webhookPayload, null, 2));
  console.log('[WEBHOOK-DEBUG] Headers:', JSON.stringify(req.headers, null, 2));

  const { invoice_id, status, paid_at, payment_method, paid_reff_num } = webhookPayload;

  console.log('[WEBHOOK-DEBUG] invoice_id:', invoice_id);
  console.log('[WEBHOOK-DEBUG] status:', status);

  // Check if order exists
  const { data: order, error: orderError } = await getDb()
    .from('orders')
    .select('*')
    .eq('id', invoice_id)
    .single();

  console.log('[WEBHOOK-DEBUG] order_found:', !!order);
  console.log('[WEBHOOK-DEBUG] order_error:', orderError?.message);

  if (orderError || !order) {
    console.error('[WEBHOOK-DEBUG] Order not found:', invoice_id);
    return res.status(200).json({ success: true, debug: 'order_not_found' });
  }

  console.log('[WEBHOOK-DEBUG] order_status:', order.status);
  console.log('[WEBHOOK-DEBUG] order_user_id:', order.user_id);

  if (status === 'paid') {
    const now = new Date();
    const expiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

    // Update profile
    const { error: profileError } = await getDb()
      .from('profiles')
      .update({
        tier: order.plan_type,
        tier_expiry: expiry,
        subscription: order.plan_type,
        pro_expires_at: expiry,
      })
      .eq('id', order.user_id);

    console.log('[WEBHOOK-DEBUG] profile_updated:', !profileError);
    console.log('[WEBHOOK-DEBUG] profile_error:', profileError?.message);

    // Update order
    const { error: updateOrderError } = await getDb()
      .from('orders')
      .update({
        status: 'paid',
        paid_at: paid_at || new Date().toISOString(),
        payment_method: payment_method || order.payment_method,
        paid_reff_num: paid_reff_num || null,
      })
      .eq('id', invoice_id);

    console.log('[WEBHOOK-DEBUG] order_updated:', !updateOrderError);
    console.log('[WEBHOOK-DEBUG] order_update_error:', updateOrderError?.message);

    console.log('[WEBHOOK-DEBUG] Payment processed successfully for user:', order.user_id);
  }

  return res.json({ success: true });
}
