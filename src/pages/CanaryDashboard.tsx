// Auth Dashboard
// Admin-only page for monitoring Clerk auth status

import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { getCanaryStatus, isClerkEnabled } from '../lib/clerk/canary';

export default function CanaryDashboard() {
  const { user } = useAuthStore();
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    if (user?.email !== import.meta.env.VITE_ADMIN_EMAIL) return;
    setStatus(getCanaryStatus());
  }, [user]);

  if (user?.email !== import.meta.env.VITE_ADMIN_EMAIL) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400">⛔ Access Denied</h1>
          <p className="text-gray-400 mt-2">Admin only</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#f5f0eb] flex items-center gap-3">
            🔐 Auth Dashboard
          </h1>
          <p className="text-gray-400 mt-2">
            Clerk is now the default auth for ALL users
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800  p-4">
            <div className="text-sm text-gray-400">Clerk SDK</div>
            <div className={`text-2xl font-bold ${status?.clerkEnabled ? 'text-green-400' : 'text-yellow-400'}`}>
              {status?.clerkEnabled ? '✅ Enabled' : '⚠️ Not Configured'}
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800  p-4">
            <div className="text-sm text-gray-400">Auth Mode</div>
            <div className="text-2xl font-bold text-blue-400">
              Full Clerk
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800  p-4">
            <div className="text-sm text-gray-400">Publishable Key</div>
            <div className="text-sm font-mono text-gray-300 mt-1">
              {status?.publishableKeyPrefix || 'NOT SET'}
            </div>
          </div>
        </div>

        {/* Current User */}
        <div className="bg-gray-900 border border-gray-800  p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Current Session</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Email:</span>
              <span className="text-[#f5f0eb]">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">User ID:</span>
              <span className="text-[#f5f0eb] font-mono text-sm">{user?.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Auth Provider:</span>
              <span className="text-green-400">Clerk</span>
            </div>
          </div>
        </div>

        {/* Architecture */}
        <div className="bg-gray-900 border border-gray-800  p-6">
          <h2 className="text-lg font-semibold mb-4">Auth Architecture</h2>
          <pre className="bg-gray-800  p-4 text-sm text-gray-300 overflow-auto whitespace-pre">
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