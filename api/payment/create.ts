import { runMiddleware, authMiddleware, getDb } from '../utils';
import crypto from "crypto";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    await runMiddleware(req, res, authMiddleware);
    
    const IPAYMU_VA = process.env.IPAYMU_VA;
    const IPAYMU_API_KEY = process.env.IPAYMU_API_KEY;
    const IPAYMU_URL = process.env.IPAYMU_URL || 'https://sandbox.ipaymu.com';
    const APP_URL = process.env.APP_URL || `http://localhost:3000`; // Better to be env
    
    const { userId, planType, email, name } = req.body;
    const price = 49000;
    
    const body = {
      account: IPAYMU_VA,
      product: [`DeutschUp ${planType.toUpperCase()}`],
      qty: ['1'],
      price: [price.toString()],
      returnUrl: `${APP_URL}/dashboard?payment=success`,
      notifyUrl: `${APP_URL}/api/payment/callback`,
      cancelUrl: `${APP_URL}/pricing?payment=cancel`,
      referenceId: `ORDER-${userId}-${Date.now()}`,
      buyerName: name || 'Student',
      buyerEmail: email || 'student@example.com'
    };

    const stringBody = JSON.stringify(body);
    const bodyHash = crypto.createHash('sha256').update(stringBody).digest('hex').toLowerCase();
    const stringToSign = `POST:${IPAYMU_VA}:${bodyHash}:${IPAYMU_API_KEY}`;
    const signature = crypto.createHmac('sha256', IPAYMU_API_KEY!).update(stringToSign).digest('hex').toLowerCase();

    const ipaymuReq = await fetch(`${IPAYMU_URL}/api/v2/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'signature': signature,
        'va': IPAYMU_VA!
      },
      body: JSON.stringify(body)
    });
    
    const ipaymuRes: any = await ipaymuReq.json();
    if (ipaymuRes.Data && ipaymuRes.Data.SessionId) {
      await getDb().collection('orders').doc(ipaymuRes.Data.SessionId).set({
        userId,
        planType,
        status: 'pending',
        createdAt: Date.now()
      });
      res.json({ url: ipaymuRes.Data.Url });
    } else {
      res.status(400).json({ error: 'Failed from IPAYMU', details: ipaymuRes });
    }
  } catch (e: any) {
    if (!res.headersSent) res.status(500).json({ error: e.message });
  }
}
