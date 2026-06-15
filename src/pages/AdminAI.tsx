import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import SecretList from '../components/admin/SecretList';
import {
  Loader2, Save, RefreshCw, CheckCircle2, XCircle, AlertTriangle,
  Server, Cpu, Activity, Zap, ArrowLeft, Settings, BarChart3, Key
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

export default function AdminAI() {
  const { session, profileData } = useAuthStore();
  const navigate = useNavigate();

  const [providers, setProviders] = useState<Provider[]>([]);
  const [healthData, setHealthData] = useState<HealthCheckResult[]>([]);
  const [healthSummary, setHealthSummary] = useState<any>(null);
  const [validating, setValidating] = useState<string | null>(null);
  const [models, setModels] = useState<Model[]>([]);
  const [usageStats, setUsageStats] = useState<UsageStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'providers' | 'models' | 'stats' | 'secrets'>('providers');

  // Redirect if not admin
  useEffect(() => {
    if (profileData.role !== 'admin') {
      navigate('/');
    }
  }, [profileData.role, navigate]);

  // Fetch data
  useEffect(() => {
    if (profileData.role !== 'admin' || !session) return;
    fetchData();
  }, [profileData.role, session]);

  const fetchData = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const [providersRes, modelsRes, statsRes, healthRes] = await Promise.all([
        fetch('/api/admin-ai?action=providers', {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        }),
        fetch('/api/admin-ai?action=models', {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        }),
        fetch('/api/admin-ai?action=usage-stats&days=7', {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        }),
        fetch('/api/admin-ai?action=health-check', {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
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
    } catch (e) {
      console.error('Fetch AI data failed:', e);
    } finally {
      setLoading(false);
    }
  };

  const toggleProvider = async (id: string, enabled: boolean) => {
    if (!session) return;
    setSaving(true);
    try {
      await fetch('/api/admin-ai?action=provider-toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
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
    if (!session) return;
    setSaving(true);
    try {
      await fetch('/api/admin-ai?action=model-toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
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
    if (!session) return;
    setSaving(true);
    try {
      await fetch('/api/admin-ai?action=model-set-primary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ id })
      });
      // Update local state
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
    if (!session) return;
    setSaving(true);
    try {
      await fetch('/api/admin-ai?action=model-set-fallback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ id })
      });
      // Update local state
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

  const getStatusIcon = (status: RuntimeStatus) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'MISSING_KEY': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'INVALID_KEY': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'UNREACHABLE': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'RATE_LIMITED': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'DISABLED': return <XCircle className="w-4 h-4 text-muted-foreground" />;
      default: return <XCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: RuntimeStatus) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-600 bg-green-50';
      case 'MISSING_KEY': return 'text-amber-600 bg-amber-50';
      case 'INVALID_KEY': return 'text-red-600 bg-red-50';
      case 'UNREACHABLE': return 'text-red-600 bg-red-50';
      case 'RATE_LIMITED': return 'text-amber-600 bg-amber-50';
      case 'DISABLED': return 'text-muted-foreground bg-muted';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getProviderHealth = (providerId: string): HealthCheckResult | undefined => {
    return healthData.find(h => h.provider === providerId);
  };

  const validateProvider = async (providerId: string) => {
    if (!session) return;
    setValidating(providerId);
    try {
      const res = await fetch('/api/admin-ai?action=validate-provider', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
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

  const getModelStats = (modelId: string) => {
    return usageStats.find(s => s.model_id === modelId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-20 px-4 md:px-6 overflow-x-hidden">
      {/* Back nav */}
      <button
        onClick={() => navigate('/admin')}
        className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Admin
      </button>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 md:p-8 text-white mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <Settings className="w-8 h-8" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">AI Settings</h1>
            <p className="text-white/80 text-sm">Kelola provider, model, dan routing AI</p>
          </div>
        </div>
      </div>

      {/* Routing Diagnostics */}
      <div className="bg-card p-6 rounded-3xl border border-border mb-8">
        <h3 className="font-bold text-lg mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-blue-600" />
          Routing Diagnostics
        </h3>
        <div className="space-y-3">
          {providers
             .sort((a, b) => a.priority - b.priority)
             .map((provider, idx) => {
               const hasModel = models.some(m => m.provider_id === provider.id && m.enabled);
               const isPrimary = models.some(m => m.provider_id === provider.id && m.is_primary);
               const isFallback = models.some(m => m.provider_id === provider.id && m.is_fallback);
               
               let status = 'Missing Key';
               let result = 'Skipped';
               let statusColor = 'text-red-600';
               
               if (!provider.enabled) {
                 status = 'Disabled';
                 result = 'Skipped';
                 statusColor = 'text-muted-foreground';
               } else if (isPrimary) {
                 status = 'Active';
                 result = 'Serving Traffic';
                 statusColor = 'text-green-600';
               } else if (isFallback) {
                 status = 'Available';
                 result = 'Standby';
                 statusColor = 'text-amber-600';
               } else if (hasModel) {
                 status = 'Available';
                 result = 'Standby';
                 statusColor = 'text-blue-600';
               }
               
               return (
                 <div key={provider.id} className="flex items-center justify-between p-3 bg-muted rounded-xl">
                   <div className="flex items-center space-x-3">
                     <span className="text-sm font-bold text-muted-foreground w-6">{idx + 1}.</span>
                     <span className="font-medium">{provider.name}</span>
                   </div>
                   <div className="flex items-center space-x-4">
                     <span className={cn("text-sm font-medium", statusColor)}>
                       Status: {status}
                     </span>
                     <span className="text-sm text-muted-foreground">
                       Result: {result}
                     </span>
                   </div>
                 </div>
               );
             })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-8">
        {(['providers', 'models', 'stats', 'secrets'] as const).map(tab => (
          <Button
            key={tab}
            variant={activeTab === tab ? 'default' : 'outline'}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "rounded-2xl",
              activeTab === tab && "bg-blue-600 text-white"
            )}
          >
            {tab === 'providers' && <Server className="w-4 h-4 mr-2" />}
            {tab === 'models' && <Cpu className="w-4 h-4 mr-2" />}
            {tab === 'stats' && <BarChart3 className="w-4 h-4 mr-2" />}
            {tab === 'secrets' && <Key className="w-4 h-4 mr-2" />}
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Button>
        ))}
      </div>

      {/* Providers Tab */}
      {activeTab === 'providers' && (
        <div className="space-y-4">
          {providers.map(provider => (
            <div
              key={provider.id}
              className={cn(
                "bg-card p-6 rounded-3xl border-2 transition-all",
                getProviderHealth(provider.id)?.runtime_status === 'ACTIVE' ? "border-green-200" :
                getProviderHealth(provider.id)?.runtime_status === 'MISSING_KEY' ? "border-amber-200" :
                provider.enabled ? "border-red-200" : "border-border opacity-60"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(getProviderHealth(provider.id)?.runtime_status || (provider.enabled ? 'ACTIVE' : 'DISABLED'))}
                  <div>
                    <h3 className="font-bold text-lg">{provider.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Priority: {provider.priority}
                      </span>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-medium",
                        getStatusColor(getProviderHealth(provider.id)?.runtime_status || (provider.enabled ? 'ACTIVE' : 'DISABLED'))
                      )}>
                        {getProviderHealth(provider.id)?.runtime_status || (provider.enabled ? 'Checking...' : 'DISABLED')}
                      </span>
                    </div>
                    {getProviderHealth(provider.id)?.latency_ms && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Latency: {getProviderHealth(provider.id)?.latency_ms}ms
                      </p>
                    )}
                    {getProviderHealth(provider.id)?.error_message && (
                      <p className="text-xs text-red-500 mt-1">
                        {getProviderHealth(provider.id)?.error_message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => validateProvider(provider.id)}
                    disabled={validating === provider.id}
                    className="rounded-xl"
                  >
                    {validating === provider.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant={provider.enabled ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleProvider(provider.id, !provider.enabled)}
                    disabled={saving}
                    className="rounded-xl"
                  >
                    {provider.enabled ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>
              </div>

              {/* Models for this provider */}
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm font-bold text-muted-foreground mb-2">Models:</p>
                <div className="flex flex-wrap gap-2">
                  {models
                    .filter(m => m.provider_id === provider.id)
                    .map(model => (
                      <span
                        key={model.id}
                        className={cn(
                          "px-3 py-1 rounded-lg text-sm font-medium",
                          model.is_primary ? "bg-blue-100 text-blue-800" :
                          model.is_fallback ? "bg-amber-100 text-amber-800" :
                          model.enabled ? "bg-muted text-foreground" :
                          "bg-muted text-muted-foreground"
                        )}
                      >
                        {model.display_name}
                        {model.is_primary && " (Primary)"}
                        {model.is_fallback && " (Fallback)"}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Models Tab */}
      {activeTab === 'models' && (
        <div className="space-y-4">
          {models.map(model => {
            const stats = getModelStats(model.id);
            return (
              <div
                key={model.id}
                className={cn(
                  "bg-card p-6 rounded-3xl border-2 transition-all",
                  model.enabled ? "border-green-200" : "border-border opacity-60"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="font-bold text-lg">{model.display_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {model.name} • {model.provider_id}
                      </p>
                    </div>
                    {model.is_primary && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs font-bold">
                        PRIMARY
                      </span>
                    )}
                    {model.is_fallback && (
                      <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-lg text-xs font-bold">
                        FALLBACK
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {!model.is_primary && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPrimary(model.id)}
                        disabled={saving}
                        className="rounded-xl"
                      >
                        Set Primary
                      </Button>
                    )}
                    {!model.is_fallback && !model.is_primary && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFallback(model.id)}
                        disabled={saving}
                        className="rounded-xl"
                      >
                        Set Fallback
                      </Button>
                    )}
                    <Button
                      variant={model.enabled ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleModel(model.id, !model.enabled)}
                      disabled={saving}
                      className="rounded-xl"
                    >
                      {model.enabled ? 'On' : 'Off'}
                    </Button>
                  </div>
                </div>

                {/* Stats */}
                {stats && (
                  <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Requests</p>
                      <p className="font-bold">{stats.total_requests}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Success Rate</p>
                      <p className="font-bold">
                        {stats.total_requests > 0
                          ? Math.round((stats.successful_requests / stats.total_requests) * 100)
                          : 0}%
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Avg Latency</p>
                      <p className="font-bold">
                        {stats.total_requests > 0
                          ? Math.round(stats.total_latency_ms / stats.total_requests)
                          : 0}ms
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Tokens</p>
                      <p className="font-bold">
                        {(stats.total_tokens_in + stats.total_tokens_out).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Stats Tab */}
      {activeTab === 'stats' && (
        <div className="bg-card p-6 rounded-3xl border border-border">
          <h3 className="font-bold text-lg mb-4">Usage Stats (7 days)</h3>
          {usageStats.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No usage data yet</p>
          ) : (
            <div className="space-y-4">
              {usageStats.map((stat, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-muted rounded-2xl">
                  <div>
                    <p className="font-bold">{stat.provider_id} / {stat.model_id}</p>
                    <p className="text-sm text-muted-foreground">
                      {stat.total_requests} requests • {stat.successful_requests} successful
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      {stat.total_requests > 0
                        ? Math.round(stat.total_latency_ms / stat.total_requests)
                        : 0}ms avg
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {(stat.total_tokens_in + stat.total_tokens_out).toLocaleString()} tokens
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Secrets Tab */}
      {activeTab === 'secrets' && (
        <SecretList />
      )}
    </div>
  );
}
