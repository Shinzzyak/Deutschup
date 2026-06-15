// IMPLEMENTATION-048B: Clerk Test Route (POC)
// Displays Clerk authentication state and identity mapping
// Accessible at /clerk-test — requires authentication

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuthStore } from '../stores/authStore';
import { resolveClerkId } from '../lib/clerk/identity';
import { Loader2, CheckCircle2, XCircle, Copy, Shield } from 'lucide-react';
import { Button } from '../components/ui/button';

interface TestResult {
  label: string;
  status: 'success' | 'error' | 'pending';
  value: string;
}

export default function ClerkTest() {
  const { user, session, profileData } = useAuthStore();
  const navigate = useNavigate();
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    runTests();
  }, [user, session, profileData]);

  const runTests = async () => {
    setLoading(true);
    const tests: TestResult[] = [];

    // Test 1: Supabase Auth state
    tests.push({
      label: 'Supabase Auth',
      status: user ? 'success' : 'error',
      value: user?.id || 'No user',
    });
    setResults([...tests]);

    // Test 2: Session token
    tests.push({
      label: 'Session Token',
      status: session?.access_token ? 'success' : 'error',
      value: session?.access_token ? `${session.access_token.substring(0, 20)}...` : 'No token',
    });
    setResults([...tests]);

    // Test 3: Profile data
    tests.push({
      label: 'Profile Loaded',
      status: profileData?.id ? 'success' : 'error',
      value: profileData?.id || 'No profile',
    });
    setResults([...tests]);

    // Test 4: Clerk ID resolution
    if (user?.id) {
      const clerkId = await resolveClerkId(user.id);
      tests.push({
        label: 'Clerk ID Resolution',
        status: clerkId ? 'success' : 'pending',
        value: clerkId || 'No Clerk mapping (expected in POC without Clerk)',
      });
    } else {
      tests.push({
        label: 'Clerk ID Resolution',
        status: 'pending',
        value: 'Skipped — no user ID',
      });
    }
    setResults([...tests]);

    // Test 5: Admin status
    tests.push({
      label: 'Admin Status',
      status: profileData?.role === 'admin' ? 'success' : 'pending',
      value: profileData?.role || 'No role',
    });
    setResults([...tests]);

    // Test 6: RLS connectivity (try to read own profile)
    try {
      const res = await fetch('/api/user/profile', {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      tests.push({
        label: 'RLS Profile Access',
        status: res.ok ? 'success' : 'error',
        value: res.ok ? 'OK' : `HTTP ${res.status}`,
      });
    } catch {
      tests.push({
        label: 'RLS Profile Access',
        status: 'error',
        value: 'Network error',
      });
    }
    setResults([...tests]);

    setLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const statusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending': return <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Clerk + Supabase POC</h1>
            <p className="text-sm text-muted-foreground">Identity mapping validation test</p>
          </div>
        </div>

        {/* Test Results */}
        <div className="space-y-3">
          {results.map((result, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card">
              <div className="flex items-center space-x-3">
                {statusIcon(result.status)}
                <span className="font-medium text-sm">{result.label}</span>
              </div>
              <div className="flex items-center space-x-2">
                <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-lg max-w-[200px] truncate">
                  {result.value}
                </code>
                <button onClick={() => copyToClipboard(result.value)}
                  className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Copy to clipboard">
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            <span className="ml-2 text-sm text-muted-foreground">Running tests...</span>
          </div>
        )}

        {/* Summary */}
        {!loading && (
          <div className="mt-8 p-6 rounded-3xl border border-border bg-card">
            <h2 className="font-bold text-lg mb-4">Summary</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-black text-emerald-500">
                  {results.filter(r => r.status === 'success').length}
                </p>
                <p className="text-xs text-muted-foreground">Passed</p>
              </div>
              <div>
                <p className="text-2xl font-black text-amber-500">
                  {results.filter(r => r.status === 'pending').length}
                </p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
              <div>
                <p className="text-2xl font-black text-red-500">
                  {results.filter(r => r.status === 'error').length}
                </p>
                <p className="text-xs text-muted-foreground">Failed</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex space-x-3">
          <Button variant="outline" onClick={() => runTests()} className="rounded-xl">
            Re-run Tests
          </Button>
          <Button variant="outline" onClick={() => navigate('/admin')} className="rounded-xl">
            Back to Admin
          </Button>
        </div>

        {/* Info */}
        <div className="mt-8 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
          <p className="text-sm text-blue-600 dark:text-blue-400">
            <strong>POC Note:</strong> This page validates that Supabase Auth still works after Clerk installation.
            Clerk user_id resolution will show "No Clerk mapping" until Clerk project is configured and webhook is deployed.
          </p>
        </div>
      </div>
    </div>
  );
}
