import { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import SecretList from '../components/admin/SecretList';
import {
  Loader2, RefreshCw, CheckCircle2, XCircle, AlertTriangle,
  Server, Cpu, Activity, Zap, ArrowLeft, Settings, BarChart3, Key,
  Shield, TrendingUp, Clock, AlertCircle, WifiOff, Gauge
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

const STATUS_ICON: Record<RuntimeStatus, typeof CheckCircle2> = {
  ACTIVE: CheckCircle2, MISSING_KEY: AlertTriangle, INVALID_KEY: XCircle,
  UNREACHABLE: XCircle, RATE_LIMITED: AlertCircle, DISABLED: XCircle,
};
const STATUS_CLR: Record<RuntimeStatus, string> = {
  ACTIVE: 'text-emerald-500', MISSING_KEY: 'text-amber-500', INVALID_KEY: 'text-red-500',
  UNREACHABLE: 'text-red-500', RATE_LIMITED: 'text-yellow-500', DISABLED: 'text-slate-500',
};
const STATUS_BG: Record<RuntimeStatus, string> = {
  ACTIVE: 'bg-emerald-500/15 border-emerald-500/20',
  MISSING_KEY: 'bg-amber-500/15 border-amber-500/20',
  INVALID_KEY: 'bg-red-500/15 border-red-500/20',
  UNREACHABLE: 'bg-red-500/15 border-red-500/20',
  RATE_LIMITED: 'bg-yellow-500/15 border-yellow-500/20',
  DISABLED: 'bg-slate-500/10 border-slate-500/20',
};
const STATUS_LABEL: Record<RuntimeStatus, string> = {
  ACTIVE: 'Active', MISSING_KEY: 'Missing Key', INVALID_KEY: 'Invalid Key',
  UNREACHABLE: 'Unreachable', RATE_LIMITED: 'Rate Limited', DISABLED: 'Disabled',
};
const STATUS_GLOW: Record<RuntimeStatus, string> = {
  ACTIVE: 'from-emerald-500/10 to-emerald-500/5',
  MISSING_KEY: 'from-amber-500/10 to-amber-500/5',
  INVALID_KEY: 'from-red-500/10 to-red-500/5',
  UNREACHABLE: 'from-red-500/10 to-red-500/5',
  RATE_LIMITED: 'from-yellow-500/10 to-yellow-500/5',
  DISABLED: 'from-slate-500/5 to-slate-500/0',
};

type Tab = 'health' | 'providers' | 'routing' | 'usage' | 'secrets';

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
  const [activeTab, setActiveTab] = useState<Tab>('health');
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null);

  useEffect(() => { if (profileData.role !== 'admin') navigate('/'); }, [profileData.role, navigate]);
  useEffect(() => { if (profileData.role === 'admin' && session) fetchData(); }, [profileData.role, session]);

  const fetchData = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const hdr = { Authorization: `Bearer ${session.access_token}` };
      const [pR, mR, sR, hR] = await Promise.all([
        fetch('/api/admin-ai?action=providers', { headers: hdr }),
        fetch('/api/admin-ai?action=models', { headers: hdr }),
        fetch('/api/admin-ai?action=usage-stats&days=7', { headers: hdr }),
        fetch('/api/admin-ai?action=health-check', { headers: hdr }),
      ]);
      if (pR.ok) setProviders(await pR.json());
      if (mR.ok) setModels(await mR.json());
      if (sR.ok) setUsageStats(await sR.json());
      if (hR.ok) { const h = await hR.json(); setHealthData(h.providers || []); setHealthSummary(h.summary || null); }
    } catch (e) { console.error('Fetch AI data failed:', e); }
    finally { setLoading(false); }
  };

  const post = async (action: string, body: any) => {
    if (!session) return;
    setSaving(true);
    try {
      await fetch(`/api/admin-ai?action=${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify(body),
      });
    } catch (e) { console.error(`${action} failed:`, e); }
    finally { setSaving(false); }
  };

  const toggleProvider = async (id: string, enabled: boolean) => {
    await post('provider-toggle', { id, enabled });
    setProviders(ps => ps.map(p => p.id === id ? { ...p, enabled, status: enabled ? 'active' as const : 'disabled' as const } : p));
  };

  const toggleModel = async (id: string, enabled: boolean) => {
    await post('model-toggle', { id, enabled });
    setModels(ms => ms.map(m => m.id === id ? { ...m, enabled } : m));
  };

  const setPrimary = async (id: string) => {
    await post('model-set-primary', { id });
    setModels(ms => ms.map(m => ({ ...m, is_primary: m.id === id, enabled: m.id === id ? true : m.enabled })));
  };

  const setFallback = async (id: string) => {
    await post('model-set-fallback', { id });
    setModels(ms => ms.map(m => ({ ...m, is_fallback: m.id === id, enabled: m.id === id ? true : m.enabled })));
  };

  const validateProvider = async (pid: string) => {
    if (!session) return;
    setValidating(pid);
    try {
      const res = await fetch('/api/admin-ai?action=validate-provider', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider_id: pid }),
      });
      if (res.ok) {
        const r = await res.json();
        setHealthData(prev => {
          const i = prev.findIndex(h => h.provider === pid);
          if (i >= 0) { const u = [...prev]; u[i] = { ...u[i], ...r }; return u; }
          return [...prev, r];
        });
      }
    } catch (e) { console.error('Validate failed:', e); }
    finally { setValidating(null); }
  };

  const getHealth = (pid: string) => healthData.find(h => h.provider === pid);
  const getModelStats = (mid: string) => usageStats.find(s => s.model_id === mid);

  const statusCounts = useMemo(() => {
    const c: Record<RuntimeStatus, number> = { ACTIVE: 0, MISSING_KEY: 0, INVALID_KEY: 0, UNREACHABLE: 0, RATE_LIMITED: 0, DISABLED: 0 };
    healthData.forEach(h => { if (c[h.runtime_status] !== undefined) c[h.runtime_status]++; });
    return c;
  }, [healthData]);

  const agg = useMemo(() => {
    const tr = usageStats.reduce((s, x) => s + x.total_requests, 0);
    const ts = usageStats.reduce((s, x) => s + x.successful_requests, 0);
    const tl = usageStats.reduce((s, x) => s + x.total_latency_ms, 0);
    const tt = usageStats.reduce((s, x) => s + x.total_tokens_in + x.total_tokens_out, 0);
    return { total: tr, success: ts, failed: tr - ts, rate: tr > 0 ? Math.round((ts / tr) * 100) : 0, avgLatency: tr > 0 ? Math.round(tl / tr) : 0, tokens: tt };
  }, [usageStats]);

  const sortedProviders = useMemo(() => [...providers].sort((a, b) => a.priority - b.priority), [providers]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl animate-pulse" />
            <Loader2 className="w-10 h-10 animate-spin text-blue-500 relative" />
          </div>
          <p className="text-muted-foreground text-sm">Initializing Command Center...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'health' as Tab, label: 'Health', icon: Activity },
    { id: 'providers' as Tab, label: 'Providers', icon: Server },
    { id: 'routing' as Tab, label: 'Routing', icon: Zap },
    { id: 'usage' as Tab, label: 'Usage', icon: BarChart3 },
    { id: 'secrets' as Tab, label: 'Secrets', icon: Key },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 md:px-6">
        <button onClick={() => navigate('/admin')} className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-foreground mt-6 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Admin
        </button>

        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 md:p-8 text-white mb-8 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          </div>
          <div className="relative flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 shrink-0">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">AI Command Center</h1>
              <p className="text-white/70 text-sm mt-0.5">Monitor, configure, and control AI infrastructure</p>
            </div>
          </div>
        </div>

        {/* Health Dashboard */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-8">
          {(Object.keys(STATUS_ICON) as RuntimeStatus[]).map(s => {
            const Icon = STATUS_ICON[s];
            return (
              <div key={s} className={cn("relative overflow-hidden rounded-2xl border p-4 md:p-5 transition-all hover:shadow-lg", STATUS_BG[s])}>
                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50", STATUS_GLOW[s])} />
                <div className="relative z-10 flex flex-col items-center text-center">
                  <Icon className={cn("w-5 h-5 mb-2", STATUS_CLR[s])} />
                  <span className={cn("text-2xl md:text-3xl font-black", STATUS_CLR[s])}>{statusCounts[s]}</span>
                  <span className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">{STATUS_LABEL[s]}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Aggregate Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Total Requests', value: agg.total.toLocaleString(), icon: Activity, color: 'text-blue-500' },
            { label: 'Success Rate', value: `${agg.rate}%`, icon: TrendingUp, color: 'text-emerald-500' },
            { label: 'Avg Latency', value: `${agg.avgLatency}ms`, icon: Clock, color: 'text-amber-500' },
            { label: 'Total Tokens', value: agg.tokens.toLocaleString(), icon: Gauge, color: 'text-purple-500' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-2xl border border-border bg-card p-4 md:p-5">
              <div className="flex items-center space-x-2 mb-2">
                <Icon className={cn("w-4 h-4", color)} />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</span>
              </div>
              <span className="text-xl md:text-2xl font-black">{value}</span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map(t => (
            <Button key={t.id} variant={activeTab === t.id ? 'default' : 'outline'} onClick={() => setActiveTab(t.id)}
              className={cn("rounded-2xl", activeTab === t.id && "bg-blue-600 text-white")}>
              <t.icon className="w-4 h-4 mr-2" />{t.label}
            </Button>
          ))}
        </div>

        {/* Tab: Health */}
        {activeTab === 'health' && (
          <div className="space-y-4">
            {sortedProviders.map(p => {
              const h = getHealth(p.id);
              const st = h?.runtime_status || (p.enabled ? 'ACTIVE' : 'DISABLED');
              const Icon = STATUS_ICON[st];
              return (
                <div key={p.id} className={cn("rounded-3xl border-2 bg-card overflow-hidden transition-all", STATUS_BG[st])}>
                  <div className="p-5 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", STATUS_BG[st])}>
                        <Icon className={cn("w-5 h-5", STATUS_CLR[st])} />
                      </div>
                      <div>
                        <h3 className="font-bold">{p.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground">Priority {p.priority}</span>
                          <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold border uppercase tracking-wider", STATUS_BG[st], STATUS_CLR[st])}>
                            {STATUS_LABEL[st]}
                          </span>
                          {h?.latency_ms != null && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{h.latency_ms}ms</span>
                          )}
                        </div>
                        {h?.error_message && <p className="text-xs text-red-500 mt-1">{h.error_message}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="rounded-xl" onClick={() => validateProvider(p.id)} disabled={validating === p.id}>
                        {validating === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                      </Button>
                      <Button variant={p.enabled ? 'default' : 'outline'} size="sm" className="rounded-xl" onClick={() => toggleProvider(p.id, !p.enabled)} disabled={saving}>
                        {p.enabled ? 'On' : 'Off'}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab: Providers */}
        {activeTab === 'providers' && (
          <div className="space-y-4">
            {providers.map(provider => (
              <div key={provider.id} className="rounded-3xl border border-border bg-card overflow-hidden">
                <button onClick={() => setExpandedProvider(expandedProvider === provider.id ? null : provider.id)}
                  className="w-full p-5 flex items-center justify-between hover:bg-muted/50 transition-colors text-left">
                  <div className="flex items-center space-x-4">
                    <Server className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-bold">{provider.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Priority {provider.priority} &middot; {models.filter(m => m.provider_id === provider.id).length} models</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {(() => { const h = getHealth(provider.id); return h ? (
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold border uppercase", STATUS_BG[h.runtime_status], STATUS_CLR[h.runtime_status])}>{STATUS_LABEL[h.runtime_status]}</span>
                    ) : null; })()}
                    <Zap className={cn("w-4 h-4 transition-transform", expandedProvider === provider.id && "rotate-90")} />
                  </div>
                </button>
                {expandedProvider === provider.id && (
                  <div className="px-5 pb-5 border-t border-border">
                    <div className="pt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">API Key</span>
                        <span className={cn("text-sm font-medium", provider.config?.api_key ? "text-emerald-500" : "text-red-500")}>
                          {provider.config?.api_key ? "Configured" : "Not Set"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <span className="text-sm font-medium">{provider.enabled ? "Enabled" : "Disabled"}</span>
                      </div>
                      {getHealth(provider.id)?.error_message && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                          <p className="text-sm text-red-500">{getHealth(provider.id)?.error_message}</p>
                        </div>
                      )}
                      <div className="pt-2">
                        <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">Models</p>
                        <div className="flex flex-wrap gap-2">
                          {models.filter(m => m.provider_id === provider.id).map(model => (
                            <span key={model.id} className={cn("px-3 py-1 rounded-lg text-sm font-medium",
                              model.is_primary ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" :
                              model.is_fallback ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" :
                              model.enabled ? "bg-muted" : "bg-muted text-muted-foreground"
                            )}>
                              {model.display_name}{model.is_primary ? ' ★' : model.is_fallback ? ' ⚡' : ''}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tab: Routing */}
        {activeTab === 'routing' && (
          <div className="rounded-3xl border border-border bg-card p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center"><Zap className="w-5 h-5 mr-2 text-amber-500" />Failover Chain</h3>
            <div className="space-y-0">
              {sortedProviders.map((p, idx) => {
                const h = getHealth(p.id);
                const st = h?.runtime_status || (p.enabled ? 'ACTIVE' : 'DISABLED');
                const isPrimary = models.some(m => m.provider_id === p.id && m.is_primary);
                const isFallback = models.some(m => m.provider_id === p.id && m.is_fallback);
                return (
                  <div key={p.id}>
                    <div className={cn("flex items-center p-4 rounded-2xl transition-all",
                      st === 'ACTIVE' ? "bg-emerald-500/5 border border-emerald-500/10" :
                      st === 'DISABLED' ? "bg-muted/50 opacity-60" : "bg-card border border-border"
                    )}>
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shrink-0">{idx + 1}</div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{p.name}</span>
                          {isPrimary && <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 font-bold border border-blue-500/20">PRIMARY</span>}
                          {isFallback && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-bold border border-amber-500/20">FALLBACK</span>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {st === 'ACTIVE' ? 'Serving traffic' : st === 'DISABLED' ? 'Skipped — disabled' : `Status: ${STATUS_LABEL[st]}`}
                          {h?.latency_ms != null && ` · ${h.latency_ms}ms`}
                        </p>
                      </div>
                      <div className={cn("w-3 h-3 rounded-full", st === 'ACTIVE' ? "bg-emerald-500" : st === 'DISABLED' ? "bg-slate-400" : "bg-amber-500")} />
                    </div>
                    {idx < sortedProviders.length - 1 && (
                      <div className="flex justify-center py-1">
                        <div className="w-px h-6 bg-border" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab: Usage */}
        {activeTab === 'usage' && (
          <div className="space-y-4">
            {usageStats.length === 0 ? (
              <div className="rounded-3xl border border-border bg-card p-12 text-center">
                <BarChart3 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No usage data yet</p>
              </div>
            ) : (
              usageStats.map((stat, idx) => (
                <div key={idx} className="rounded-3xl border border-border bg-card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-bold">{stat.provider_id} <span className="text-muted-foreground">/</span> {stat.model_id}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{stat.total_requests} requests</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{stat.total_requests > 0 ? Math.round((stat.successful_requests / stat.total_requests) * 100) : 0}%</p>
                      <p className="text-xs text-muted-foreground">success</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-xl bg-muted/50 p-3 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Avg Latency</p>
                      <p className="font-bold text-sm">{stat.total_requests > 0 ? Math.round(stat.total_latency_ms / stat.total_requests) : 0}ms</p>
                    </div>
                    <div className="rounded-xl bg-muted/50 p-3 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Tokens</p>
                      <p className="font-bold text-sm">{(stat.total_tokens_in + stat.total_tokens_out).toLocaleString()}</p>
                    </div>
                    <div className="rounded-xl bg-muted/50 p-3 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Failed</p>
                      <p className="font-bold text-sm">{stat.failed_requests}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab: Secrets */}
        {activeTab === 'secrets' && <SecretList />}
      </div>
    </div>
  );
}
