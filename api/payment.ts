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
      const IPAYMU_API_KEY = proces…KEY;
      const IPAYMU_URL = process.env.IPAYMU_URL || 'https://my.ipaymu.com';
      const APP_URL = process.env.APP_URL || 'http://localhost:3000';

      console.log('IPAYMU_URL', IPAYMU_URL);
      console.log('VA', IPAYMU_VA);
      console.log('API_KEY_LENGTH', IPAYMU_API_KEY?.length);
      console.log('URL_ENV_SET', 'IPAYMU_URL' in process.env);

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

      console.log('SIGNATURE', signature?.substring(0, 12));

      const headers: any = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'signature': signature,
        'va': IPAYMU_VA!,
      };

      console.log('HEADERS', JSON.stringify(headers, null, 2));
      console.log('BODY', JSON.stringify(body, null, 2));

      const requestUrl = `${IPAYMU_URL}/api/v2/payment`;
      console.log('REQUEST_URL', requestUrl);

      const ipaymuReq = await fetch(requestUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      console.log('STATUS', ipaymuReq.status);
      console.log('CONTENT_TYPE', ipaymuReq.headers.get('content-type'));

      const raw = await ipaymuReq.text();

      console.log('RAW_RESPONSE_FIRST_3000');
      console.log(raw.slice(0, 3000));

      let ipaymuRes: any;
      try {
        ipaymuRes = JSON.parse(raw);
      } catch (parseErr) {
        return res.status(502).json({
          error: 'Payment gateway returned non-JSON',
          status: ipaymuReq.status,
          contentType: ipaymuReq.headers.get('content-type'),
          rawFirst500: raw.slice(0, 500),
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
