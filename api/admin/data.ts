import { runMiddleware, authMiddleware, adminMiddleware, getDb } from '../utils';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return res.status(405).end();
  try {
    await runMiddleware(req, res, authMiddleware);
    await runMiddleware(req, res, adminMiddleware);
    
    const usersSnap = await getDb().collection('users').get();
    const users = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const configDoc = await getDb().collection('config').doc('global').get();
    let apiKeyMasked = '';
    if (configDoc.exists && configDoc.data()?.geminiApiKey) {
       const key = configDoc.data()!.geminiApiKey;
       apiKeyMasked = key.substring(0, 8) + '***' + key.substring(key.length - 4);
    }
    return res.json({ users, apiKeyMasked });
  } catch (e: any) {
    if (!res.headersSent) res.status(500).json({ error: e.message });
  }
}
