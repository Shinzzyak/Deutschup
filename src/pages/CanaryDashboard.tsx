// IMPLEMENTATION-048G: Canary Dashboard
// Admin-only page for monitoring Clerk canary status

import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { getCanaryStatus, getCanaryEmails, setCanaryEmails, isClerkEnabled } from '../lib/clerk/canary';
import { resolveInternalId, resolveClerkId } from '../lib/clerk/identity';

export default function CanaryDashboard() {
  const { user } = useAuthStore();
  const [status, setStatus] = useState<any>(null);
  const [emails, setEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [identityTest, setIdentityTest] = useState<any>(null);

  useEffect(() => {
    if (user?.email !== import.meta.env.VITE_ADMIN_EMAIL) return;
    setStatus(getCanaryStatus());
    setEmails(getCanaryEmails());
  }, [user]);

  if (user?.email !== import.meta.env.VITE_ADMIN_EMAIL) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400">⛔ Access Denied</h1>
          <p className="text-gray-400 mt-2">Admin only</p>
        </div>
      </div>
    );
  }

  const addEmail = () => {
    if (newEmail && !emails.includes(newEmail.toLowerCase())) {
      const updated = [...emails, newEmail.toLowerCase()];
      setCanaryEmails(updated);
      setEmails(updated);
      setNewEmail('');
      setStatus(getCanaryStatus());
    }
  };

  const removeEmail = (email: string) => {
    const updated = emails.filter(e => e !== email);
    setCanaryEmails(updated);
    setEmails(updated);
    setStatus(getCanaryStatus());
  };

  const testIdentity = async (email: string) => {
    setIdentityTest({ loading: true, email });
    try {
      // Test resolveInternalId with a test clerk_id
      const result = await resolveInternalId('test_clerk_' + Date.now());
      setIdentityTest({ loading: false, email, result, timestamp: new Date().toISOString() });
    } catch (err: any) {
      setIdentityTest({ loading: false, email, error: err.message });
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            🐦 Clerk Canary Dashboard
          </h1>
          <p className="text-gray-400 mt-2">
            First live validation phase — Clerk active for admin test accounts only
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="text-sm text-gray-400">Clerk SDK</div>
            <div className={`text-2xl font-bold ${status?.clerkEnabled ? 'text-green-400' : 'text-yellow-400'}`}>
              {status?.clerkEnabled ? '✅ Enabled' : '⚠️ Not Configured'}
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="text-sm text-gray-400">Canary Users</div>
            <div className="text-2xl font-bold text-blue-400">
              {status?.canaryCount || 0}
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="text-sm text-gray-400">Publishable Key</div>
            <div className="text-sm font-mono text-gray-300 mt-1">
              {status?.publishableKeyPrefix || 'NOT SET'}
            </div>
          </div>
        </div>

        {/* Current User */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Current Session</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Email:</span>
              <span className="text-white">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">User ID:</span>
              <span className="text-white font-mono text-sm">{user?.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Canary Status:</span>
              <span className={emails.includes(user?.email || '') ? 'text-green-400' : 'text-gray-400'}>
                {emails.includes(user?.email || '') ? '🐦 Canary Active' : 'Standard User'}
              </span>
            </div>
          </div>
        </div>

        {/* Canary Email Management */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Canary Email List</h2>
          <div className="space-y-3">
            {emails.map(email => (
              <div key={email} className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-2">
                <span className="text-white">{email}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => testIdentity(email)}
                    className="text-xs bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded"
                  >
                    Test Identity
                  </button>
                  <button
                    onClick={() => removeEmail(email)}
                    className="text-xs bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <input
              type="email"
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              placeholder="Add canary email..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500"
            />
            <button
              onClick={addEmail}
              disabled={!newEmail}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-700 px-4 py-2 rounded-lg"
            >
              Add
            </button>
          </div>
        </div>

        {/* Identity Test Result */}
        {identityTest && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Identity Resolution Test</h2>
            <pre className="bg-gray-800 rounded-lg p-4 text-sm text-gray-300 overflow-auto">
              {JSON.stringify(identityTest, null, 2)}
            </pre>
          </div>
        )}

        {/* Architecture Diagram */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Canary Architecture</h2>
          <pre className="bg-gray-800 rounded-lg p-4 text-sm text-gray-300 overflow-auto whitespace-pre">
{`┌─────────────────────────────────────────────────────┐
│                  USER BROWSER                        │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────┐      ┌──────────────┐             │
│  │ Supabase     │      │ Clerk        │             │
│  │ Auth Client  │      │ Auth Client  │             │
│  └──────┬───────┘      └──────┬───────┘             │
│         │                     │                      │
│    ALL USERS              CANARY ONLY                │
│         │                     │                      │
│         ▼                     ▼                      │
│  ┌──────────────────────────────────────────┐       │
│  │         AuthStore (Zustand)               │       │
│  │   SOURCE OF TRUTH: supabase.auth          │       │
│  └──────────────────────────────────────────┘       │
│                                                      │
├─────────────────────────────────────────────────────┤
│                   ROUTING LOGIC                      │
├─────────────────────────────────────────────────────┤
│                                                      │
│  email === ADMIN_EMAIL?                              │
│         │                                            │
│    YES  │  NO                                        │
│    ┌────┴────┐                                       │
│    ▼         ▼                                       │
│  CLERK    SUPABASE                                   │
│                                                      │
└─────────────────────────────────────────────────────┘`}
          </pre>
        </div>
      </div>
    </div>
  );
}
