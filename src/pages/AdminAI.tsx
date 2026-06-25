import { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import SecretList from '../components/admin/SecretList';
import {
  Loader2, RefreshCw, CheckCircle2, XCircle, AlertTriangle,
  Server, Cpu, Activity, Zap, ArrowLeft, BarChart3, Key,
  Shield, TrendingUp, Clock, AlertCircle, EyeOff, Eye,
  ChevronRight, Gauge, Puzzle, Plus, Trash2, TestTube, Globe
} from 'lucide-react';
import { cn } from '../lib/utils';

type RuntimeStatus = 'ACTIVE' | 'MISSING_KEY' | 'INVALID_KEY' | 'UNREACHABLE' | 'RATE_LIMITED' | 'DISABLED';

interface Provider {
  id: string;
  name: string;
  enabled: boolean;
  priority: number;
  status: 'active' | 'degraded' | 'down' | 'disabled';
  config: Record<string, any>;
}

interface HealthCheckResult {
  provider: string;
  name: string;
  enabled: boolean;
  key_exists: boolean;
  runtime_status: RuntimeStatus;
  latency_ms: number | null;
  checked_at: string;
  error_message: string | null;
}

interface Model {
  id: string;
  provider_id: string;
  name: string;
  display_name: string;
  enabled: boolean;
  is_primary: boolean;
  is_fallback: boolean;
  config: Record<string, any>;
}

interface UsageStats {
  provider_id: string;
  model_id: string;
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  total_latency_ms: number;
  total_tokens_in: number;
  total_tokens_out: number;
  total_cost_usd: number;
}


async function getToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

export default function AdminAI() {
  const { profileData } = useAuthStore();
  const navigate = useNavigate();

  const [providers, setProviders] = useState<Provider[]>([]);
  const [healthData, setHealthData] = useState<HealthCheckResult[]>([]);
  const [healthSummary, setHealthSummary] = useState<any>(null);
  const [validating, setValidating] = useState<string | null>(null);
  const [models, setModels] = useState<Model[]>([]);
  const [usageStats, setUsageStats] = useState<UsageStats[]>([]);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'health' | 'providers' | 'custom' | 'routing' | 'usage' | 'secrets'>('health');

  // Custom providers state
  const [customProviders, setCustomProviders] = useState<any[]>([]);
  const [customModels, setCustomModels] = useState<any[]>([]);
  const [customKeys, setCustomKeys] = useState<any[]>([]);
  const [showAddProvider, setShowAddProvider] = useState(false);
  const [showAddModel, setShowAddModel] = useState<string | null>(null);
  const [showAddKey, setShowAddKey] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);
  const [secrets, setSecrets] = useState<any[]>([]);
  const [providerKeys, setProviderKeys] = useState<Record<string, string>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [newProvider, setNewProvider] = useState({ id: '', name: '', base_url: '', auth_type: 'bearer', api_format: 'openai', chat_endpoint: '/chat/completions', priority: 50 });
  const [newModel, setNewModel] = useState({ id: '', model_id: '', display_name: '' });
  const [newKey, setNewKey] = useState({ key_name: 'default', api_key: '' });

  useEffect(() => {
    if (profileData?.role !== 'admin') {
      navigate('/');
    }
  }, [profileData?.role, navigate]);

  useEffect(() => {
    if (profileData?.role !== 'admin') return;
    fetchData();
  }, [profileData?.role]);

  const fetchData = async () => {
    
    setLoading(true);
    try {
      const [providersRes, modelsRes, statsRes, healthRes, customRes, sysHealthRes, secretsRes] = await Promise.all([
        fetch('/api/admin-ai?action=providers', {
          headers: { 'Authorization': `Bearer ${await getToken()}` }
        }),
        fetch('/api/admin-ai?action=models', {
          headers: { 'Authorization': `Bearer ${await getToken()}` }
        }),
        fetch('/api/admin-ai?action=usage-stats&days=7', {
          headers: { 'Authorization': `Bearer ${await getToken()}` }
        }),
        fetch('/api/admin-ai?action=health-check', {
          headers: { 'Authorization': `Bearer ${await getToken()}` }
        }),
        fetch('/api/custom-provider?action=full-config', {
          headers: { 'Authorization': `Bearer ${await getToken()}` }
        }),
        fetch('/api/admin?action=system-health', {
          headers: { 'Authorization': `Bearer ${await getToken()}` }
        }),
        fetch('/api/admin-ai?action=secrets', {
          headers: { 'Authorization': `Bearer ${await getToken()}` }
        })
      ]);

      if (providersRes.ok) setProviders(await providersRes.json());
      if (modelsRes.ok) setModels(await modelsRes.json());
      if (statsRes.ok) setUsageStats(await statsRes.json());
      if (healthRes.ok) {
        const health = await healthRes.json();
        setHealthData(health.providers || []);
        setHealthSummary(health.summary || null);
      }
      if (customRes.ok) {
        const custom = await customRes.json();
        setCustomProviders(custom.providers || []);
        setCustomModels(custom.models || []);
        setCustomKeys(custom.keys || []);
      }
      if (sysHealthRes.ok) setSystemHealth(await sysHealthRes.json());
      if (secretsRes.ok) {
        const secretsData = await secretsRes.json();
        setSecrets(secretsData);
        // Pre-populate providerKeys with masked values
        const keysMap: Record<string, string> = {};
        for (const s of secretsData) {
          keysMap[s.provider_id] = '••••••••'; // masked
        }
        setProviderKeys(prev => ({ ...keysMap, ...prev }));
      }
    } catch (e) {
      console.error('Fetch AI data failed:', e);
    } finally {
      setLoading(false);
    }
  };

  const toggleProvider = async (id: string, enabled: boolean) => {
    
    setSaving(true);
    try {
      await fetch('/api/admin-ai?action=provider-toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getToken()}`
        },
        body: JSON.stringify({ id, enabled })
      });
      setProviders(providers.map(p =>
        p.id === id ? { ...p, enabled, status: enabled ? 'active' as const : 'disabled' as const } : p
      ));
    } catch (e) {
      console.error('Toggle provider failed:', e);
    } finally {
      setSaving(false);
    }
  };

  const saveKey = async (providerId: string) => {
    const key = providerKeys[providerId];
    if (!key || key === '••••••••') return;
    setSavingKey(providerId);
    try {
      const res = await fetch('/api/admin-ai?action=secret-add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getToken()}`
        },
        body: JSON.stringify({
          provider_id: providerId,
          secret_key: 'api_key',
          secret_value: key
        })
      });
      if (res.ok) {
        // Auto-validate after saving
        await validateProvider(providerId);
        // Refresh secrets list
        const secretsRes = await fetch('/api/admin-ai?action=secrets', {
          headers: { 'Authorization': `Bearer ${await getToken()}` }
        });
        if (secretsRes.ok) setSecrets(await secretsRes.json());
        // Clear the input
        setProviderKeys(prev => ({ ...prev, [providerId]: '••••••••' }));
      }
    } catch (e) {
      console.error('Save key failed:', e);
    } finally {
      setSavingKey(null);
    }
  };

  const deleteKey = async (providerId: string) => {
    const secret = secrets.find(s => s.provider_id === providerId);
    if (!secret) return;
    setSavingKey(providerId);
    try {
      await fetch('/api/admin-ai?action=secret-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getToken()}`
        },
        body: JSON.stringify({ id: secret.id })
      });
      setProviderKeys(prev => ({ ...prev, [providerId]: '' }));
      setSecrets(prev => prev.filter(s => s.provider_id !== providerId));
      // Re-validate
      await validateProvider(providerId);
    } catch (e) {
      console.error('Delete key failed:', e);
    } finally {
      setSavingKey(null);
    }
  };

  const toggleModel = async (id: string, enabled: boolean) => {
    
    setSaving(true);
    try {
      await fetch('/api/admin-ai?action=model-toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getToken()}`
        },
        body: JSON.stringify({ id, enabled })
      });
      setModels(models.map(m =>
        m.id === id ? { ...m, enabled } : m
      ));
    } catch (e) {
      console.error('Toggle model failed:', e);
    } finally {
      setSaving(false);
    }
  };

  const setPrimary = async (id: string) => {
    
    setSaving(true);
    try {
      await fetch('/api/admin-ai?action=model-set-primary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getToken()}`
        },
        body: JSON.stringify({ id })
      });
      setModels(models.map(m => ({
        ...m,
        is_primary: m.id === id,
        enabled: m.id === id ? true : m.enabled
      })));
    } catch (e) {
      console.error('Set primary failed:', e);
    } finally {
      setSaving(false);
    }
  };

  const setFallback = async (id: string) => {
    
    setSaving(true);
    try {
      await fetch('/api/admin-ai?action=model-set-fallback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getToken()}`
        },
        body: JSON.stringify({ id })
      });
      setModels(models.map(m => ({
        ...m,
        is_fallback: m.id === id,
        enabled: m.id === id ? true : m.enabled
      })));
    } catch (e) {
      console.error('Set fallback failed:', e);
    } finally {
      setSaving(false);
    }
  };

  const validateProvider = async (providerId: string) => {
    
    setValidating(providerId);
    try {
      const res = await fetch('/api/admin-ai?action=validate-provider', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ provider_id: providerId })
      });
      if (res.ok) {
        const result = await res.json();
        setHealthData(prev => {
          const existing = prev.findIndex(h => h.provider === providerId);
          if (existing >= 0) {
            const updated = [...prev];
            updated[existing] = { ...updated[existing], ...result };
            return updated;
          }
          return [...prev, result];
        });
      }
    } catch (e) {
      console.error('Validate failed:', e);
    } finally {
      setValidating(null);
    }
  };

  const getProviderHealth = (providerId: string): HealthCheckResult | undefined => {
    return healthData.find(h => h.provider === providerId);
  };

  const getModelStats = (modelId: string) => {
    return usageStats.find(s => s.model_id === modelId);
  };

  const getStatusIcon = (status: RuntimeStatus, size: 'sm' | 'md' = 'sm') => {
    const cls = size === 'md' ? 'w-6 h-6' : 'w-5 h-5';
    switch (status) {
      case 'ACTIVE': return <CheckCircle2 className={cn(cls, 'text-emerald-500')} />;
      case 'MISSING_KEY': return <AlertTriangle className={cn(cls, 'text-amber-500')} />;
      case 'INVALID_KEY': return <XCircle className={cn(cls, 'text-red-500')} />;
      case 'UNREACHABLE': return <XCircle className={cn(cls, 'text-red-500')} />;
      case 'RATE_LIMITED': return <AlertTriangle className={cn(cls, 'text-amber-500')} />;
      case 'DISABLED': return <XCircle className={cn(cls, 'text-muted-foreground')} />;
      default: return <XCircle className={cn(cls, 'text-muted-foreground')} />;
    }
  };

  const getStatusLabel = (status: RuntimeStatus) => {
    switch (status) {
      case 'ACTIVE': return 'Active';
      case 'MISSING_KEY': return 'Missing Key';
      case 'INVALID_KEY': return 'Invalid Key';
      case 'UNREACHABLE': return 'Unreachable';
      case 'RATE_LIMITED': return 'Rate Limited';
      case 'DISABLED': return 'Disabled';
      default: return 'Unknown';
    }
  };

  const getStatusBadge = (status: RuntimeStatus) => {
    switch (status) {
      case 'ACTIVE': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'MISSING_KEY': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'INVALID_KEY': return 'bg-red-500/10 text-red-400 border border-red-500/20';
      case 'UNREACHABLE': return 'bg-red-500/10 text-red-400 border border-red-500/20';
      case 'RATE_LIMITED': return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
      case 'DISABLED': return 'bg-muted/10 text-muted-foreground border border-border';
      default: return 'bg-muted/10 text-muted-foreground border border-border';
    }
  };

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ACTIVE: 0,
      MISSING_KEY: 0,
      UNREACHABLE: 0,
      RATE_LIMITED: 0,
      DISABLED: 0,
    };
    healthData.forEach(h => {
      if (counts[h.runtime_status] !== undefined) {
        counts[h.runtime_status]++;
      }
    });
    return counts;
  }, [healthData]);

  const totalRequests = useMemo(() => usageStats.reduce((sum, s) => sum + s.total_requests, 0), [usageStats]);
  const totalSuccess = useMemo(() => usageStats.reduce((sum, s) => sum + s.successful_requests, 0), [usageStats]);
  const successRate = useMemo(() => totalRequests > 0 ? Math.round((totalSuccess / totalRequests) * 100) : 0, [totalRequests, totalSuccess]);
  const avgLatency = useMemo(() => {
    const totalLatency = usageStats.reduce((sum, s) => sum + s.total_latency_ms, 0);
    return totalRequests > 0 ? Math.round(totalLatency / totalRequests) : 0;
  }, [usageStats, totalRequests]);
  const totalTokens = useMemo(() => usageStats.reduce((sum, s) => sum + s.total_tokens_in + s.total_tokens_out, 0), [usageStats]);
  const totalFailed = useMemo(() => usageStats.reduce((sum, s) => sum + s.failed_requests, 0), [usageStats]);

  // ── Custom Provider CRUD ──
  const createCustomProvider = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/custom-provider?action=create-provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${await getToken()}` },
        body: JSON.stringify(newProvider)
      });
      if (res.ok) {
        setShowAddProvider(false);
        setNewProvider({ id: '', name: '', base_url: '', auth_type: 'bearer', api_format: 'openai', chat_endpoint: '/chat/completions', priority: 50 });
        await fetchData();
      }
    } finally { setSaving(false); }
  };

  const deleteCustomProvider = async (id: string) => {
    if (!confirm('Delete this provider and all its models/keys?')) return;
    await fetch('/api/custom-provider?action=delete-provider', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${await getToken()}` },
      body: JSON.stringify({ id })
    });
    await fetchData();
  };

  const createCustomModel = async (providerId: string) => {
    setSaving(true);
    try {
      const modelId = `${providerId}/${newModel.model_id}`;
      const res = await fetch('/api/custom-provider?action=create-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${await getToken()}` },
        body: JSON.stringify({ ...newModel, id: modelId, provider_id: providerId })
      });
      if (res.ok) {
        setShowAddModel(null);
        setNewModel({ id: '', model_id: '', display_name: '' });
        await fetchData();
      }
    } finally { setSaving(false); }
  };

  const deleteCustomModel = async (id: string) => {
    await fetch('/api/custom-provider?action=delete-model', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${await getToken()}` },
      body: JSON.stringify({ id })
    });
    await fetchData();
  };

  const createCustomKey = async (providerId: string) => {
    setSaving(true);
    try {
      const res = await fetch('/api/custom-provider?action=add-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${await getToken()}` },
        body: JSON.stringify({ ...newKey, provider_id: providerId })
      });
      if (res.ok) {
        setShowAddKey(null);
        setNewKey({ key_name: 'default', api_key: '' });
        await fetchData();
      }
    } finally { setSaving(false); }
  };

  const deleteCustomKey = async (id: string) => {
    await fetch('/api/custom-provider?action=delete-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${await getToken()}` },
      body: JSON.stringify({ id })
    });
    await fetchData();
  };

  const testCustomProvider = async (providerId: string) => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/custom-provider?action=test-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${await getToken()}` },
        body: JSON.stringify({ provider_id: providerId })
      });
      const result = await res.json();
      setTestResult({ providerId, ...result });
    } finally { setTesting(false); }
  };

  const tabs = [
    { id: 'health' as const, label: 'Health', icon: Activity },
    { id: 'providers' as const, label: 'Providers', icon: Server },
    { id: 'custom' as const, label: 'Custom', icon: Puzzle },
    { id: 'routing' as const, label: 'Routing', icon: Zap },
    { id: 'usage' as const, label: 'Usage', icon: BarChart3 },
    { id: 'secrets' as const, label: 'Secrets', icon: Key },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#F2C94C]" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-6">
      {/* Decorative background — hidden, kept for structure */}
      <div className="hidden">
        <div className="" />
        <div className="" />
        <div className="" />
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[#F2C94C]/10 rounded-xl">
                <Shield className="w-6 h-6 text-[#F2C94C]" />
              </div>
              <h1 className="text-4xl font-black tracking-tight text-foreground">
                AI <span className="text-[#F2C94C]">Command Center</span>
              </h1>
            </div>
            <p className="text-muted-foreground ml-14">Monitor, configure, and control your AI infrastructure.</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={loading}
            className="rounded-xl border-border hover:bg-muted gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>

        {/* Health Dashboard - Status Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-8">
          {[
            { label: 'Active', count: statusCounts.ACTIVE, icon: CheckCircle2, accent: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { label: 'Missing Key', count: statusCounts.MISSING_KEY, icon: AlertTriangle, accent: 'text-amber-500', bg: 'bg-amber-500/10' },
            { label: 'Unreachable', count: statusCounts.UNREACHABLE, icon: XCircle, accent: 'text-rose-500', bg: 'bg-rose-500/10' },
            { label: 'Rate Limited', count: statusCounts.RATE_LIMITED, icon: AlertCircle, accent: 'text-yellow-500', bg: 'bg-yellow-500/10' },
            { label: 'Disabled', count: statusCounts.DISABLED, icon: EyeOff, accent: 'text-muted-foreground', bg: 'bg-muted' },
          ].map(({ label, count, icon: Icon, accent, bg }) => (
            <Card key={label} className="rounded-2xl border-border bg-card hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-xl ${bg}`}>
                    <Icon className={`w-5 h-5 ${accent}`} />
                  </div>
                </div>
                <p className={`text-3xl font-black ${accent}`}>{count}</p>
                <p className="text-xs text-muted-foreground font-medium mt-1">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* System Overview Banner */}
        {systemHealth && (
          <div className="mb-10">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-muted-foreground" />
              Status Layanan
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: 'AI Engine', ok: systemHealth.config?.aiConfigured, detail: systemHealth.ai ? `${systemHealth.ai.totalKeys} keys, ${systemHealth.ai.enabledProviders} providers` : null },
                { label: 'Payment', ok: systemHealth.config?.paymentConfigured },
                { label: 'Database', ok: systemHealth.config?.databaseConfigured },
                { label: 'Webhooks', ok: systemHealth.config?.webhookConfigured },
              ].map(({ label, ok, detail }) => (
                <div key={label} className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
                  ok
                    ? 'bg-emerald-500/5 border-emerald-500/20'
                    : 'bg-rose-500/5 border-rose-500/20'
                }`}>
                  {ok ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-rose-500" />}
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-medium text-foreground">{label}</span>
                    {detail && <p className="text-xs text-muted-foreground truncate">{detail}</p>}
                  </div>
                  <span className={`ml-auto text-xs font-bold ${ok ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {ok ? 'ON' : 'OFF'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 p-1 bg-card rounded-2xl border border-border">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                activeTab === id
                  ? "bg-[#F2C94C] text-[#1F2937] shadow-lg shadow-[#F2C94C]/20 font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Health Tab */}
        {activeTab === 'health' && (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Requests', value: totalRequests.toLocaleString(), icon: TrendingUp, color: 'text-[#F2C94C]' },
                { label: 'Success Rate', value: `${successRate}%`, icon: CheckCircle2, color: successRate >= 90 ? 'text-emerald-400' : successRate >= 70 ? 'text-amber-400' : 'text-red-400' },
                { label: 'Avg Latency', value: `${avgLatency}ms`, icon: Clock, color: avgLatency < 500 ? 'text-emerald-400' : avgLatency < 1000 ? 'text-amber-400' : 'text-red-400' },
                { label: 'Failed Requests', value: totalFailed.toLocaleString(), icon: XCircle, color: totalFailed === 0 ? 'text-emerald-400' : 'text-red-400' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-card rounded-2xl p-4 border border-border">
                  <div className="flex items-center space-x-2 mb-2">
                    <Icon className={cn("w-4 h-4", color)} />
                    <span className="text-xs text-muted-foreground">{label}</span>
                  </div>
                  <p className={cn("text-xl font-bold", color)}>{value}</p>
                </div>
              ))}
            </div>

            {/* Provider Health Cards */}
            <div className="bg-card rounded-3xl border border-border p-6">
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-[#F2C94C]" />
                Provider Fleet Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {providers.map(provider => {
                  const health = getProviderHealth(provider.id);
                  const status = health?.runtime_status || (provider.enabled ? 'ACTIVE' : 'DISABLED');
                  return (
                    <div
                      key={provider.id}
                      className={cn(
                        "relative bg-card rounded-2xl p-4 border transition-all hover:border-border",
                        status === 'ACTIVE' ? "border-emerald-500/30" :
                        status === 'MISSING_KEY' || status === 'RATE_LIMITED' ? "border-amber-500/30" :
                        status === 'UNREACHABLE' || status === 'INVALID_KEY' ? "border-red-500/30" :
                        "border-border"
                      )}
                    >
                      <div className="relative">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(status)}
                            <div>
                              <h4 className="font-bold text-foreground">{provider.name}</h4>
                              <p className="text-xs text-muted-foreground">Priority: {provider.priority}</p>
                            </div>
                          </div>
                          <span className={cn("px-2 py-1 rounded-lg text-xs font-medium", getStatusBadge(status))}>
                            {getStatusLabel(status)}
                          </span>
                        </div>
                        {health?.latency_ms != null && (
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                            <Clock className="w-3 h-3" />
                            <span>{health.latency_ms}ms latency</span>
                          </div>
                        )}
                        {health?.error_message && (
                          <p className="text-xs text-red-400 mt-2 truncate">{health.error_message}</p>
                        )}
                        <div className="flex space-x-2 mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => validateProvider(provider.id)}
                            disabled={validating === provider.id}
                            className="flex-1 bg-background border-border hover:bg-muted"
                          >
                            {validating === provider.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <RefreshCw className="w-4 h-4 mr-1" />
                            )}
                            Validate
                          </Button>
                          <Button
                            variant={provider.enabled ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleProvider(provider.id, !provider.enabled)}
                            disabled={saving}
                            className={provider.enabled ? "bg-emerald-600 hover:bg-emerald-700" : "bg-background border-border hover:bg-muted"}
                          >
                            {provider.enabled ? 'On' : 'Off'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Providers Tab — OpenClaw Style */}
        {activeTab === 'providers' && (
          <div className="space-y-4">
            {/* Info Banner */}
            <div className="bg-[#F2C94C]/5 border border-[#F2C94C]/20 rounded-2xl p-4 flex items-center gap-3">
              <Key className="w-5 h-5 text-[#F2C94C] shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">API Key Management</p>
                <p className="text-xs text-muted-foreground">Paste your API keys below. Keys are stored securely in the database and used by the AI chat engine.</p>
              </div>
            </div>

            {providers.map(provider => {
              const health = getProviderHealth(provider.id);
              const status = health?.runtime_status || (provider.enabled ? 'ACTIVE' : 'DISABLED');
              const hasKey = secrets.some(s => s.provider_id === provider.id);
              const keySource = health?.key_source || (hasKey ? 'database' : 'none');
              const currentKey = providerKeys[provider.id] || '';

              return (
                <div
                  key={provider.id}
                  className={cn(
                    "bg-card rounded-2xl border p-5 transition-all",
                    status === 'ACTIVE' ? "border-emerald-500/30" :
                    status === 'MISSING_KEY' ? "border-amber-500/30" :
                    status === 'UNREACHABLE' || status === 'INVALID_KEY' ? "border-red-500/30" :
                    "border-border"
                  )}
                >
                  {/* Header Row */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(status)}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-foreground">{provider.name}</h3>
                          <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold", getStatusBadge(status))}>
                            {getStatusLabel(status)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs text-muted-foreground">Priority: {provider.priority}</span>
                          {health?.latency_ms != null && (
                            <span className="text-xs text-muted-foreground">{health.latency_ms}ms</span>
                          )}
                          {keySource !== 'none' && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                              {keySource === 'database' ? '🔑 DB' : '⚙️ ENV'}
                            </span>
                          )}
                        </div>
                        {health?.error_message && (
                          <p className="text-xs text-red-500 mt-1">{health.error_message}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleProvider(provider.id, !provider.enabled)}
                        disabled={saving}
                        className={cn("rounded-lg text-xs", provider.enabled ? "border-emerald-500/30 text-emerald-600" : "border-border text-muted-foreground")}
                      >
                        {provider.enabled ? 'ON' : 'OFF'}
                      </Button>
                    </div>
                  </div>

                  {/* API Key Input */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type={showKeys[provider.id] ? 'text' : 'password'}
                        value={currentKey}
                        onChange={e => setProviderKeys(prev => ({ ...prev, [provider.id]: e.target.value }))}
                        placeholder={hasKey ? '•••••••• (key saved)' : 'Paste API key here...'}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#F2C94C]/50 focus:border-[#F2C94C] pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKeys(prev => ({ ...prev, [provider.id]: !prev[provider.id] }))}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showKeys[provider.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => saveKey(provider.id)}
                      disabled={!currentKey || currentKey === '••••••••' || savingKey === provider.id}
                      className="rounded-lg bg-[#F2C94C] hover:bg-[#E0B73A] text-[#1F2937] font-bold"
                    >
                      {savingKey === provider.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => validateProvider(provider.id)}
                      disabled={validating === provider.id}
                      className="rounded-lg"
                    >
                      {validating === provider.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <TestTube className="w-4 h-4" />}
                    </Button>
                    {hasKey && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteKey(provider.id)}
                        disabled={savingKey === provider.id}
                        className="rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  {/* Models */}
                  {models.filter(m => m.provider_id === provider.id).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="flex flex-wrap gap-1.5">
                        {models.filter(m => m.provider_id === provider.id).map(model => (
                          <span
                            key={model.id}
                            className={cn(
                              "px-2 py-0.5 rounded text-xs font-medium",
                              model.is_primary ? "bg-[#F2C94C]/10 text-[#B8952E] border border-[#F2C94C]/20" :
                              model.is_fallback ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" :
                              model.enabled ? "bg-muted text-muted-foreground" :
                              "bg-card text-muted-foreground/50"
                            )}
                          >
                            {model.name}
                            {model.is_primary && " ★"}
                            {model.is_fallback && " ◆"}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

                {/* Custom Providers Tab */}
        {activeTab === 'custom' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#F2C94C]/10 flex items-center justify-center">
                  <Puzzle className="w-5 h-5 text-[#F2C94C]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Custom Providers</h3>
                  <p className="text-sm text-muted-foreground">Add OpenRouter, Together, Groq, or any OpenAI-compatible provider</p>
                </div>
              </div>
              <Button onClick={() => setShowAddProvider(true)} className="bg-[#F2C94C] hover:bg-[#E0B73A]">
                <Plus className="w-4 h-4 mr-1" /> Add Provider
              </Button>
            </div>

            {/* Test Result Banner */}
            {testResult && (
              <div className={cn(
                "rounded-2xl p-4 border flex items-center gap-3",
                testResult.ok ? "bg-emerald-500/10 border-emerald-500/30" : "bg-red-500/10 border-red-500/30"
              )}>
                {testResult.ok ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <XCircle className="w-5 h-5 text-red-400" />}
                <div>
                  <p className={cn("font-medium", testResult.ok ? "text-emerald-300" : "text-red-300")}>
                    {testResult.ok ? 'Connection Successful' : 'Connection Failed'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {testResult.providerId} — {testResult.latencyMs}ms
                    {testResult.error && ` — ${testResult.error}`}
                  </p>
                </div>
              </div>
            )}

            {/* Add Provider Form */}
            {showAddProvider && (
              <div className="bg-card rounded-3xl border border-purple-500/30 p-6">
                <h4 className="text-foreground font-bold mb-4">Add Custom Provider</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Provider ID *</label>
                    <input value={newProvider.id} onChange={e => setNewProvider(p => ({ ...p, id: e.target.value }))}
                      placeholder="e.g. openrouter, together, groq"
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground text-sm focus:border-[#F2C94C] focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Display Name *</label>
                    <input value={newProvider.name} onChange={e => setNewProvider(p => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. OpenRouter"
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground text-sm focus:border-[#F2C94C] focus:outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-muted-foreground mb-1 block">Base URL *</label>
                    <input value={newProvider.base_url} onChange={e => setNewProvider(p => ({ ...p, base_url: e.target.value }))}
                      placeholder="https://openrouter.ai/api/v1"
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground text-sm focus:border-[#F2C94C] focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Auth Type</label>
                    <select value={newProvider.auth_type} onChange={e => setNewProvider(p => ({ ...p, auth_type: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground text-sm focus:border-[#F2C94C] focus:outline-none">
                      <option value="bearer">Bearer Token</option>
                      <option value="x-api-key">X-API-Key Header</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">API Format</label>
                    <select value={newProvider.api_format} onChange={e => setNewProvider(p => ({ ...p, api_format: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground text-sm focus:border-[#F2C94C] focus:outline-none">
                      <option value="openai">OpenAI Compatible</option>
                      <option value="gemini">Gemini</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Chat Endpoint</label>
                    <input value={newProvider.chat_endpoint} onChange={e => setNewProvider(p => ({ ...p, chat_endpoint: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground text-sm focus:border-[#F2C94C] focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Priority</label>
                    <input type="number" value={newProvider.priority} onChange={e => setNewProvider(p => ({ ...p, priority: Number(e.target.value) }))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground text-sm focus:border-[#F2C94C] focus:outline-none" />
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <Button onClick={createCustomProvider} disabled={saving || !newProvider.id || !newProvider.name || !newProvider.base_url}
                    className="bg-[#F2C94C] hover:bg-[#E0B73A]">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
                    Create Provider
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddProvider(false)} className="bg-background border-border">Cancel</Button>
                </div>
              </div>
            )}

            {/* Provider Cards */}
            {customProviders.map(provider => (
              <div key={provider.id} className="bg-card rounded-3xl border border-border p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Globe className="w-6 h-6 text-[#F2C94C]" />
                    <div>
                      <h4 className="font-bold text-foreground">{provider.name}</h4>
                      <p className="text-xs text-muted-foreground font-mono">{provider.base_url}</p>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs bg-muted/50 text-foreground px-2 py-0.5 rounded-lg">{provider.api_format}</span>
                        <span className="text-xs bg-muted/50 text-foreground px-2 py-0.5 rounded-lg">{provider.auth_type}</span>
                        <span className="text-xs bg-muted/50 text-foreground px-2 py-0.5 rounded-lg">Priority: {provider.priority}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => testCustomProvider(provider.id)} disabled={testing}
                      className="bg-emerald-600 hover:bg-emerald-700">
                      {testing ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <TestTube className="w-4 h-4 mr-1" />}
                      Test
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setShowAddModel(provider.id)}
                      className="bg-background border-border">
                      <Plus className="w-4 h-4 mr-1" /> Model
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setShowAddKey(provider.id)}
                      className="bg-background border-border">
                      <Key className="w-4 h-4 mr-1" /> Key
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => deleteCustomProvider(provider.id)}
                      className="bg-red-900/30 border-red-700/50 hover:bg-red-900/50 text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Add Model Form */}
                {showAddModel === provider.id && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <h5 className="text-sm font-medium text-foreground mb-3">Add Model</h5>
                    <div className="flex gap-3">
                      <input value={newModel.model_id} onChange={e => setNewModel(m => ({ ...m, model_id: e.target.value }))}
                        placeholder="Model ID (e.g. anthropic/claude-3.5-sonnet)"
                        className="flex-1 bg-background border border-border rounded-xl px-4 py-2 text-foreground text-sm focus:border-[#F2C94C] focus:outline-none" />
                      <input value={newModel.display_name} onChange={e => setNewModel(m => ({ ...m, display_name: e.target.value }))}
                        placeholder="Display Name"
                        className="flex-1 bg-background border border-border rounded-xl px-4 py-2 text-foreground text-sm focus:border-[#F2C94C] focus:outline-none" />
                      <Button size="sm" onClick={() => createCustomModel(provider.id)} disabled={saving || !newModel.model_id || !newModel.display_name}
                        className="bg-[#F2C94C] hover:bg-[#E0B73A]">Add</Button>
                      <Button size="sm" variant="outline" onClick={() => setShowAddModel(null)} className="bg-background border-border">Cancel</Button>
                    </div>
                  </div>
                )}

                {/* Add Key Form */}
                {showAddKey === provider.id && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <h5 className="text-sm font-medium text-foreground mb-3">Add API Key</h5>
                    <div className="flex gap-3">
                      <input value={newKey.key_name} onChange={e => setNewKey(k => ({ ...k, key_name: e.target.value }))}
                        placeholder="Key Name"
                        className="w-32 bg-background border border-border rounded-xl px-4 py-2 text-foreground text-sm focus:border-[#F2C94C] focus:outline-none" />
                      <input type="password" value={newKey.api_key} onChange={e => setNewKey(k => ({ ...k, api_key: e.target.value }))}
                        placeholder="sk-..."
                        className="flex-1 bg-background border border-border rounded-xl px-4 py-2 text-foreground text-sm focus:border-[#F2C94C] focus:outline-none" />
                      <Button size="sm" onClick={() => createCustomKey(provider.id)} disabled={saving || !newKey.api_key}
                        className="bg-[#F2C94C] hover:bg-[#E0B73A]">Add</Button>
                      <Button size="sm" variant="outline" onClick={() => setShowAddKey(null)} className="bg-background border-border">Cancel</Button>
                    </div>
                  </div>
                )}

                {/* Models & Keys */}
                <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Models ({customModels.filter(m => m.provider_id === provider.id).length})</p>
                    <div className="space-y-1">
                      {customModels.filter(m => m.provider_id === provider.id).map(model => (
                        <div key={model.id} className="flex items-center justify-between bg-card rounded-xl px-3 py-2">
                          <div>
                            <span className="text-sm text-foreground">{model.display_name}</span>
                            <span className="text-xs text-muted-foreground ml-2 font-mono">{model.model_id}</span>
                          </div>
                          <button onClick={() => deleteCustomModel(model.id)} className="text-red-400 hover:text-red-300">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      {customModels.filter(m => m.provider_id === provider.id).length === 0 && (
                        <p className="text-xs text-muted-foreground/50">No models added yet</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Keys ({customKeys.filter(k => k.provider_id === provider.id).length})</p>
                    <div className="space-y-1">
                      {customKeys.filter(k => k.provider_id === provider.id).map(key => (
                        <div key={key.id} className="flex items-center justify-between bg-card rounded-xl px-3 py-2">
                          <div>
                            <span className="text-sm text-foreground">{key.key_name}</span>
                            <span className={cn("text-xs ml-2 px-1.5 py-0.5 rounded-lg",
                              key.status === 'valid' ? 'bg-emerald-500/10 text-emerald-400' :
                              key.status === 'invalid' ? 'bg-red-500/10 text-red-400' :
                              'bg-muted/50 text-muted-foreground'
                            )}>{key.status}</span>
                          </div>
                          <button onClick={() => deleteCustomKey(key.id)} className="text-red-400 hover:text-red-300">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      {customKeys.filter(k => k.provider_id === provider.id).length === 0 && (
                        <p className="text-xs text-muted-foreground/50">No keys added yet</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {customProviders.length === 0 && !showAddProvider && (
              <div className="text-center py-12">
                <Puzzle className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground">No custom providers yet</p>
                <p className="text-sm text-muted-foreground/50">Add OpenRouter, Together, Groq, or any OpenAI-compatible API</p>
              </div>
            )}
          </div>
        )}

        {/* Secrets Tab */}
        {activeTab === 'secrets' && (
          <div className="bg-card rounded-3xl border border-border p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Key className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Secrets Management</h3>
                <p className="text-sm text-muted-foreground">Manage API keys and credentials for AI providers</p>
              </div>
            </div>
            <div className="bg-card rounded-2xl p-4 border border-border">
              <SecretList />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
// force rebuild Thu Jun 25 11:59:36 UTC 2026
// force deploy
// cache bust 1782412621
