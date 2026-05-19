import { getDb } from '../utils';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { trx_id, status, sid } = req.body;
    if (status === 'berhasil' || status === 'success') {
      const orderDoc = await getDb().collection('orders').doc(sid).get();
      if (orderDoc.exists) {
        const order = orderDoc.data()!;
        const expiry = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
        await getDb().collection('users').doc(order.userId).set({
          tier: order.planType,
          tierExpiry: expiry
        }, { merge: true });
        await getDb().collection('orders').doc(sid).update({ status: 'paid', paidAt: Date.now() });
      }
    }
    return res.json({ success: true });
  } catch (e: any) {
    if (!res.headersSent) res.status(500).json({ error: e.message });
  }
}
