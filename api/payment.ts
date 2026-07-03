import type { VercelRequest, VercelResponse } from '@vercel/node';
import { runMiddleware, authMiddleware, getDb, getVerifiedIdentity } from '../lib/api-utils.js';

// Simple in-memory rate limiter (per-IP, resets on cold start)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(ip: string, maxRequests = 20, windowMs = 60000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  entry.count++;
  return entry.count <= maxRequests;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', 'https://deutschup.sintec.my.id');
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

      // H3 FIX: Never trust userId/email from body — extract from verified identity.
      const identity = await getVerifiedIdentity(req);
      const userId = identity?.internalId;
      const email = identity?.email;
      if (!userId) return res.status(401).json({ error: 'Unauthorized — token required' });

      // Rate limit on create (M2 fix)
      const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 'unknown';
      if (!checkRateLimit(clientIp, 5, 60000)) {
        return res.status(429).json({ error: 'Too many requests' });
      }

      const BAYAR_GG_API_KEY = process.env.BAYAR_GG_API_KEY || process.env.BAYAR_GG_API_KEY_FALLBACK;
      const APP_URL = process.env.APP_URL || 'http://localhost:3000';
      const BAYAR_GG_BASE_URL = 'https://www.bayar.gg/api';

      console.log('[payment/create] Provider: bayar_gg');
      console.log('[payment/create] API_KEY_LENGTH', BAYAR_GG_API_KEY?.length);
      console.log('[payment/create] BASE_URL', BAYAR_GG_BASE_URL);
      console.log('[payment/create] APP_URL', APP_URL);

      const { planType, name } = req.body;

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
        payment_url: 'https://www.bayar.gg/pay',
      };

      console.log('[BAYARGG REQUEST]', JSON.stringify(payload, null, 2));
      console.log('[payment/create] CALLBACK_URL', payload.callback_url);
      console.log('[payment/create] REDIRECT_URL', payload.redirect_url);

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

    // === action=callback (POST — called by Bayar.gg webhook) ===
    if (action === 'callback') {
      if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

      // Rate limit check
      const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 'unknown';
      if (!checkRateLimit(clientIp, 20, 60000)) {
        console.warn('[payment/callback] Rate limit exceeded for IP:', clientIp);
        return res.status(429).json({ error: 'Too many requests' });
      }

      // Bayar.gg webhook verification: body is NOT signed.
      // Per official docs (github.com/bayar-global-gateway/bayargg-api-integrations):
      // "Jangan pernah memenuhi order hanya berdasarkan status di body.
      //  Setelah membaca invoice_id, panggil check-payment di sisi server
      //  memakai API Key Anda, dan lanjutkan fulfilment HANYA jika API
      //  sendiri menyatakan paid."
      //
      // Pattern: receive callback → extract invoice_id → call check-payment.php
      // → only trust API response, never body status.

      const webhookPayload = req.body;
      console.log('[payment/callback] Received webhook:', JSON.stringify(webhookPayload, null, 2));

      const { invoice_id, paid_at, payment_method, paid_reff_num } = webhookPayload;

      if (!invoice_id) {
        console.log('[payment/callback] No invoice_id, ignoring');
        return res.status(200).json({ success: true, message: 'Ignored' });
      }

      // Verify payment status via Bayar.gg API (never trust body status)
      const BAYAR_GG_API_KEY = process.env.BAYAR_GG_API_KEY;
      if (!BAYAR_GG_API_KEY) {
        console.error('[payment/callback] CRITICAL: BAYAR_GG_API_KEY not set — cannot verify webhook');
        return res.status(500).json({ error: 'Payment gateway misconfigured' });
      }

      let verifyStatus: string | undefined;
      try {
        const checkRes = await fetch(
          `https://www.bayar.gg/api/check-payment.php?invoice=${encodeURIComponent(invoice_id)}`,
          { headers: { 'X-API-Key': BAYAR_GG_API_KEY, 'Accept': 'application/json' } }
        );
        const checkData = await checkRes.json() as any;
        console.log('[payment/callback] check-payment result:', JSON.stringify(checkData, null, 2));
        verifyStatus = checkData?.status;
      } catch (verifyErr) {
        console.error('[payment/callback] Failed to verify payment:', verifyErr);
        return res.status(502).json({ error: 'Failed to verify payment with gateway' });
      }

      if (verifyStatus !== 'paid') {
        console.log('[payment/callback] Payment not confirmed by API, status:', verifyStatus);
        return res.status(202).json({ success: true, message: 'Not paid yet' });
      }

      // API confirmed paid — safe to process
      {
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

    // Unknown action — no debug info leaked
    return res.status(404).json({ error: 'Payment endpoint not found' });
  } catch (e: any) {
    console.error('[payment] Unhandled error:', e);
    if (!res.headersSent) {
      return res.status(500).json({ error: e.message || 'Internal server error' });
    }
  }
}
