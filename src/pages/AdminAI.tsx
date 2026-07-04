import { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router';

import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import SecretList from '../components/admin/SecretList';
import {
  Loader2, RefreshCw, CheckCircle2, XCircle, AlertTriangle,
  Server, Cpu, Activity, Zap, ArrowLeft, BarChart3, Key,
  Shield, TrendingUp, Clock, AlertCircle, EyeOff, Eye,
  ChevronRight, Gauge, Puzzle, Plus, Trash2, TestTube, Globe,
  Bell, Send, Scan
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
  key_source?: string;
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
  // Get Clerk JWT for API auth (no Supabase session needed)
  // Backend decodes the JWT to verify admin email
  try {
    const clerk = (window as any).Clerk;
    if (clerk?.session && typeof clerk.session.getToken === 'function') {
      const token = await clerk.session.getToken();
      if (token) return token;
    }
  } catch (e) {
    console.warn('[AdminAI] Clerk token unavailable:', e);
  }
  return null;
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
  const [activeTab, setActiveTab] = useState<'health' | 'providers' | 'custom' | 'routing' | 'usage' | 'secrets' | 'webhooks'>('health');

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
  const [detectedModels, setDetectedModels] = useState<Record<string, any[]>>({});
  const [detectingModels, setDetectingModels] = useState<string | null>(null);
  const [importingModels, setImportingModels] = useState<string | null>(null);
  const [selectedDetected, setSelectedDetected] = useState<Record<string, string[]>>({});
  const [webhookTesting, setWebhookTesting] = useState(false);
  const [webhookResult, setWebhookResult] = useState<{ ok: boolean; message: string } | null>(null);
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

  const detectModels = async (providerId: string) => {
    const key = providerKeys[providerId] || '';
    const existingSecret = secrets.find(s => s.provider_id === providerId);
    const keyToUse = key && key !== '••••••••' ? key : null;
    if (!keyToUse) {
      // Try to use saved key from DB via validate endpoint
      // But for detection we need the actual key, so prompt user
      return;
    }
    setDetectingModels(providerId);
    try {
      const res = await fetch('/api/admin-ai?action=detect-models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getToken()}`
        },
        body: JSON.stringify({ provider_id: providerId, api_key: keyToUse })
      });
      if (res.ok) {
        const data = await res.json();
        setDetectedModels(prev => ({ ...prev, [providerId]: data.models || [] }));
        // Auto-select all detected models
        setSelectedDetected(prev => ({
          ...prev,
          [providerId]: (data.models || []).map((m: any) => m.model_id)
        }));
      } else {
        const err = await res.json().catch(() => ({ error: 'Detection failed' }));
        console.error('Model detection failed:', err.error);
      }
    } catch (e) {
      console.error('Model detection error:', e);
    } finally {
      setDetectingModels(null);
    }
  };

  const importDetectedModels = async (providerId: string) => {
    const selected = selectedDetected[providerId] || [];
    const detected = detectedModels[providerId] || [];
    if (selected.length === 0) return;
    setImportingModels(providerId);
    try {
      let imported = 0;
      for (const modelId of selected) {
        const modelInfo = detected.find((m: any) => m.model_id === modelId);
        if (!modelInfo) continue;
        const res = await fetch('/api/admin-ai?action=model-add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await getToken()}`
          },
          body: JSON.stringify({
            provider_id: providerId,
            model_name: modelInfo.model_id,
            display_name: modelInfo.display_name || modelInfo.model_id,
            enabled: true,
          })
        });
        if (res.ok) imported++;
      }
      // Refresh models
      await fetchData();
      // Clear detected after import
      setDetectedModels(prev => ({ ...prev, [providerId]: [] }));
      setSelectedDetected(prev => ({ ...prev, [providerId]: [] }));
    } catch (e) {
      console.error('Import models error:', e);
    } finally {
      setImportingModels(null);
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

  const testWebhook = async () => {
    setWebhookTesting(true);
    setWebhookResult(null);
    try {
      const token = await getToken();
      const res = await fetch('/api/webhook-notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ test: true }),
      });
      const data = await res.json();
      if (data.success) {
        setWebhookResult({ ok: true, message: 'Test notification sent to Discord!' });
      } else {
        setWebhookResult({ ok: false, message: data.error || 'Unknown error' });
      }
    } catch (e: any) {
      setWebhookResult({ ok: false, message: e.message || 'Request failed' });
    } finally {
      setWebhookTesting(false);
    }
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
    { id: 'webhooks' as const, label: 'Webhooks', icon: Bell },
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
              <div className="p-2 bg-[#F2C94C]/10 ">
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
            className=" border-border hover:bg-muted gap-2"
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
            <Card key={label} className=" border-border bg-card hover: transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2  ${bg}`}>
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
                <div key={label} className={`flex items-center gap-3 px-4 py-3  border transition-colors ${
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
        <div className="flex flex-wrap gap-2 mb-8 p-1 bg-card  border border-border">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex items-center space-x-2 px-4 py-2.5  text-sm font-medium transition-all",
                activeTab === id
                  ? "bg-[#F2C94C] text-[#1F2937]   font-bold"
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
            {/* Provider Health Cards */}
            <div className="glass-card  border border-border p-6">
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
                        "relative bg-card  p-4 border transition-all hover:border-border",
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
                          <span className={cn("px-2 py-1  text-xs font-medium", getStatusBadge(status))}>
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
            <div className="bg-[#F2C94C]/5 border border-[#F2C94C]/20  p-4 flex items-center gap-3">
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
                    "bg-card  border p-5 transition-all",
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
                        className={cn(" text-xs", provider.enabled ? "border-emerald-500/30 text-emerald-600" : "border-border text-muted-foreground")}
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
                        className="w-full px-3 py-2  border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#F2C94C]/50 focus:border-[#F2C94C] pr-10"
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
                      className=" bg-[#F2C94C] hover:bg-[#E0B73A] text-[#1F2937] font-bold"
                    >
                      {savingKey === provider.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => validateProvider(provider.id)}
                      disabled={validating === provider.id}
                      className=""
                    >
                      {validating === provider.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <TestTube className="w-4 h-4" />}
                    </Button>
                    {hasKey && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteKey(provider.id)}
                        disabled={savingKey === provider.id}
                        className=" text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  {/* Auto-Detect Models */}
                  {currentKey && currentKey !== '••••••••' && !detectedModels[provider.id]?.length && (
                    <div className="mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => detectModels(provider.id)}
                        disabled={detectingModels === provider.id || !currentKey || currentKey === '••••••••'}
                        className="text-xs"
                      >
                        {detectingModels === provider.id ? (
                          <><Loader2 className="w-3 h-3 animate-spin mr-1" /> Detecting models...</>
                        ) : (
                          <><Scan className="w-3 h-3 mr-1" /> Auto-Detect Models</>
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Detected Models List */}
                  {detectedModels[provider.id]?.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          Detected {detectedModels[provider.id].length} models — select to import
                        </span>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedDetected(prev => ({
                              ...prev,
                              [provider.id]: detectedModels[provider.id].map((m: any) => m.model_id)
                            }))}
                            className="text-[10px] h-6 px-2"
                          >Select All</Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedDetected(prev => ({ ...prev, [provider.id]: [] }))}
                            className="text-[10px] h-6 px-2"
                          >None</Button>
                        </div>
                      </div>
                      <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                        {detectedModels[provider.id].map((m: any) => (
                          <label key={m.model_id} className="flex items-center gap-2 p-1.5 rounded hover:bg-muted cursor-pointer">
                            <input
                              type="checkbox"
                              checked={(selectedDetected[provider.id] || []).includes(m.model_id)}
                              onChange={e => {
                                setSelectedDetected(prev => {
                                  const curr = prev[provider.id] || [];
                                  return {
                                    ...prev,
                                    [provider.id]: e.target.checked
                                      ? [...curr, m.model_id]
                                      : curr.filter(id => id !== m.model_id)
                                  };
                                });
                              }}
                              className="accent-[#F2C94C]"
                            />
                            <span className="text-xs font-mono text-foreground">{m.model_id}</span>
                            {m.context_window && (
                              <span className="text-[10px] text-muted-foreground">({(m.context_window/1000).toFixed(0)}k)</span>
                            )}
                          </label>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          onClick={() => importDetectedModels(provider.id)}
                          disabled={!selectedDetected[provider.id]?.length || importingModels === provider.id}
                          className="bg-[#F2C94C] hover:bg-[#E0B73A] text-[#1F2937] font-bold text-xs"
                        >
                          {importingModels === provider.id ? (
                            <><Loader2 className="w-3 h-3 animate-spin mr-1" /> Importing...</>
                          ) : (
                            `Import ${selectedDetected[provider.id]?.length || 0} model(s)`
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { setDetectedModels(prev => ({ ...prev, [provider.id]: [] })); setSelectedDetected(prev => ({ ...prev, [provider.id]: [] })); }}
                          className="text-xs"
                        >Cancel</Button>
                      </div>
                    </div>
                  )}

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
                <div className="w-10 h-10  bg-[#F2C94C]/10 flex items-center justify-center">
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
                " p-4 border flex items-center gap-3",
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

            {/* Quick Presets */}
            {!showAddProvider && customProviders.length === 0 && (
              <div className="glass-card  border border-border p-6">
                <h4 className="text-foreground font-bold mb-3">Quick Add Provider</h4>
                <p className="text-sm text-muted-foreground mb-4">Choose a popular provider or add custom:</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  {[
                    { id: 'openrouter', name: 'OpenRouter', url: 'https://openrouter.ai/api/v1', fmt: 'openai', auth: 'bearer' },
                    { id: 'together', name: 'Together AI', url: 'https://api.together.xyz/v1', fmt: 'openai', auth: 'bearer' },
                    { id: 'groq', name: 'Groq', url: 'https://api.groq.com/openai/v1', fmt: 'openai', auth: 'bearer' },
                    { id: 'deepseek', name: 'DeepSeek', url: 'https://api.deepseek.com/v1', fmt: 'openai', auth: 'bearer' },
                  ].map(preset => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        setNewProvider({
                          id: preset.id, name: preset.name, base_url: preset.url,
                          auth_type: preset.auth, api_format: preset.fmt,
                          chat_endpoint: '/chat/completions', priority: 50
                        });
                        setShowAddProvider(true);
                      }}
                      className="flex flex-col items-center gap-2 p-4  border border-border bg-background hover:border-[#F2C94C]/50 hover:bg-[#F2C94C]/5 transition-all"
                    >
                      <Globe className="w-6 h-6 text-[#F2C94C]" />
                      <span className="text-sm font-medium text-foreground">{preset.name}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <Button variant="outline" onClick={() => setShowAddProvider(true)} className=" border-border">
                    <Plus className="w-4 h-4 mr-1" /> Add Custom Provider
                  </Button>
                </div>
              </div>
            )}

            {/* Add Provider Form */}
            {showAddProvider && (
              <div className="glass-card  border border-purple-500/30 p-6">
                <h4 className="text-foreground font-bold mb-4">Add Custom Provider</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Provider ID *</label>
                    <input value={newProvider.id} onChange={e => setNewProvider(p => ({ ...p, id: e.target.value }))}
                      placeholder="e.g. openrouter, together, groq"
                      className="w-full bg-background border border-border  px-4 py-2.5 text-foreground text-sm focus:border-[#F2C94C] focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Display Name *</label>
                    <input value={newProvider.name} onChange={e => setNewProvider(p => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. OpenRouter"
                      className="w-full bg-background border border-border  px-4 py-2.5 text-foreground text-sm focus:border-[#F2C94C] focus:outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-muted-foreground mb-1 block">Base URL *</label>
                    <input value={newProvider.base_url} onChange={e => setNewProvider(p => ({ ...p, base_url: e.target.value }))}
                      placeholder="https://openrouter.ai/api/v1"
                      className="w-full bg-background border border-border  px-4 py-2.5 text-foreground text-sm focus:border-[#F2C94C] focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Auth Type</label>
                    <select value={newProvider.auth_type} onChange={e => setNewProvider(p => ({ ...p, auth_type: e.target.value }))}
                      className="w-full bg-background border border-border  px-4 py-2.5 text-foreground text-sm focus:border-[#F2C94C] focus:outline-none">
                      <option value="bearer">Bearer Token</option>
                      <option value="x-api-key">X-API-Key Header</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">API Format</label>
                    <select value={newProvider.api_format} onChange={e => {
                      const fmt = e.target.value;
                      setNewProvider(p => ({
                        ...p,
                        api_format: fmt,
                        chat_endpoint: fmt === 'gemini' ? '/v1beta/models/{model}:generateContent' :
                                       fmt === 'anthropic' ? '/v1/messages' :
                                       '/chat/completions'
                      }));
                    }}
                      className="w-full bg-background border border-border  px-4 py-2.5 text-foreground text-sm focus:border-[#F2C94C] focus:outline-none">
                      <option value="openai">OpenAI Compatible</option>
                      <option value="gemini">Google Gemini</option>
                      <option value="anthropic">Anthropic Claude</option>
                      <option value="mistral">Mistral</option>
                      <option value="cohere">Cohere</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Chat Endpoint</label>
                    <input value={newProvider.chat_endpoint} onChange={e => setNewProvider(p => ({ ...p, chat_endpoint: e.target.value }))}
                      className="w-full bg-background border border-border  px-4 py-2.5 text-foreground text-sm focus:border-[#F2C94C] focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Priority</label>
                    <input type="number" value={newProvider.priority} onChange={e => setNewProvider(p => ({ ...p, priority: Number(e.target.value) }))}
                      className="w-full bg-background border border-border  px-4 py-2.5 text-foreground text-sm focus:border-[#F2C94C] focus:outline-none" />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <Button onClick={createCustomProvider} disabled={saving || !newProvider.id || !newProvider.name || !newProvider.base_url}
                    className="bg-[#F2C94C] hover:bg-[#E0B73A] w-full sm:w-auto">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
                    Create Provider
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddProvider(false)} className="bg-background border-border w-full sm:w-auto">Cancel</Button>
                </div>
              </div>
            )}

            {/* Provider Cards */}
            {customProviders.map(provider => {
              const providerModels = customModels.filter(m => m.provider_id === provider.id);
              const providerKey = customKeys.find(k => k.provider_id === provider.id);
              return (
              <div key={provider.id} className="glass-card  border border-border p-5">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-[#F2C94C]" />
                    <div>
                      <h4 className="font-bold text-foreground">{provider.name}</h4>
                      <p className="text-xs text-muted-foreground font-mono">{provider.base_url}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 justify-end">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#F2C94C]/10 text-[#B8952E]">{provider.api_format}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{provider.auth_type}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">P{provider.priority}</span>
                  </div>
                </div>

                {/* Key Input */}
                <div className="flex flex-col sm:flex-row gap-2 mb-3">
                  <input
                    type="password"
                    placeholder={providerKey ? '•••••••• (key saved)' : 'Paste API key...'}
                    className="flex-1 min-w-0 px-3 py-1.5  border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#F2C94C]/50"
                    id={`custom-key-${provider.id}`}
                  />
                  <div className="flex gap-2"><Button size="sm" onClick={async () => {
                    const input = document.getElementById(`custom-key-${provider.id}`) as HTMLInputElement;
                    if (!input?.value) return;
                    setSavingKey(provider.id);
                    await fetch('/api/custom-provider?action=add-key', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${await getToken()}` },
                      body: JSON.stringify({ provider_id: provider.id, key_name: 'default', api_key: input.value })
                    });
                    input.value = '';
                    setSavingKey(null);
                    await fetchData();
                  }} disabled={savingKey === provider.id} className="bg-[#F2C94C] hover:bg-[#E0B73A] text-[#1F2937] font-bold  text-xs px-3">
                    {savingKey === provider.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save'}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => testCustomProvider(provider.id)} disabled={testing} className="">
                    {testing ? <Loader2 className="w-3 h-3 animate-spin" /> : <TestTube className="w-3 h-3" />}
                  </Button>
                </div></div>

                {/* Models */}
                {providerModels.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {providerModels.map(m => (
                      <span key={m.id} className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                        {m.display_name || m.model_id}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => setShowAddModel(provider.id)} className=" text-xs">
                    <Plus className="w-3 h-3 mr-1" /> Model
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => deleteCustomProvider(provider.id)} className=" text-xs text-red-500 hover:text-red-600">
                    <Trash2 className="w-3 h-3 mr-1" /> Delete
                  </Button>
                </div>

                {/* Add Model Form */}
                {showAddModel === provider.id && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <h5 className="text-sm font-medium text-foreground mb-3">Add Model</h5>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input value={newModel.model_id} onChange={e => setNewModel(m => ({ ...m, model_id: e.target.value }))}
                        placeholder="Model ID (e.g. anthropic/claude-3.5-sonnet)"
                        className="flex-1 min-w-0 bg-background border border-border  px-4 py-2 text-foreground text-sm focus:border-[#F2C94C] focus:outline-none" />
                      <input value={newModel.display_name} onChange={e => setNewModel(m => ({ ...m, display_name: e.target.value }))}
                        placeholder="Display Name"
                        className="flex-1 min-w-0 bg-background border border-border  px-4 py-2 text-foreground text-sm focus:border-[#F2C94C] focus:outline-none" />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => createCustomModel(provider.id)} disabled={saving || !newModel.model_id || !newModel.display_name}
                          className="bg-[#F2C94C] hover:bg-[#E0B73A]">Add</Button>
                        <Button size="sm" variant="outline" onClick={() => setShowAddModel(null)} className="bg-background border-border">Cancel</Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Add Key Form */}
                {showAddKey === provider.id && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <h5 className="text-sm font-medium text-foreground mb-3">Add API Key</h5>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input value={newKey.key_name} onChange={e => setNewKey(k => ({ ...k, key_name: e.target.value }))}
                        placeholder="Key Name"
                        className="sm:w-32 bg-background border border-border  px-4 py-2 text-foreground text-sm focus:border-[#F2C94C] focus:outline-none" />
                      <input type="password" value={newKey.api_key} onChange={e => setNewKey(k => ({ ...k, api_key: e.target.value }))}
                        placeholder="sk-..."
                        className="flex-1 min-w-0 bg-background border border-border  px-4 py-2 text-foreground text-sm focus:border-[#F2C94C] focus:outline-none" />
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
                        <div key={model.id} className="flex items-center justify-between bg-card  px-3 py-2">
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
                        <div key={key.id} className="flex items-center justify-between bg-card  px-3 py-2">
                          <div>
                            <span className="text-sm text-foreground">{key.key_name}</span>
                            <span className={cn("text-xs ml-2 px-1.5 py-0.5 ",
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
              );
            })}

            {customProviders.length === 0 && !showAddProvider && (
              <div className="text-center py-12">
                <Puzzle className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground">No custom providers yet</p>
                <p className="text-sm text-muted-foreground/50">Add OpenRouter, Together, Groq, or any OpenAI-compatible API</p>
              </div>
            )}
          </div>
        )}

        {/* Routing Tab */}
        {activeTab === 'routing' && (
          <div className="space-y-6">
            {/* Routing Overview -- primary + fallback */}
            <div className="glass-card border-border p-6">
              <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#F2C94C]" />
                Current Routing Configuration
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Primary Model */}
                <div className="bg-card border border-emerald-500/30 rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Primary</span>
                  </div>
                  {(() => {
                    const pm = models.find(m => m.is_primary);
                    return pm ? (
                      <>
                        <p className="text-xl font-black text-foreground mb-1">{pm.display_name || pm.name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-xs">{pm.provider_id}</span>
                          <span>{pm.enabled ? 'Active' : 'Disabled'}</span>
                        </div>
                      </>
                    ) : (
                      <p className="text-amber-400 text-sm">No primary model configured</p>
                    );
                  })()}
                </div>

                {/* Fallback Model */}
                <div className="bg-card border border-amber-500/30 rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Fallback</span>
                  </div>
                  {(() => {
                    const fm = models.find(m => m.is_fallback);
                    return fm ? (
                      <>
                        <p className="text-xl font-black text-foreground mb-1">{fm.display_name || fm.name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded text-xs">{fm.provider_id}</span>
                          <span>{fm.enabled ? 'Active' : 'Disabled'}</span>
                        </div>
                      </>
                    ) : (
                      <p className="text-amber-400 text-sm">No fallback configured</p>
                    );
                  })()}
                </div>
              </div>

              {/* Tier Assignment */}
              <div className="bg-card/50 border border-border rounded-lg p-5">
                <h4 className="font-bold text-foreground mb-4">User Tier Model Assignment</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                    <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">Free Users</p>
                    <p className="text-lg font-bold text-foreground">
                      Primary model only
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      No fallback — if primary fails, free users get an error
                    </p>
                  </div>
                  <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-lg">
                    <p className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">Pro Users</p>
                    <p className="text-lg font-bold text-foreground">
                      Primary + Fallback
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Full fallback chain: tries primary first, then fallback on failure
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* All Models List */}
            <div className="glass-card border-border p-6">
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-[#F2C94C]" />
                All Models
              </h3>
              <div className="space-y-2">
                {models.map(model => {
                  const role = model.is_primary ? 'primary' : model.is_fallback ? 'fallback' : 'secondary';
                  const roleColor = role === 'primary' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' :
                                    role === 'fallback' ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' :
                                    'text-muted-foreground bg-muted/30 border-border';
                  return (
                    <div key={model.id} className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={cn("px-2 py-0.5 rounded text-xs font-medium border", roleColor)}>
                          {role}
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">{model.display_name || model.name}</p>
                          <p className="text-xs text-muted-foreground">{model.provider_id} | Model: {model.name}</p>
                        </div>
                      </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPrimary(model.id)}
                        disabled={saving || model.is_primary}
                        className={cn("h-7 px-2 text-xs", model.is_primary && "opacity-50")}
                      >
                        Set Primary
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFallback(model.id)}
                        disabled={saving || model.is_fallback}
                        className={cn("h-7 px-2 text-xs", model.is_fallback && "opacity-50")}
                      >
                        Set Fallback
                      </Button>
                      <Button
                        variant={model.enabled ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleModel(model.id, !model.enabled)}
                        disabled={saving}
                        className={cn("h-7 px-3 text-xs", model.enabled ? "bg-emerald-600 hover:bg-emerald-700" : "bg-background border-border hover:bg-muted")}
                      >
                        {model.enabled ? 'Enabled' : 'Disabled'}
                      </Button>
                    </div>
                   </div>
                 );
               })}
               {models.length === 0 && (
                 <p className="text-center text-muted-foreground py-8 text-sm">No models configured</p>
               )}
             </div>
           </div>
         </div>
       )}

       {/* Usage Tab */}
        {activeTab === 'usage' && (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Requests', value: totalRequests.toLocaleString(), icon: TrendingUp, color: 'text-[#F2C94C]' },
                { label: 'Success Rate', value: `${successRate}%`, icon: CheckCircle2, color: successRate >= 90 ? 'text-emerald-400' : successRate >= 70 ? 'text-amber-400' : 'text-red-400' },
                { label: 'Avg Latency', value: `${avgLatency}ms`, icon: Clock, color: avgLatency < 500 ? 'text-emerald-400' : avgLatency < 1000 ? 'text-amber-400' : 'text-red-400' },
                { label: 'Failed Requests', value: totalFailed.toLocaleString(), icon: XCircle, color: totalFailed === 0 ? 'text-emerald-400' : 'text-red-400' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="glass-card rounded-lg p-4 border border-border">
                  <div className="flex items-center space-x-2 mb-2">
                    <Icon className={cn("w-4 h-4", color)} />
                    <span className="text-xs text-muted-foreground">{label}</span>
                  </div>
                  <p className={cn("text-xl font-bold", color)}>{value}</p>
                </div>
              ))}
            </div>

            {/* Per-Model Breakdown */}
            <div className="glass-card border-border p-6">
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#F2C94C]" />
                Per-Model Usage (7 days)
              </h3>
              {usageStats.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-3 text-muted-foreground font-medium">Model</th>
                        <th className="text-right py-3 px-3 text-muted-foreground font-medium">Requests</th>
                        <th className="text-right py-3 px-3 text-muted-foreground font-medium">Success</th>
                        <th className="text-right py-3 px-3 text-muted-foreground font-medium">Failed</th>
                        <th className="text-right py-3 px-3 text-muted-foreground font-medium">Avg Latency</th>
                        <th className="text-right py-3 px-3 text-muted-foreground font-medium">Tokens</th>
                        <th className="text-right py-3 px-3 text-muted-foreground font-medium">Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usageStats.map(s => {
                        const lat = s.total_requests > 0 ? Math.round(s.total_latency_ms / s.total_requests) : 0;
                        const sr = s.total_requests > 0 ? Math.round((s.successful_requests / s.total_requests) * 100) : 0;
                        return (
                          <tr key={`${s.provider_id}-${s.model_id}`} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                            <td className="py-3 px-3 text-foreground font-medium">{s.model_id || s.provider_id}</td>
                            <td className="py-3 px-3 text-right text-foreground">{s.total_requests.toLocaleString()}</td>
                            <td className="py-3 px-3 text-right text-emerald-400">{s.successful_requests.toLocaleString()}</td>
                            <td className="py-3 px-3 text-right text-red-400">{s.failed_requests.toLocaleString()}</td>
                            <td className="py-3 px-3 text-right text-muted-foreground">{lat}ms</td>
                            <td className="py-3 px-3 text-right text-muted-foreground">{(s.total_tokens_in + s.total_tokens_out).toLocaleString()}</td>
                            <td className="py-3 px-3 text-right text-muted-foreground">${s.total_cost_usd?.toFixed(4) || '0.0000'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">No usage data in the last 7 days</p>
                  <p className="text-sm text-muted-foreground/50 mt-1">Usage statistics will appear after users interact with Herr Deutsch</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Secrets Tab */}
        {activeTab === 'secrets' && (
          <div className="glass-card  border border-border p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10  bg-amber-500/10 flex items-center justify-center">
                <Key className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Secrets Management</h3>
                <p className="text-sm text-muted-foreground">Manage API keys and credentials for AI providers</p>
              </div>
            </div>
            <div className="glass-card  p-4 border border-border">
              <SecretList />
            </div>
          </div>
        )}

        {/* Webhooks Tab */}
        {activeTab === 'webhooks' && (
          <div className="space-y-6">
            {/* Webhook Status */}
            <div className="glass-card border border-border p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-blue-500/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Discord Webhook</h3>
                  <p className="text-sm text-muted-foreground">Admin notifications via Discord</p>
                </div>
              </div>

              {/* Status indicator */}
              <div className={`flex items-center gap-3 px-4 py-3 border rounded-lg mb-6 ${
                systemHealth.config?.webhookConfigured
                  ? 'bg-emerald-500/5 border-emerald-500/20'
                  : 'bg-rose-500/5 border-rose-500/20'
              }`}>
                {systemHealth.config?.webhookConfigured
                  ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  : <XCircle className="w-4 h-4 text-rose-500" />}
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-medium text-foreground">DISCORD_WEBHOOK_URL</span>
                  <p className="text-xs text-muted-foreground">
                    {systemHealth.config?.webhookConfigured
                      ? 'Configured — notifications will be sent to Discord'
                      : 'Not configured — set DISCORD_WEBHOOK_URL env var'}
                  </p>
                </div>
                <span className={`ml-auto text-xs font-bold ${
                  systemHealth.config?.webhookConfigured ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {systemHealth.config?.webhookConfigured ? 'ON' : 'OFF'}
                </span>
              </div>

              {/* Test button */}
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={testWebhook}
                  disabled={webhookTesting || !systemHealth.config?.webhookConfigured}
                  className=""
                >
                  {webhookTesting
                    ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    : <Send className="w-4 h-4 mr-2" />}
                  {webhookTesting ? 'Sending...' : 'Send Test Notification'}
                </Button>
                {webhookResult && (
                  <div className={`flex items-center gap-2 text-sm ${
                    webhookResult.ok ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {webhookResult.ok
                      ? <CheckCircle2 className="w-4 h-4" />
                      : <XCircle className="w-4 h-4" />}
                    {webhookResult.message}
                  </div>
                )}
              </div>
            </div>

            {/* Trigger Info */}
            <div className="glass-card border border-border p-6">
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#F2C94C]" />
                Notification Triggers
              </h3>
              <div className="space-y-3">
                {[
                  { event: 'Payment Success', desc: 'When a user completes a QRIS payment', status: 'active' },
                  { event: 'AI Provider Down', desc: 'When a provider health check fails', status: 'active' },
                  { event: 'Payment Failure', desc: 'When a payment webhook reports failure', status: 'active' },
                ].map(({ event, desc, status }) => (
                  <div key={event} className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
                    <div>
                      <p className="font-medium text-foreground text-sm">{event}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                      status === 'active'
                        ? 'text-emerald-400 bg-emerald-500/10'
                        : 'text-muted-foreground bg-muted/30'
                    }`}>
                      {status === 'active' ? 'ACTIVE' : 'DRAFT'}
                    </span>
                  </div>
                ))}
              </div>
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
