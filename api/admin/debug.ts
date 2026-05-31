import { runMiddleware, authMiddleware, getDb } from '../utils';

export default async function handler(req: any, res: any) {
  console.log('[DEBUG-ENDPOINT] Request received');
  
  if (req.method !== 'GET') {
    console.log('[DEBUG-ENDPOINT] Method not GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // We use a simplified auth check to avoid middleware crashes
    await runMiddleware(req, res, authMiddleware);
    
    const user = req.user;
    console.log('[DEBUG-ENDPOINT] User identified:', user?.email);
    
    const adminEmailEnv = process.env.ADMIN_EMAIL;
    console.log('[DEBUG-ENDPOINT] Env ADMIN_EMAIL:', adminEmailEnv ? 'SET' : 'NOT SET');
    
    let dbRole = 'unknown';
    let dbError = null;
    
    if (user && user.id) {
      try {
        const { data, error } = await getDb().from('profiles').select('role').eq('id', user.id).single();
        if (error) {
          dbError = error.message;
        } else {
          dbRole = data?.role || 'not found';
        }
      } catch (e: any) {
        dbError = e.message;
      }
    }

    return res.json({
      status: "Surgical Debugging Active",
      auth: {
        isAuthenticated: !!user,
        userEmail: user?.email || 'No email found',
        userId: user?.id || 'No ID found',
      },
      env: {
        adminEmailSet: !!adminEmailEnv,
        adminEmailValue: adminEmailEnv ? `${adminEmailEnv.substring(0,3)}...${adminEmailEnv.slice(-4)}` : 'NOT SET',
      },
      database: {
        role: dbRole,
        error: dbError
      },
      logic: {
        emailMatch: (adminEmailEnv && user?.email && adminEmailEnv.toLowerCase().trim() === user.email.toLowerCase().trim()),
        isDbAdmin: dbRole === 'admin',
        finalDecision: (adminEmailEnv && user?.email && adminEmailEnv.toLowerCase().trim() === user.email.toLowerCase().trim()) || dbRole === 'admin' ? 'GRANTED' : 'DENIED'
      }
    });
  } catch (e: any) {
    console.error('[DEBUG-ENDPOINT] Critical Crash:', e);
    return res.status(500).json({ 
      error: "Critical Debugger Failure", 
      details: e.message,
      stack: process.env.NODE_ENV === 'development' ? e.stack : undefined
    });
  }
}
