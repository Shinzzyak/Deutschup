// Auth Dashboard
// Admin-only page for monitoring Clerk auth status

import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { getCanaryStatus, isClerkEnabled } from '../lib/clerk/canary';

export default function CanaryDashboard() {
  const { user, profileData } = useAuthStore();
  const [status, setStatus] = useState<any>(null);
  const isAdmin = profileData?.role === 'admin';

  useEffect(() => {
    if (!isAdmin) return;
    setStatus(getCanaryStatus());
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-foreground">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400">⛔ Access Denied</h1>
          <p className="text-muted-foreground mt-2">Admin only</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 text-foreground">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            🔐 Auth Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Clerk is now the default auth for ALL users
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border p-4 text-card-foreground">
            <div className="text-sm text-muted-foreground">Clerk SDK</div>
            <div className={`text-2xl font-bold ${status?.clerkEnabled ? 'text-green-400' : 'text-yellow-400'}`}>
              {status?.clerkEnabled ? '✅ Enabled' : '⚠️ Not Configured'}
            </div>
          </div>
          <div className="bg-card border border-border p-4 text-card-foreground">
            <div className="text-sm text-muted-foreground">Auth Mode</div>
            <div className="text-2xl font-bold text-blue-400">
              Full Clerk
            </div>
          </div>
          <div className="bg-card border border-border p-4 text-card-foreground">
            <div className="text-sm text-muted-foreground">Publishable Key</div>
            <div className="text-sm font-mono text-foreground mt-1">
              {status?.publishableKeyPrefix || 'NOT SET'}
            </div>
          </div>
        </div>

        {/* Current User */}
        <div className="bg-card border border-border p-6 mb-8 text-card-foreground">
          <h2 className="text-lg font-semibold mb-4">Current Session</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email:</span>
              <span className="text-foreground">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">User ID:</span>
              <span className="text-foreground font-mono text-sm">{user?.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Auth Provider:</span>
              <span className="text-green-400">Clerk</span>
            </div>
          </div>
        </div>

        {/* Architecture */}
        <div className="bg-card border border-border p-6 text-card-foreground">
          <h2 className="text-lg font-semibold mb-4">Auth Architecture</h2>
          <pre className="bg-muted p-4 text-sm text-foreground overflow-auto whitespace-pre border border-border">
{`┌─────────────────────────────────────────────────────┐
│                  USER BROWSER                        │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │           Clerk Auth (ALL USERS)              │   │
│  │   Sign-in, Sign-up, Session, JWT             │   │
│  └──────────────────┬───────────────────────────┘   │
│                     │                                │
│                     ▼                                │
│  ┌──────────────────────────────────────────────┐   │
│  │         useAuthSync Hook                      │   │
│  │   Bridges Clerk → authStore                   │   │
│  └──────────────────┬───────────────────────────┘   │
│                     │                                │
│                     ▼                                │
│  ┌──────────────────────────────────────────────┐   │
│  │         authStore (Zustand)                   │   │
│  │   user, tierData, profileData                 │   │
│  └──────────────────┬───────────────────────────┘   │
│                     │                                │
├─────────────────────┼───────────────────────────────┤
│                     │   SUPABASE (DATABASE ONLY)     │
│                     ▼                                │
│  ┌──────────────────────────────────────────────┐   │
│  │         profiles, users, etc.                  │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
└─────────────────────────────────────────────────────┘`}
          </pre>
        </div>
      </div>
    </div>
  );
}
