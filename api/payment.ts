import { runMiddleware, authMiddleware, getDb } from '../lib/api-utils.js';
import crypto from 'crypto';

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  const action = req.query.action;

  try {
    // === action=create (POST, auth required) ===
    if (action === 'create') {
      if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

      await runMiddleware(req, res, authMiddleware);

      const BAYAR_GG_API_KEY = process.env.BAYAR_GG_API_KEY || process.env.BAYAR_GG_API_KEY_FALLBACK;
      const APP_URL = process.env.APP_URL || 'http://localhost:3000';
      const BAYAR_GG_BASE_URL = 'https://www.bayar.gg/api';

      console.log('[payment/create] Provider: bayar_gg');
      console.log('[payment/create] API_KEY_LENGTH', BAYAR_GG_API_KEY?.length);
      console.log('[payment/create] BASE_URL', BAYAR_GG_BASE_URL);

      const { userId, planType, email, name } = req.body;

      const isTestMode = process.env.TEST_PAYMENT_MODE === 'true';
      const TEST_PRICE = 1000;
      const PROD_PRICE = 49000;
      const price = isTestMode ? TEST_PRICE : PROD_PRICE;
      console.log('[payment/create] TEST_PAYMENT_MODE:', isTestMode, '| price:', price);

      const payload = {
        amount: price,
        description: `DeutschUp ${(planType || 'pro').toUpperCase()} Subscription`,
        customer_name: name || 'Student',
        customer_email: email || 'student@example.com',
        callback_url: `${APP_URL}/api/payment?action=callback`,
        redirect_url: `${APP_URL}/dashboard?payment=success`,
        payment_method: 'qris',
      };

      console.log('[BAYARGG REQUEST]', JSON.stringify(payload, null, 2));

      const bayarRes = await fetch(`${BAYAR_GG_BASE_URL}/create-payment.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': BAYAR_GG_API_KEY!,
        },
        body: JSON.stringify(payload),
      });

      console.log('[payment/create] STATUS', bayarRes.status);
      console.log('[payment/create] CONTENT_TYPE', bayarRes.headers.get('content-type'));

      const raw = await bayarRes.text();
      console.log('[payment/create] RAW_RESPONSE_FIRST_3000');
      console.log(raw.slice(0, 3000));

      let bayarData: any;
      try {
        bayarData = JSON.parse(raw);
      } catch (parseErr) {
        return res.status(502).json({
          error: 'Payment gateway returned non-JSON',
          status: bayarRes.status,
          contentType: bayarRes.headers.get('content-type'),
          rawFirst500: raw.slice(0, 500),
        });
      }

      console.log('[BAYARGG RESPONSE]', JSON.stringify(bayarData, null, 2));

      if (bayarData.success && bayarData.data?.invoice_id) {
        const { error } = await getDb()
          .from('orders')
          .insert({
            id: bayarData.data.invoice_id,
            user_id: userId,
            plan_type: planType || 'pro',
            status: 'pending',
            amount: price,
            payment_method: bayarData.data.payment_method || 'qris',
            created_at: new Date().toISOString(),
          });

        if (error) {
          console.error('[payment/create] DB insert error:', error);
          return res.status(500).json({ error: 'Failed to save order', details: error.message });
        }

        return res.json({
          url: bayarData.data.payment_url,
          invoice_id: bayarData.data.invoice_id,
          amount: price,
          expires_at: bayarData.data.expires_at,
        });
      } else {
        console.error('[BAYARGG ERROR]', JSON.stringify(bayarData, null, 2));
        return res.status(400).json({
          error: 'Payment gateway error',
          gateway_response: bayarData,
        });
      }
    }

    // === action=callback (POST, no auth — called by Bayar.gg webhook) ===
    if (action === 'callback') {
      if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

      const webhookPayload = req.body;
      console.log('[payment/callback] Received webhook:', JSON.stringify(webhookPayload, null, 2));

      const { invoice_id, status, paid_at, payment_method, paid_reff_num } = webhookPayload;

      if (status === 'paid') {
        const { data: order, error: orderError } = await getDb()
          .from('orders')
          .select('*')
          .eq('id', invoice_id)
          .single();

        if (orderError || !order) {
          console.error('[payment/callback] Order not found:', invoice_id, orderError);
          return res.status(404).json({ error: 'Order not found' });
        }

        const now = new Date();
        const expiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

        // Update profile with subscription + legacy tier fields
        const { error: profileError } = await getDb()
          .from('profiles')
          .update({
            tier: order.plan_type,
            tier_expiry: expiry,
            subscription: order.plan_type,
            pro_expires_at: expiry,
          })
          .eq('id', order.user_id);

        if (profileError) {
          console.error('[payment/callback] Profile update error:', profileError);
          return res.status(500).json({ error: 'Failed to update profile' });
        }

        const { error: updateOrderError } = await getDb()
          .from('orders')
          .update({
            status: 'paid',
            paid_at: paid_at || new Date().toISOString(),
            payment_method: payment_method || order.payment_method,
            paid_reff_num: paid_reff_num || null,
          })
          .eq('id', invoice_id);

        if (updateOrderError) {
          console.error('[payment/callback] Order update error:', updateOrderError);
        }

        console.log('[payment/callback] Payment processed successfully for user:', order.user_id);
      }

      return res.json({ success: true });
    }

    // Unknown action
    return res.status(404).json({ error: 'Payment endpoint not found', debug: { action } });
  } catch (e: any) {
    console.error('[payment] Unhandled error:', e);
    if (!res.headersSent) {
      return res.status(500).json({ error: e.message || 'Internal server error' });
    }
  }
}
