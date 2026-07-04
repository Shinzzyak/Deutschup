import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb, getVerifiedIdentity } from '../lib/api-utils.js';
import { notifyDiscord } from './webhook-notify.js';

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

      const { planType, name } = req.body;

      const isTestMode = process.env.TEST_PAYMENT_MODE === 'true';
      const DEBUG = process.env.DEBUG_PAYMENTS === 'true';
      if (DEBUG) console.log('[payment/create] started, test mode:', isTestMode);
      // NOTE: Do not log API key length, full payloads, or raw gateway responses in production.
      const TEST_PRICE = 1000;
      const PROD_PRICE = 49000;
      const price = isTestMode ? TEST_PRICE : PROD_PRICE;
      if (DEBUG) console.log('[payment/create] price:', price);

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

      if (DEBUG) console.log('[payment/create] callback_url:', payload.callback_url);

      const bayarRes = await fetch(`${BAYAR_GG_BASE_URL}/create-payment.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': BAYAR_GG_API_KEY!,
        },
        body: JSON.stringify(payload),
      });

      if (DEBUG) console.log('[payment/create] gateway status:', bayarRes.status);

      const raw = await bayarRes.text();

      let bayarData: any;
      try {
        bayarData = JSON.parse(raw);
      } catch (parseErr) {
        console.error('[payment/create] Non-JSON gateway response:', {
          status: bayarRes.status,
          contentType: bayarRes.headers.get('content-type'),
          preview: raw.slice(0, 200),
        });
        return res.status(502).json({
          error: 'Payment gateway unavailable',
        });
      }

      if (DEBUG) console.log('[payment/create] gateway response keys:', Object.keys(bayarData));

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
      const DEBUG_CB = process.env.DEBUG_PAYMENTS === 'true';
      if (DEBUG_CB) console.log('[payment/callback] received invoice_id:', webhookPayload?.invoice_id);

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

      let verifyData: any;
      let verifyStatus: string | undefined;
      try {
        const checkRes = await fetch(
          `https://www.bayar.gg/api/check-payment.php?invoice=${encodeURIComponent(invoice_id)}`,
          { headers: { 'X-API-Key': BAYAR_GG_API_KEY, 'Accept': 'application/json' } }
        );
        const checkText = await checkRes.text();
        try {
          verifyData = JSON.parse(checkText);
        } catch {
          // Non-JSON response from gateway — treat as "not paid"
          console.error('[payment/callback] Non-JSON gateway response:', checkText.slice(0, 200));
          return res.status(202).json({ success: true, message: 'Not paid yet' });
        }
        // HTTP 404 or success=false from gateway → invoice not found → not paid
        if (!checkRes.ok || verifyData?.success === false) {
          console.log('[payment/callback] Invoice not found or not paid:', invoice_id);
          return res.status(202).json({ success: true, message: 'Not paid yet' });
        }
        if (DEBUG_CB) console.log('[payment/callback] check-payment status:', verifyData?.status);
        verifyStatus = verifyData?.status;
      } catch (verifyErr) {
        // Network error (timeout, DNS, connection refused) — genuinely unreachable
        console.error('[payment/callback] Network error verifying payment:', verifyErr);
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
          console.error('[payment/callback] Order not found:', invoice_id);
          return res.status(404).json({ error: 'Order not found' });
        }

        // Idempotency guard: skip if already processed
        if (order.status === 'paid') {
          console.log('[payment/callback] Already paid, idempotent skip:', invoice_id);
          return res.json({ success: true, message: 'Already processed' });
        }

        // Verify final_amount matches order amount (defense-in-depth per official docs)
        const finalAmount = verifyData?.final_amount;
        if (finalAmount && Number(finalAmount) !== Number(order.amount)) {
          console.error('[payment/callback] Amount mismatch: order=', order.amount, 'gateway=', finalAmount);
          return res.status(400).json({ error: 'Amount verification failed' });
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

        // Discord webhook notification (non-blocking, never affects payment flow)
        notifyDiscord({
          title: '💸 Payment Success',
          description: `Plan: ${order.plan_type} | User: ${order.user_id.slice(0, 8)}...`,
          color: 'success',
          fields: [
            { name: 'Invoice', value: invoice_id, inline: true },
            { name: 'Method', value: payment_method || 'QRIS', inline: true },
            { name: 'Plan', value: order.plan_type, inline: true },
          ],
          event: 'payment.success',
        }).catch(e => console.error('[webhook] Discord notify failed:', e));
      }

      return res.json({ success: true });
    }

    // Unknown action — no debug info leaked
    return res.status(404).json({ error: 'Payment endpoint not found' });
  } catch (e: any) {
    console.error('[payment] Unhandled error:', e);
    // Discord webhook for payment errors (non-blocking)
    notifyDiscord({
      title: '⚠️ Payment Error',
      description: e.message || 'Unknown error',
      color: 'warning',
      event: 'payment.error',
    }).catch(err => console.error('[webhook] Discord notify failed:', err));
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}
