import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import {
  Loader2, Save, RefreshCw, CheckCircle2, XCircle, AlertTriangle,
  Server, Cpu, Activity, Zap, ArrowLeft, Settings, BarChart3
} from 'lucide-react';
import { cn } from '../lib/utils';

interface Provider {
  id: string;
  name: string;
  enabled: boolean;
  priority: number;
  status: 'active' | 'degraded' | 'down' | 'disabled';
  config: Record<string, any>;
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
  const [models, setModels] = useState<Model[]>([]);
  const [usageStats, setUsageStats] = useState<UsageStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'providers' | 'models' | 'stats'>('providers');

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
      const [providersRes, modelsRes, statsRes] = await Promise.all([
        fetch('/api/admin-ai?action=providers', {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        }),
        fetch('/api/admin-ai?action=models', {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        }),
        fetch('/api/admin-ai?action=usage-stats&days=7', {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        })
      ]);

      if (providersRes.ok) setProviders(await providersRes.json());
      if (modelsRes.ok) setModels(await modelsRes.json());
      if (statsRes.ok) setUsageStats(await statsRes.json());
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'degraded': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'down': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <XCircle className="w-4 h-4 text-slate-400" />;
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
    <div className="max-w-6xl mx-auto pb-20">
      {/* Back nav */}
      <button
        onClick={() => navigate('/admin')}
        className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-slate-800 mb-6 transition-colors"
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

      {/* Tabs */}
      <div className="flex space-x-2 mb-8">
        {(['providers', 'models', 'stats'] as const).map(tab => (
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
                "bg-white p-6 rounded-3xl border-2 transition-all",
                provider.enabled ? "border-green-200" : "border-slate-200 opacity-60"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(provider.status)}
                  <div>
                    <h3 className="font-bold text-lg">{provider.name}</h3>
                    <p className="text-sm text-slate-500">
                      Priority: {provider.priority} • Status: {provider.status}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
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
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-sm font-bold text-slate-500 mb-2">Models:</p>
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
                          model.enabled ? "bg-slate-100 text-slate-700" :
                          "bg-slate-50 text-slate-400"
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
                  "bg-white p-6 rounded-3xl border-2 transition-all",
                  model.enabled ? "border-green-200" : "border-slate-200 opacity-60"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="font-bold text-lg">{model.display_name}</h3>
                      <p className="text-sm text-slate-500">
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
                  <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500">Requests</p>
                      <p className="font-bold">{stats.total_requests}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Success Rate</p>
                      <p className="font-bold">
                        {stats.total_requests > 0
                          ? Math.round((stats.successful_requests / stats.total_requests) * 100)
                          : 0}%
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Avg Latency</p>
                      <p className="font-bold">
                        {stats.total_requests > 0
                          ? Math.round(stats.total_latency_ms / stats.total_requests)
                          : 0}ms
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Tokens</p>
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
        <div className="bg-white p-6 rounded-3xl border border-slate-200">
          <h3 className="font-bold text-lg mb-4">Usage Stats (7 days)</h3>
          {usageStats.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No usage data yet</p>
          ) : (
            <div className="space-y-4">
              {usageStats.map((stat, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <div>
                    <p className="font-bold">{stat.provider_id} / {stat.model_id}</p>
                    <p className="text-sm text-slate-500">
                      {stat.total_requests} requests • {stat.successful_requests} successful
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      {stat.total_requests > 0
                        ? Math.round(stat.total_latency_ms / stat.total_requests)
                        : 0}ms avg
                    </p>
                    <p className="text-sm text-slate-500">
                      {(stat.total_tokens_in + stat.total_tokens_out).toLocaleString()} tokens
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
