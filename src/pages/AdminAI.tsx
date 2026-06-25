import { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/button';
import SecretList from '../components/admin/SecretList';
import {
  Loader2, Save, RefreshCw, CheckCircle2, XCircle, AlertTriangle,
  Server, Cpu, Activity, Zap, ArrowLeft, Settings, BarChart3, Key,
  Shield, TrendingUp, Clock, AlertCircle, Eye, EyeOff, ChevronRight,
  Wifi, WifiOff, Gauge, Puzzle, Plus, Trash2, TestTube, Globe, ExternalLink
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
      const [providersRes, modelsRes, statsRes, healthRes, customRes] = await Promise.all([
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
      case 'DISABLED': return <XCircle className={cn(cls, 'text-slate-500')} />;
      default: return <XCircle className={cn(cls, 'text-slate-500')} />;
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
      case 'DISABLED': return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl animate-pulse" />
            <Loader2 className="w-10 h-10 animate-spin text-blue-500 relative" />
          </div>
          <p className="text-slate-400 text-sm">Initializing Command Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pb-20">
      {/* Decorative background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/[0.03] rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 md:px-6">
        {/* Back nav */}
        <button
          onClick={() => navigate('/admin')}
          className="inline-flex items-center text-sm font-bold text-slate-400 hover:text-white mt-6 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Admin
        </button>

        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 md:p-8 text-white mb-8 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          </div>
          <div className="relative flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">AI Command Center</h1>
              <p className="text-white/70 text-sm mt-0.5">Monitor, configure, and control your AI infrastructure</p>
            </div>
          </div>
        </div>

        {/* Health Dashboard - Status Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-8">
          {[
            { label: 'Active', count: statusCounts.ACTIVE, icon: CheckCircle2, gradient: 'from-emerald-500 to-emerald-600', glow: 'shadow-emerald-500/20', textColor: 'text-emerald-400' },
            { label: 'Missing Key', count: statusCounts.MISSING_KEY, icon: AlertTriangle, gradient: 'from-amber-500 to-orange-500', glow: 'shadow-amber-500/20', textColor: 'text-amber-400' },
            { label: 'Unreachable', count: statusCounts.UNREACHABLE, icon: XCircle, gradient: 'from-red-500 to-red-600', glow: 'shadow-red-500/20', textColor: 'text-red-400' },
            { label: 'Rate Limited', count: statusCounts.RATE_LIMITED, icon: AlertCircle, gradient: 'from-yellow-500 to-amber-500', glow: 'shadow-yellow-500/20', textColor: 'text-yellow-400' },
            { label: 'Disabled', count: statusCounts.DISABLED, icon: EyeOff, gradient: 'from-slate-400 to-slate-500', glow: 'shadow-slate-500/20', textColor: 'text-slate-400' },
          ].map(({ label, count, icon: Icon, gradient, glow, textColor }) => (
            <div
              key={label}
              className={cn(
                "relative rounded-3xl bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 p-4 md:p-5 overflow-hidden transition-all hover:scale-[1.02] hover:border-slate-600/50",
                `hover:shadow-lg ${glow}`
              )}
            >
              <div className={cn("absolute top-0 right-0 w-20 h-20 bg-gradient-to-br opacity-10 rounded-full -translate-y-6 translate-x-6", gradient)} />
              <div className="relative">
                <Icon className="w-5 h-5 text-slate-400 mb-2" />
                <p className={cn("text-2xl font-bold", textColor)}>{count}</p>
                <p className="text-xs text-slate-500 mt-1">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 p-1 bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/50">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                activeTab === id
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-700/50"
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
                { label: 'Total Requests', value: totalRequests.toLocaleString(), icon: TrendingUp, color: 'text-blue-400' },
                { label: 'Success Rate', value: `${successRate}%`, icon: CheckCircle2, color: successRate >= 90 ? 'text-emerald-400' : successRate >= 70 ? 'text-amber-400' : 'text-red-400' },
                { label: 'Avg Latency', value: `${avgLatency}ms`, icon: Clock, color: avgLatency < 500 ? 'text-emerald-400' : avgLatency < 1000 ? 'text-amber-400' : 'text-red-400' },
                { label: 'Failed Requests', value: totalFailed.toLocaleString(), icon: XCircle, color: totalFailed === 0 ? 'text-emerald-400' : 'text-red-400' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-4 border border-slate-700/50">
                  <div className="flex items-center space-x-2 mb-2">
                    <Icon className={cn("w-4 h-4", color)} />
                    <span className="text-xs text-slate-500">{label}</span>
                  </div>
                  <p className={cn("text-xl font-bold", color)}>{value}</p>
                </div>
              ))}
            </div>

            {/* Provider Health Cards */}
            <div className="bg-slate-800/40 backdrop-blur-sm rounded-3xl border border-slate-700/50 p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-blue-400" />
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
                        "relative bg-slate-900/60 rounded-2xl p-4 border transition-all hover:border-slate-600",
                        status === 'ACTIVE' ? "border-emerald-500/30" :
                        status === 'MISSING_KEY' || status === 'RATE_LIMITED' ? "border-amber-500/30" :
                        status === 'UNREACHABLE' || status === 'INVALID_KEY' ? "border-red-500/30" :
                        "border-slate-700/50"
                      )}
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-5 rounded-full -translate-y-16 translate-x-16" />
                      <div className="relative">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(status)}
                            <div>
                              <h4 className="font-bold text-white">{provider.name}</h4>
                              <p className="text-xs text-slate-500">Priority: {provider.priority}</p>
                            </div>
                          </div>
                          <span className={cn("px-2 py-1 rounded-lg text-xs font-medium", getStatusBadge(status))}>
                            {getStatusLabel(status)}
                          </span>
                        </div>
                        {health?.latency_ms != null && (
                          <div className="flex items-center space-x-2 text-sm text-slate-400 mb-2">
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
                            className="flex-1 bg-slate-800 border-slate-700 hover:bg-slate-700"
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
                            className={provider.enabled ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-800 border-slate-700 hover:bg-slate-700"}
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

        {/* Providers Tab */}
        {activeTab === 'providers' && (
          <div className="space-y-4">
            {providers.map(provider => {
              const health = getProviderHealth(provider.id);
              const status = health?.runtime_status || (provider.enabled ? 'ACTIVE' : 'DISABLED');
              return (
                <div
                  key={provider.id}
                  className={cn(
                    "bg-slate-800/40 backdrop-blur-sm rounded-3xl border-2 p-6 transition-all",
                    status === 'ACTIVE' ? "border-emerald-500/30" :
                    status === 'MISSING_KEY' || status === 'RATE_LIMITED' ? "border-amber-500/30" :
                    status === 'UNREACHABLE' || status === 'INVALID_KEY' ? "border-red-500/30" :
                    provider.enabled ? "border-slate-600/30" : "border-slate-700/30 opacity-60"
                  )}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(status, 'md')}
                      <div>
                        <h3 className="font-bold text-lg text-white">{provider.name}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm text-slate-400">
                            Priority: {provider.priority}
                          </span>
                          <span className={cn(
                            "px-2 py-0.5 rounded-lg text-xs font-medium",
                            getStatusBadge(status)
                          )}>
                            {getStatusLabel(status)}
                          </span>
                          {health?.latency_ms != null && (
                            <span className="text-xs text-slate-500">
                              {health.latency_ms}ms
                            </span>
                          )}
                        </div>
                        {health?.error_message && (
                          <p className="text-xs text-red-400 mt-1">{health.error_message}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => validateProvider(provider.id)}
                        disabled={validating === provider.id}
                        className="bg-slate-800 border-slate-700 hover:bg-slate-700"
                      >
                        {validating === provider.id ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-1" />
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
                        className={provider.enabled ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-800 border-slate-700 hover:bg-slate-700"}
                      >
                        {provider.enabled ? 'Enabled' : 'Disabled'}
                      </Button>
                    </div>
                  </div>

                  {/* Models for this provider */}
                  <div className="mt-4 pt-4 border-t border-slate-700/50">
                    <p className="text-sm font-medium text-slate-400 mb-2">Models:</p>
                    <div className="flex flex-wrap gap-2">
                      {models
                        .filter(m => m.provider_id === provider.id)
                        .map(model => (
                          <span
                            key={model.id}
                            className={cn(
                              "px-3 py-1 rounded-xl text-sm font-medium",
                              model.is_primary ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                              model.is_fallback ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                              model.enabled ? "bg-slate-700/50 text-slate-300 border border-slate-600/30" :
                              "bg-slate-800/50 text-slate-500 border border-slate-700/30"
                            )}
                          >
                            {model.display_name}
                            {model.is_primary && " ★"}
                            {model.is_fallback && " ◆"}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Routing Tab */}
        {activeTab === 'routing' && (
          <div className="bg-slate-800/40 backdrop-blur-sm rounded-3xl border border-slate-700/50 p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-[#F2C94C]" />
              Routing Chain — Failover Order
            </h3>
            
            <div className="space-y-3">
              {providers
                .sort((a, b) => a.priority - b.priority)
                .map((provider, idx) => {
                  const health = getProviderHealth(provider.id);
                  const status = health?.runtime_status || (provider.enabled ? 'ACTIVE' : 'DISABLED');
                  const hasModel = models.some(m => m.provider_id === provider.id && m.enabled);
                  const isPrimary = models.some(m => m.provider_id === provider.id && m.is_primary);
                  const isFallback = models.some(m => m.provider_id === provider.id && m.is_fallback);
                  
                  let chainStatus = 'Disabled';
                  let chainResult = 'Skipped';
                  let chainColor = 'text-slate-500';
                  let dotColor = 'bg-slate-500';
                  
                  if (!provider.enabled) {
                    chainStatus = 'Disabled';
                    chainResult = 'Skipped';
                    chainColor = 'text-slate-500';
                    dotColor = 'bg-slate-500';
                  } else if (isPrimary) {
                    chainStatus = 'Primary';
                    chainResult = 'Serving Traffic';
                    chainColor = 'text-emerald-400';
                    dotColor = 'bg-emerald-500';
                  } else if (isFallback) {
                    chainStatus = 'Fallback';
                    chainResult = 'Standby';
                    chainColor = 'text-amber-400';
                    dotColor = 'bg-amber-500';
                  } else if (hasModel) {
                    chainStatus = 'Available';
                    chainResult = 'Standby';
                    chainColor = 'text-blue-400';
                    dotColor = 'bg-blue-500';
                  } else {
                    chainStatus = 'No Models';
                    chainResult = 'Skipped';
                    chainColor = 'text-slate-500';
                    dotColor = 'bg-slate-500';
                  }
                  
                  return (
                    <div key={provider.id} className="relative">
                      {/* Connector line */}
                      {idx < providers.length - 1 && (
                        <div className="absolute left-6 top-12 w-0.5 h-8 bg-slate-700/50" />
                      )}
                      <div className={cn(
                        "flex items-center justify-between p-4 rounded-2xl transition-all",
                        idx === 0 && "bg-emerald-500/5 border border-emerald-500/20",
                        idx === 1 && "bg-amber-500/5 border border-amber-500/20",
                        idx > 1 && "bg-slate-800/40 border border-slate-700/30"
                      )}>
                        <div className="flex items-center space-x-4">
                          {/* Priority number with dot */}
                          <div className="relative">
                            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg", dotColor + '/10')}>
                              <span className={chainColor}>{idx + 1}</span>
                            </div>
                            <div className={cn("absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-900", dotColor)} />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-bold text-white">{provider.name}</h4>
                              <span className={cn("px-2 py-0.5 rounded-lg text-xs font-medium", chainColor === 'text-emerald-400' ? 'bg-emerald-500/10 text-emerald-400' : chainColor === 'text-amber-400' ? 'bg-amber-500/10 text-amber-400' : chainColor === 'text-blue-400' ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-500/10 text-slate-500')}>
                                {chainStatus}
                              </span>
                            </div>
                            <p className="text-sm text-slate-500">{chainResult}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {health?.latency_ms != null && (
                            <span className="text-xs text-slate-500">{health.latency_ms}ms</span>
                          )}
                          {idx < providers.length - 1 && (
                            <ChevronRight className="w-4 h-4 text-slate-600" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
            
            <div className="mt-6 p-4 bg-slate-900/50 rounded-2xl border border-slate-700/30">
              <p className="text-sm text-slate-400">
                <strong className="text-white">How routing works:</strong> Requests flow through providers in priority order. If the primary provider fails, the system automatically falls back to the next available provider in the chain.
              </p>
            </div>
          </div>
        )}

        {/* Usage Tab */}
        {activeTab === 'usage' && (
          <div className="space-y-6">
            {/* Overview Stats */}
            <div className="bg-slate-800/40 backdrop-blur-sm rounded-3xl border border-slate-700/50 p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-cyan-400" />
                Usage Analytics — Last 7 Days
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-700/30">
                  <p className="text-xs text-slate-500 mb-1">Total Requests</p>
                  <p className="text-2xl font-bold text-white">{totalRequests.toLocaleString()}</p>
                </div>
                <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-700/30">
                  <p className="text-xs text-slate-500 mb-1">Success Rate</p>
                  <p className={cn("text-2xl font-bold", successRate >= 90 ? "text-emerald-400" : successRate >= 70 ? "text-amber-400" : "text-red-400")}>
                    {successRate}%
                  </p>
                </div>
                <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-700/30">
                  <p className="text-xs text-slate-500 mb-1">Avg Latency</p>
                  <p className={cn("text-2xl font-bold", avgLatency < 500 ? "text-emerald-400" : avgLatency < 1000 ? "text-amber-400" : "text-red-400")}>
                    {avgLatency}ms
                  </p>
                </div>
                <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-700/30">
                  <p className="text-xs text-slate-500 mb-1">Total Tokens</p>
                  <p className="text-2xl font-bold text-white">{totalTokens.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Per-Model Stats */}
            <div className="bg-slate-800/40 backdrop-blur-sm rounded-3xl border border-slate-700/50 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Model Performance</h3>
              
              {usageStats.length === 0 ? (
                <div className="text-center py-12">
                  <Gauge className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-500">No usage data yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {usageStats.map((stat, idx) => {
                    const modelRate = stat.total_requests > 0
                      ? Math.round((stat.successful_requests / stat.total_requests) * 100)
                      : 0;
                    const modelLatency = stat.total_requests > 0
                      ? Math.round(stat.total_latency_ms / stat.total_requests)
                      : 0;
                    return (
                      <div key={idx} className="bg-slate-900/40 rounded-2xl p-4 border border-slate-700/30 hover:border-slate-600/50 transition-all">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center space-x-2">
                              <Cpu className="w-4 h-4 text-blue-400" />
                              <span className="font-bold text-white">{stat.provider_id}</span>
                              <span className="text-slate-500">/</span>
                              <span className="text-slate-400">{stat.model_id}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center space-x-1">
                              <TrendingUp className="w-3 h-3 text-slate-500" />
                              <span className="text-slate-400">{stat.total_requests} reqs</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <CheckCircle2 className={cn("w-3 h-3", modelRate >= 90 ? "text-emerald-500" : modelRate >= 70 ? "text-amber-500" : "text-red-500")} />
                              <span className={cn(modelRate >= 90 ? "text-emerald-400" : modelRate >= 70 ? "text-amber-400" : "text-red-400")}>
                                {modelRate}%
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3 text-slate-500" />
                              <span className="text-slate-400">{modelLatency}ms</span>
                            </div>
                            <div className="text-slate-500">
                              {(stat.total_tokens_in + stat.total_tokens_out).toLocaleString()} tok
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Custom Providers Tab */}
        {activeTab === 'custom' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Puzzle className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Custom Providers</h3>
                  <p className="text-sm text-slate-500">Add OpenRouter, Together, Groq, or any OpenAI-compatible provider</p>
                </div>
              </div>
              <Button onClick={() => setShowAddProvider(true)} className="bg-purple-600 hover:bg-purple-700">
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
                  <p className="text-xs text-slate-400">
                    {testResult.providerId} — {testResult.latencyMs}ms
                    {testResult.error && ` — ${testResult.error}`}
                  </p>
                </div>
              </div>
            )}

            {/* Add Provider Form */}
            {showAddProvider && (
              <div className="bg-slate-800/60 backdrop-blur-sm rounded-3xl border border-purple-500/30 p-6">
                <h4 className="text-white font-bold mb-4">Add Custom Provider</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">Provider ID *</label>
                    <input value={newProvider.id} onChange={e => setNewProvider(p => ({ ...p, id: e.target.value }))}
                      placeholder="e.g. openrouter, together, groq"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-purple-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">Display Name *</label>
                    <input value={newProvider.name} onChange={e => setNewProvider(p => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. OpenRouter"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-purple-500 focus:outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-slate-400 mb-1 block">Base URL *</label>
                    <input value={newProvider.base_url} onChange={e => setNewProvider(p => ({ ...p, base_url: e.target.value }))}
                      placeholder="https://openrouter.ai/api/v1"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-purple-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">Auth Type</label>
                    <select value={newProvider.auth_type} onChange={e => setNewProvider(p => ({ ...p, auth_type: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-purple-500 focus:outline-none">
                      <option value="bearer">Bearer Token</option>
                      <option value="x-api-key">X-API-Key Header</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">API Format</label>
                    <select value={newProvider.api_format} onChange={e => setNewProvider(p => ({ ...p, api_format: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-purple-500 focus:outline-none">
                      <option value="openai">OpenAI Compatible</option>
                      <option value="gemini">Gemini</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">Chat Endpoint</label>
                    <input value={newProvider.chat_endpoint} onChange={e => setNewProvider(p => ({ ...p, chat_endpoint: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-purple-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">Priority</label>
                    <input type="number" value={newProvider.priority} onChange={e => setNewProvider(p => ({ ...p, priority: Number(e.target.value) }))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:border-purple-500 focus:outline-none" />
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <Button onClick={createCustomProvider} disabled={saving || !newProvider.id || !newProvider.name || !newProvider.base_url}
                    className="bg-purple-600 hover:bg-purple-700">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
                    Create Provider
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddProvider(false)} className="bg-slate-800 border-slate-700">Cancel</Button>
                </div>
              </div>
            )}

            {/* Provider Cards */}
            {customProviders.map(provider => (
              <div key={provider.id} className="bg-slate-800/40 backdrop-blur-sm rounded-3xl border border-slate-700/50 p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Globe className="w-6 h-6 text-purple-400" />
                    <div>
                      <h4 className="font-bold text-white">{provider.name}</h4>
                      <p className="text-xs text-slate-500 font-mono">{provider.base_url}</p>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs bg-slate-700/50 text-slate-300 px-2 py-0.5 rounded-lg">{provider.api_format}</span>
                        <span className="text-xs bg-slate-700/50 text-slate-300 px-2 py-0.5 rounded-lg">{provider.auth_type}</span>
                        <span className="text-xs bg-slate-700/50 text-slate-300 px-2 py-0.5 rounded-lg">Priority: {provider.priority}</span>
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
                      className="bg-slate-800 border-slate-700">
                      <Plus className="w-4 h-4 mr-1" /> Model
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setShowAddKey(provider.id)}
                      className="bg-slate-800 border-slate-700">
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
                  <div className="mt-4 pt-4 border-t border-slate-700/50">
                    <h5 className="text-sm font-medium text-slate-300 mb-3">Add Model</h5>
                    <div className="flex gap-3">
                      <input value={newModel.model_id} onChange={e => setNewModel(m => ({ ...m, model_id: e.target.value }))}
                        placeholder="Model ID (e.g. anthropic/claude-3.5-sonnet)"
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:border-purple-500 focus:outline-none" />
                      <input value={newModel.display_name} onChange={e => setNewModel(m => ({ ...m, display_name: e.target.value }))}
                        placeholder="Display Name"
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:border-purple-500 focus:outline-none" />
                      <Button size="sm" onClick={() => createCustomModel(provider.id)} disabled={saving || !newModel.model_id || !newModel.display_name}
                        className="bg-purple-600 hover:bg-purple-700">Add</Button>
                      <Button size="sm" variant="outline" onClick={() => setShowAddModel(null)} className="bg-slate-800 border-slate-700">Cancel</Button>
                    </div>
                  </div>
                )}

                {/* Add Key Form */}
                {showAddKey === provider.id && (
                  <div className="mt-4 pt-4 border-t border-slate-700/50">
                    <h5 className="text-sm font-medium text-slate-300 mb-3">Add API Key</h5>
                    <div className="flex gap-3">
                      <input value={newKey.key_name} onChange={e => setNewKey(k => ({ ...k, key_name: e.target.value }))}
                        placeholder="Key Name"
                        className="w-32 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:border-purple-500 focus:outline-none" />
                      <input type="password" value={newKey.api_key} onChange={e => setNewKey(k => ({ ...k, api_key: e.target.value }))}
                        placeholder="sk-..."
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:border-purple-500 focus:outline-none" />
                      <Button size="sm" onClick={() => createCustomKey(provider.id)} disabled={saving || !newKey.api_key}
                        className="bg-purple-600 hover:bg-purple-700">Add</Button>
                      <Button size="sm" variant="outline" onClick={() => setShowAddKey(null)} className="bg-slate-800 border-slate-700">Cancel</Button>
                    </div>
                  </div>
                )}

                {/* Models & Keys */}
                <div className="mt-4 pt-4 border-t border-slate-700/50 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-400 mb-2">Models ({customModels.filter(m => m.provider_id === provider.id).length})</p>
                    <div className="space-y-1">
                      {customModels.filter(m => m.provider_id === provider.id).map(model => (
                        <div key={model.id} className="flex items-center justify-between bg-slate-900/40 rounded-xl px-3 py-2">
                          <div>
                            <span className="text-sm text-white">{model.display_name}</span>
                            <span className="text-xs text-slate-500 ml-2 font-mono">{model.model_id}</span>
                          </div>
                          <button onClick={() => deleteCustomModel(model.id)} className="text-red-400 hover:text-red-300">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      {customModels.filter(m => m.provider_id === provider.id).length === 0 && (
                        <p className="text-xs text-slate-600">No models added yet</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-400 mb-2">Keys ({customKeys.filter(k => k.provider_id === provider.id).length})</p>
                    <div className="space-y-1">
                      {customKeys.filter(k => k.provider_id === provider.id).map(key => (
                        <div key={key.id} className="flex items-center justify-between bg-slate-900/40 rounded-xl px-3 py-2">
                          <div>
                            <span className="text-sm text-white">{key.key_name}</span>
                            <span className={cn("text-xs ml-2 px-1.5 py-0.5 rounded-lg",
                              key.status === 'valid' ? 'bg-emerald-500/10 text-emerald-400' :
                              key.status === 'invalid' ? 'bg-red-500/10 text-red-400' :
                              'bg-slate-700/50 text-slate-400'
                            )}>{key.status}</span>
                          </div>
                          <button onClick={() => deleteCustomKey(key.id)} className="text-red-400 hover:text-red-300">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      {customKeys.filter(k => k.provider_id === provider.id).length === 0 && (
                        <p className="text-xs text-slate-600">No keys added yet</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {customProviders.length === 0 && !showAddProvider && (
              <div className="text-center py-12">
                <Puzzle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No custom providers yet</p>
                <p className="text-sm text-slate-600">Add OpenRouter, Together, Groq, or any OpenAI-compatible API</p>
              </div>
            )}
          </div>
        )}

        {/* Secrets Tab */}
        {activeTab === 'secrets' && (
          <div className="bg-slate-800/40 backdrop-blur-sm rounded-3xl border border-slate-700/50 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Key className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Secrets Management</h3>
                <p className="text-sm text-slate-500">Manage API keys and credentials for AI providers</p>
              </div>
            </div>
            <div className="bg-slate-900/40 rounded-2xl p-4 border border-slate-700/30">
              <SecretList />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
