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

      const IPAYMU_VA = process.env.IPAYMU_VA;
      const IPAYMU_API_KEY = process.env.IPAYMU_API_KEY;
      const IPAYMU_URL = process.env.IPAYMU_URL || 'https://sandbox.ipaymu.com';
      const APP_URL = process.env.APP_URL || 'http://localhost:3000';

      const { userId, planType, email, name } = req.body;
      const price = 49000;

      const body: any = {
        account: IPAYMU_VA,
        product: [`DeutschUp ${(planType || 'pro').toUpperCase()}`],
        qty: ['1'],
        price: [price.toString()],
        returnUrl: `${APP_URL}/dashboard?payment=success`,
        notifyUrl: `${APP_URL}/api/payment?action=callback`,
        cancelUrl: `${APP_URL}/pricing?payment=cancel`,
        referenceId: `ORDER-${userId}-${Date.now()}`,
        buyerName: name || 'Student',
        buyerEmail: email || 'student@example.com',
      };

      const stringBody = JSON.stringify(body);
      const bodyHash = crypto.createHash('sha256').update(stringBody).digest('hex').toLowerCase();
      const stringToSign = `POST:${IPAYMU_VA}:${bodyHash}:${IPAYMU_API_KEY}`;
      const signature = crypto
        .createHmac('sha256', IPAYMU_API_KEY!)
        .update(stringToSign)
        .digest('hex')
        .toLowerCase();

      const ipaymuReq = await fetch(`${IPAYMU_URL}/api/v2/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          signature: signature,
          va: IPAYMU_VA!,
        },
        body: JSON.stringify(body),
      });

      const ipaymuResText = await ipaymuReq.text();
      console.log('[payment/create] iPaymu response:', {
        status: ipaymuReq.status,
        contentType: ipaymuReq.headers.get('content-type'),
        body: ipaymuResText.substring(0, 500),
      });

      let ipaymuRes: any;
      try {
        ipaymuRes = JSON.parse(ipaymuResText);
      } catch (parseErr) {
        console.error('[payment/create] iPaymu returned non-JSON:', {
          status: ipaymuReq.status,
          contentType: ipaymuReq.headers.get('content-type'),
          body: ipaymuResText.substring(0, 500),
        });
        return res.status(502).json({
          error: 'Payment gateway returned invalid response',
          status: ipaymuReq.status,
          body: ipaymuResText.substring(0, 200),
        });
      }

      if (ipaymuRes.Data && ipaymuRes.Data.SessionId) {
        const { error } = await getDb()
          .from('orders')
          .insert({
            id: ipaymuRes.Data.SessionId,
            userId,
            planType: planType || 'pro',
            status: 'pending',
            createdAt: new Date().toISOString(),
          });

        if (error) {
          console.error('[payment/create] DB insert error:', error);
          return res.status(500).json({ error: 'Failed to save order', details: error.message });
        }

        return res.json({ url: ipaymuRes.Data.Url });
      } else {
        console.error('[payment/create] iPaymu error:', ipaymuRes);
        return res.status(400).json({ error: 'Payment gateway error', details: ipaymuRes });
      }
    }

    // === action=callback (POST, no auth — called by iPaymu server) ===
    if (action === 'callback') {
      if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

      const { trx_id, status, sid } = req.body;
      console.log('[payment/callback] Received:', { trx_id, status, sid });

      if (status === 'berhasil' || status === 'success') {
        const { data: order, error: orderError } = await getDb()
          .from('orders')
          .select('*')
          .eq('id', sid)
          .single();

        if (orderError || !order) {
          console.error('[payment/callback] Order not found:', sid, orderError);
          return res.status(404).json({ error: 'Order not found' });
        }

        const expiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

        const { error: profileError } = await getDb()
          .from('profiles')
          .update({ tier: order.planType, tier_expiry: expiry })
          .eq('id', order.userId);

        if (profileError) {
          console.error('[payment/callback] Profile update error:', profileError);
          return res.status(500).json({ error: 'Failed to update profile' });
        }

        const { error: updateOrderError } = await getDb()
          .from('orders')
          .update({ status: 'paid', paidAt: new Date().toISOString() })
          .eq('id', sid);

        if (updateOrderError) {
          console.error('[payment/callback] Order update error:', updateOrderError);
        }

        console.log('[payment/callback] Payment processed successfully for user:', order.userId);
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
