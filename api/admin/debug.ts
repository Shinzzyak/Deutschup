import { runMiddleware, authMiddleware, adminMiddleware, getDb } from '../utils';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return res.status(405).end();
  
  try {
    // We only use authMiddleware here, NOT adminMiddleware, 
    // so we can see why the admin check is failing.
    await runMiddleware(req, res, authMiddleware);
    
    const user = req.user;
    const adminEmailEnv = process.env.ADMIN_EMAIL;
    
    // Check if the user is an admin according to the logic we implemented
    const isEmailAdmin = adminEmailEnv && user?.email === adminEmailEnv;
    
    let dbRole = 'unknown';
    try {
      const { data } = await getDb().from('profiles').select('role').eq('id', user?.id).single();
      dbRole = data?.role || 'not found';
    } catch (e) {}

    return res.json({
      message: "Debug Info",
      auth: {
        isAuthenticated: !!user,
        userEmail: user?.email,
        userId: user?.id,
      },
      env: {
        adminEmailSet: !!adminEmailEnv,
        adminEmailValue: adminEmailEnv ? `${adminEmailEnv.substring(0,3)}...${adminEmailEnv.slice(-4)}` : 'NOT SET',
      },
      logic: {
        emailMatch: isEmailAdmin,
        dbRole: dbRole,
        finalDecision: (isEmailAdmin || dbRole === 'admin') ? 'GRANTED' : 'DENIED'
      }
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}
