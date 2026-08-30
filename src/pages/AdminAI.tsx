import { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router';

import { Button } from '../components/ui/button';
import {
  AdminFeedbackStack,
  AdminNotice,
  BTN_QUIET,
  ConfirmDialog,
  FIELD_LABEL,
  INPUT,
  PANEL,
  SectionHeading,
  StatusChip,
  TAP,
  TAP_ICON,
  TONE,
  networkMessage,
  readError,
  useAdminFeedback,
  useConfirm,
  type Tone,
} from '../components/admin/AdminUI';
import {
  Loader2, RefreshCw, CheckCircle2, XCircle, AlertTriangle,
  Server, Cpu, Activity, Zap, BarChart3, Key,
  Shield, TrendingUp, Clock, AlertCircle, EyeOff, Eye,
  Puzzle, Plus, Trash2, TestTube, Globe,
  Bell, Send, Scan
} from 'lucide-react';
import { cn } from '../lib/utils';

/* ============================================================================
   AI control room — LIGHT-NATIVE.
   ---------------------------------------------------------------------------
   This page was authored for a dark theme that never ships: useTheme() is
   imported nowhere, `.dark` never lands on <html>, so every dark-mode colour
   (emerald-400, amber-400, blue-300 …) was landing on a WHITE card. Measured
   with the WCAG 2.1 relative-luminance formula, the old palette read:

     text-emerald-400 #00d492 on white  1.94:1   ->  TONE.ok   #1a6b3d  6.53:1
     text-amber-400   #ffb900 on white  1.72:1   ->  TONE.warn #7a5200  6.92:1
     text-red-400     #ff6467 on white  2.89:1   ->  TONE.bad  #8b2500  8.89:1
     text-blue-300    #8ec5ff on white  1.81:1   ->  TONE.info #1e40af  8.72:1
     text-[#F2C94C]   #f2c94c on white  1.59:1   ->  brand-rust #8b2500 8.89:1

   Colour never carries a state on its own here: every status also ships an
   icon and a written Indonesian label, so the page still reads correctly in
   greyscale or with a colour-vision deficiency.
   ========================================================================= */

type RuntimeStatus = 'ACTIVE' | 'MISSING_KEY' | 'INVALID_KEY' | 'UNREACHABLE' | 'RATE_LIMITED' | 'DISABLED';

/* Runtime status, said in Indonesian and coloured for a light surface.
   Every entry pairs a tone with an icon and a word, so the state never rests
   on colour alone. */
const STATUS_LABEL: Record<RuntimeStatus, string> = {
  ACTIVE: 'Aktif',
  MISSING_KEY: 'Kunci kosong',
  INVALID_KEY: 'Kunci ditolak',
  UNREACHABLE: 'Tak terjangkau',
  RATE_LIMITED: 'Kena batas',
  DISABLED: 'Dimatikan',
};

const STATUS_HINT: Partial<Record<RuntimeStatus, string>> = {
  MISSING_KEY: 'Tempel kunci API provider ini, lalu simpan.',
  INVALID_KEY: 'Provider menolak kunci yang tersimpan. Ganti dengan kunci baru.',
  UNREACHABLE: 'Alamat provider tidak menjawab. Cek URL-nya atau coba lagi nanti.',
  RATE_LIMITED: 'Kuota provider sedang penuh. Tunggu beberapa saat.',
  DISABLED: 'Provider ini sengaja dimatikan.',
};

const STATUS_TONE: Record<RuntimeStatus, Tone> = {
  ACTIVE: 'ok',
  MISSING_KEY: 'warn',
  RATE_LIMITED: 'warn',
  INVALID_KEY: 'bad',
  UNREACHABLE: 'bad',
  DISABLED: 'idle',
};

const STATUS_ICON: Record<RuntimeStatus, typeof CheckCircle2> = {
  ACTIVE: CheckCircle2,
  MISSING_KEY: AlertTriangle,
  RATE_LIMITED: AlertCircle,
  INVALID_KEY: XCircle,
  UNREACHABLE: XCircle,
  DISABLED: EyeOff,
};

function toneOf(status: RuntimeStatus): Tone {
  return STATUS_TONE[status] ?? 'idle';
}

/* TAP / TAP_ICON / INPUT / FIELD_LABEL live in AdminUI so this page and the
   secret cards under components/admin stay the same size and shape. */

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

async function jsonHeaders(): Promise<Record<string, string>> {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${await getToken()}`,
  };
}

/**
 * Some endpoints answer 200 with `{ ok: false, error: '<raw upstream blob>' }`,
 * so `readError` (which only inspects failed responses) never sees them. The
 * provider's raw body is a stack fragment or a JSON dump — useless to the
 * person holding the phone — so anything that reads as machine output is
 * swapped for a plain instruction.
 */
function humanize(raw: unknown, fallback: string): string {
  const text = typeof raw === 'string' ? raw.trim() : '';
  if (!text) return fallback;
  const looksTechnical =
    text.length > 160 ||
    /^[A-Z0-9_]{3,}$/.test(text) ||
    /error:|Error:|undefined|\bnull\b|\bat\s.+:\d+|[{}<>]/.test(text);
  return looksTechnical ? fallback : text;
}

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

type TabId = 'health' | 'providers' | 'custom' | 'routing' | 'usage' | 'webhooks';

export default function AdminAI() {
  const { profileData, profileLoaded } = useAuthStore();
  const navigate = useNavigate();
  const isAdmin = profileData?.role === 'admin';

  const [providers, setProviders] = useState<Provider[]>([]);
  const [healthData, setHealthData] = useState<HealthCheckResult[]>([]);
  const [validating, setValidating] = useState<string | null>(null);
  const [models, setModels] = useState<Model[]>([]);
  const [usageStats, setUsageStats] = useState<UsageStats[]>([]);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('health');

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
  const [detectionMessages, setDetectionMessages] = useState<Record<string, { ok: boolean; message: string }>>({});
  const [detectingModels, setDetectingModels] = useState<string | null>(null);
  const [importingModels, setImportingModels] = useState<string | null>(null);
  const [selectedDetected, setSelectedDetected] = useState<Record<string, string[]>>({});
  const [webhookTesting, setWebhookTesting] = useState(false);
  const [webhookResult, setWebhookResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [newProvider, setNewProvider] = useState({ id: '', name: '', base_url: '', auth_type: 'bearer', api_format: 'openai', chat_endpoint: '/chat/completions', priority: 50 });
  const [newModel, setNewModel] = useState({ id: '', model_id: '', display_name: '' });
  const [newKey, setNewKey] = useState({ key_name: 'default', api_key: '' });
  const [loadError, setLoadError] = useState<string | null>(null);

  const feedback = useAdminFeedback();
  const confirm = useConfirm();
  const { notify } = feedback;

  // Only judge the role after the profile fetch settles — on a deep link or a
  // hard refresh profileData is still {} on the first render, which used to
  // bounce legitimate admins back to '/'.
  useEffect(() => {
    if (!profileLoaded) return;
    if (!isAdmin) navigate('/', { replace: true });
  }, [profileLoaded, isAdmin, navigate]);

  useEffect(() => {
    if (!profileLoaded || !isAdmin) return;
    fetchData();
  }, [profileLoaded, isAdmin]);

  /**
   * `announce` and `silent` are opt-in and must never be wired straight to
   * onClick — a React event object would arrive as the argument and read as
   * truthy. `silent` keeps the already-rendered page in place instead of
   * swapping the whole screen back to the loading spinner.
   */
  const fetchData = async (opts?: { announce?: boolean; silent?: boolean }) => {
    const announce = opts?.announce === true;
    const silent = opts?.silent === true;
    if (silent) setRefreshing(true);
    else setLoading(true);
    // Each request is judged on its own; a single failure no longer leaves
    // stale values on screen pretending to be current.
    const problems: string[] = [];
    try {
      const token = await getToken();
      const authHeaders = { 'Authorization': `Bearer ${token}` };
      const [providersRes, modelsRes, statsRes, healthRes, customRes, sysHealthRes, secretsRes] = await Promise.all([
        fetch('/api/admin-ai?action=providers', { headers: authHeaders }),
        fetch('/api/admin-ai?action=models', { headers: authHeaders }),
        fetch('/api/admin-ai?action=usage-stats&days=7', { headers: authHeaders }),
        fetch('/api/admin-ai?action=health-check', { headers: authHeaders }),
        fetch('/api/custom-provider?action=full-config', { headers: authHeaders }),
        fetch('/api/admin?action=system-health', { headers: authHeaders }),
        fetch('/api/admin-ai?action=secrets', { headers: authHeaders })
      ]);

      if (providersRes.ok) setProviders(await providersRes.json());
      else problems.push(await readError(providersRes, 'Daftar provider gagal dimuat.'));

      if (modelsRes.ok) setModels(await modelsRes.json());
      else problems.push(await readError(modelsRes, 'Daftar model gagal dimuat.'));

      if (statsRes.ok) setUsageStats(await statsRes.json());
      else problems.push(await readError(statsRes, 'Statistik pemakaian gagal dimuat.'));

      if (healthRes.ok) {
        const health = await healthRes.json();
        setHealthData(health.providers || []);
      } else {
        problems.push(await readError(healthRes, 'Pemeriksaan provider gagal dijalankan.'));
      }

      if (customRes.ok) {
        const custom = await customRes.json();
        setCustomProviders(custom.providers || []);
        setCustomModels(custom.models || []);
        setCustomKeys(custom.keys || []);

        // Legacy custom providers/models may be mirrored to runtime routing during full-config.
        // Refresh routing lists once so the UI reflects that sync immediately.
        if (custom.routing_sync?.synced > 0) {
          const [freshProvidersRes, freshModelsRes] = await Promise.all([
            fetch('/api/admin-ai?action=providers', { headers: authHeaders }),
            fetch('/api/admin-ai?action=models', { headers: authHeaders })
          ]);
          if (freshProvidersRes.ok) setProviders(await freshProvidersRes.json());
          if (freshModelsRes.ok) setModels(await freshModelsRes.json());
        }
      } else {
        problems.push(await readError(customRes, 'Provider tambahan gagal dimuat.'));
      }

      if (sysHealthRes.ok) setSystemHealth(await sysHealthRes.json());
      else problems.push(await readError(sysHealthRes, 'Status layanan gagal dimuat.'));

      if (secretsRes.ok) {
        const secretsData = await secretsRes.json();
        setSecrets(secretsData);
        // Pre-populate providerKeys with masked values
        const keysMap: Record<string, string> = {};
        for (const s of secretsData) {
          keysMap[s.provider_id] = '••••••••'; // masked
        }
        setProviderKeys(prev => ({ ...keysMap, ...prev }));
      } else {
        problems.push(await readError(secretsRes, 'Daftar kunci tersimpan gagal dimuat.'));
      }

      if (problems.length > 0) {
        setLoadError(problems.join(' '));
        if (announce) notify('bad', 'Sebagian data gagal dimuat', problems.join(' '));
      } else {
        setLoadError(null);
        if (announce) notify('ok', 'Data diperbarui');
      }
    } catch (e) {
      console.error('Fetch AI data failed:', e);
      setLoadError(networkMessage());
      if (announce) notify('bad', 'Gagal memuat ulang', networkMessage());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /** Quiet reload used as the tail of an action that already reported itself. */
  const reload = () => fetchData({ silent: true });

  const toggleProvider = async (id: string, enabled: boolean) => {
    const label = providers.find(p => p.id === id)?.name || id;
    setSaving(true);
    try {
      // The response used to be discarded, so a rejected toggle still flipped
      // the switch on screen. Now the local state only moves after the server
      // confirms it.
      const res = await fetch('/api/admin-ai?action=provider-toggle', {
        method: 'POST',
        headers: await jsonHeaders(),
        body: JSON.stringify({ id, enabled })
      });
      if (!res.ok) {
        notify('bad', `${label} tidak berubah`, await readError(res, 'Server menolak perubahan ini.'));
        return;
      }
      setProviders(providers.map(p =>
        p.id === id ? { ...p, enabled, status: enabled ? 'active' as const : 'disabled' as const } : p
      ));
      notify('ok', enabled ? `${label} dinyalakan` : `${label} dimatikan`);
    } catch (e) {
      console.error('Toggle provider failed:', e);
      notify('bad', `${label} tidak berubah`, networkMessage());
    } finally {
      setSaving(false);
    }
  };

  const saveKey = async (providerId: string) => {
    const key = providerKeys[providerId];
    if (!key || key === '••••••••') return;
    const label = providers.find(p => p.id === providerId)?.name || providerId;
    setSavingKey(providerId);
    try {
      const res = await fetch('/api/admin-ai?action=secret-add', {
        method: 'POST',
        headers: await jsonHeaders(),
        body: JSON.stringify({
          provider_id: providerId,
          secret_key: 'api_key',
          secret_value: key
        })
      });
      if (!res.ok) {
        notify('bad', 'Kunci belum tersimpan', await readError(res, 'Server menolak kunci ini.'));
        return;
      }
      notify('ok', `Kunci ${label} tersimpan`, 'Sedang dicoba ke provider untuk memastikan kunci berfungsi.');
      // Auto-validate after saving
      await validateProvider(providerId, { quiet: true });
      // Refresh secrets list
      const secretsRes = await fetch('/api/admin-ai?action=secrets', {
        headers: { 'Authorization': `Bearer ${await getToken()}` }
      });
      if (secretsRes.ok) setSecrets(await secretsRes.json());
      // Clear the input
      setProviderKeys(prev => ({ ...prev, [providerId]: '••••••••' }));
    } catch (e) {
      console.error('Save key failed:', e);
      notify('bad', 'Kunci belum tersimpan', networkMessage());
    } finally {
      setSavingKey(null);
    }
  };

  const detectModels = async (providerId: string) => {
    const key = providerKeys[providerId] || '';
    const keyToUse = key && key !== '••••••••' ? key : null;
    setDetectingModels(providerId);
    try {
      const res = await fetch('/api/admin-ai?action=detect-models', {
        method: 'POST',
        headers: await jsonHeaders(),
        body: JSON.stringify({ provider_id: providerId, ...(keyToUse ? { api_key: keyToUse } : {}) })
      });
      if (res.ok) {
        const data = await res.json();
        const found = data.models || [];
        setDetectedModels(prev => ({ ...prev, [providerId]: found }));
        // Auto-select all detected models
        setSelectedDetected(prev => ({
          ...prev,
          [providerId]: found.map((m: any) => m.model_id)
        }));
        notify(
          found.length > 0 ? 'ok' : 'warn',
          found.length > 0 ? `Ketemu ${found.length} model` : 'Tidak ada model yang bisa dipakai',
          found.length > 0
            ? 'Centang model yang mau dipakai, lalu tekan Tambahkan.'
            : 'Provider menjawab, tapi tidak mengembalikan satu model pun.'
        );
      } else {
        notify('bad', 'Gagal mengambil daftar model', await readError(res, 'Provider tidak memberi daftar model.'));
      }
    } catch (e) {
      console.error('Model detection error:', e);
      notify('bad', 'Gagal mengambil daftar model', networkMessage());
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
      // `imported` used to be counted and then thrown away, so a run where
      // every single model was rejected looked exactly like a clean success.
      let imported = 0;
      let firstProblem = '';
      for (const modelId of selected) {
        const modelInfo = detected.find((m: any) => m.model_id === modelId);
        if (!modelInfo) continue;
        const res = await fetch('/api/admin-ai?action=model-add', {
          method: 'POST',
          headers: await jsonHeaders(),
          body: JSON.stringify({
            provider_id: providerId,
            model_name: modelInfo.model_id,
            display_name: modelInfo.display_name || modelInfo.model_id,
            enabled: true,
          })
        });
        if (res.ok) imported++;
        else if (!firstProblem) firstProblem = await readError(res, 'Sebagian model ditolak server.');
      }
      // Refresh models
      await reload();
      // Clear detected after import
      setDetectedModels(prev => ({ ...prev, [providerId]: [] }));
      setSelectedDetected(prev => ({ ...prev, [providerId]: [] }));

      const failed = selected.length - imported;
      if (imported === 0) {
        notify('bad', 'Tidak ada model yang tersimpan', firstProblem || 'Semua model ditolak server.');
      } else if (failed > 0) {
        notify('warn', `${imported} model tersimpan, ${failed} gagal`, firstProblem);
      } else {
        notify('ok', `${imported} model ditambahkan`, 'Model baru sudah bisa dipilih di tab Perutean.');
      }
    } catch (e) {
      console.error('Import models error:', e);
      notify('bad', 'Penambahan model terhenti', networkMessage());
    } finally {
      setImportingModels(null);
    }
  };

  const detectCustomModels = async (providerId: string) => {
    const key = providerKeys[providerId] || '';
    const keyToUse = key && key !== '••••••••' ? key : null;
    setDetectingModels(providerId);
    setDetectionMessages(prev => ({ ...prev, [providerId]: { ok: true, message: 'Sedang mengambil daftar model dari provider…' } }));
    try {
      const res = await fetch('/api/custom-provider?action=detect-models', {
        method: 'POST',
        headers: await jsonHeaders(),
        body: JSON.stringify({ provider_id: providerId, ...(keyToUse ? { api_key: keyToUse } : {}) })
      });
      if (!res.ok) {
        // Handled inline rather than thrown: a rejected request and a dropped
        // connection need different sentences, and once both arrive at the
        // same `catch` there is no way to tell them apart.
        const message = await readError(res, 'Provider tidak memberi daftar model.');
        setDetectedModels(prev => ({ ...prev, [providerId]: [] }));
        setSelectedDetected(prev => ({ ...prev, [providerId]: [] }));
        setDetectionMessages(prev => ({ ...prev, [providerId]: { ok: false, message } }));
        notify('bad', 'Gagal mengambil daftar model', message);
        return;
      }
      const data = await res.json().catch(() => ({}));

      const foundModels = data.models || [];
      setDetectedModels(prev => ({ ...prev, [providerId]: foundModels }));
      setSelectedDetected(prev => ({
        ...prev,
        // Custom catalogs can be huge (OpenRouter returns 300+ models), so do not preselect all.
        [providerId]: []
      }));
      const message = foundModels.length > 0
        ? `Ada ${foundModels.length} model yang bisa diakses. Centang yang mau dipakai.`
        : 'Provider menjawab, tapi tidak mengembalikan satu model pun.';
      setDetectionMessages(prev => ({
        ...prev,
        [providerId]: { ok: foundModels.length > 0, message }
      }));
      notify(foundModels.length > 0 ? 'ok' : 'warn', 'Daftar model diterima', message);
    } catch (e) {
      console.error('Custom model discovery error:', e);
      setDetectedModels(prev => ({ ...prev, [providerId]: [] }));
      setSelectedDetected(prev => ({ ...prev, [providerId]: [] }));
      const message = networkMessage();
      setDetectionMessages(prev => ({ ...prev, [providerId]: { ok: false, message } }));
      notify('bad', 'Gagal mengambil daftar model', message);
    } finally {
      setDetectingModels(null);
    }
  };

  const importCustomDetectedModels = async (providerId: string) => {
    const selected = selectedDetected[providerId] || [];
    const detected = detectedModels[providerId] || [];
    if (selected.length === 0) return;
    setImportingModels(providerId);
    setDetectionMessages(prev => ({ ...prev, [providerId]: { ok: true, message: `Menambahkan ${selected.length} model…` } }));
    try {
      const modelsToImport = detected.filter((m: any) => selected.includes(m.model_id));
      const res = await fetch('/api/custom-provider?action=import-models', {
        method: 'POST',
        headers: await jsonHeaders(),
        body: JSON.stringify({ provider_id: providerId, models: modelsToImport })
      });
      if (!res.ok) {
        const message = await readError(res, 'Model gagal ditambahkan.');
        setDetectionMessages(prev => ({ ...prev, [providerId]: { ok: false, message } }));
        notify('bad', 'Model gagal ditambahkan', message);
        return;
      }
      const data = await res.json().catch(() => ({}));
      await reload();
      setDetectedModels(prev => ({ ...prev, [providerId]: [] }));
      setSelectedDetected(prev => ({ ...prev, [providerId]: [] }));
      const message = `${data.count || modelsToImport.length} model masuk ke daftar dan siap dipakai di perutean.`;
      setDetectionMessages(prev => ({ ...prev, [providerId]: { ok: true, message } }));
      notify('ok', 'Model ditambahkan', message);
    } catch (e) {
      console.error('Import custom models error:', e);
      const message = networkMessage();
      setDetectionMessages(prev => ({ ...prev, [providerId]: { ok: false, message } }));
      notify('bad', 'Model gagal ditambahkan', message);
    } finally {
      setImportingModels(null);
    }
  };

  const deleteKey = async (providerId: string) => {
    const secret = secrets.find(s => s.provider_id === providerId);
    if (!secret) return;
    const label = providers.find(p => p.id === providerId)?.name || providerId;
    setSavingKey(providerId);
    try {
      const res = await fetch('/api/admin-ai?action=secret-delete', {
        method: 'POST',
        headers: await jsonHeaders(),
        body: JSON.stringify({ id: secret.id })
      });
      if (!res.ok) {
        // The key used to disappear from the screen while still living in the
        // database, which is the worst possible lie for a credentials panel.
        notify('bad', 'Kunci masih tersimpan', await readError(res, 'Server menolak penghapusan.'));
        return;
      }
      setProviderKeys(prev => ({ ...prev, [providerId]: '' }));
      setSecrets(prev => prev.filter(s => s.provider_id !== providerId));
      notify('ok', `Kunci ${label} dihapus`, 'Provider ini tidak akan dipakai sampai ada kunci baru.');
      // Re-validate
      await validateProvider(providerId, { quiet: true });
    } catch (e) {
      console.error('Delete key failed:', e);
      notify('bad', 'Kunci masih tersimpan', networkMessage());
    } finally {
      setSavingKey(null);
    }
  };

  const requestDeleteKey = (providerId: string) => {
    const label = providers.find(p => p.id === providerId)?.name || providerId;
    confirm.ask({
      title: 'Hapus kunci API?',
      body: 'Setelah dihapus, provider ini berhenti melayani permintaan AI sampai kamu memasang kunci baru.',
      target: label,
      confirmLabel: 'Ya, hapus kunci',
      onConfirm: () => deleteKey(providerId),
    });
  };

  const toggleModel = async (id: string, enabled: boolean) => {
    const label = models.find(m => m.id === id)?.display_name || id;
    setSaving(true);
    try {
      const res = await fetch('/api/admin-ai?action=model-toggle', {
        method: 'POST',
        headers: await jsonHeaders(),
        body: JSON.stringify({ id, enabled })
      });
      if (!res.ok) {
        notify('bad', `${label} tidak berubah`, await readError(res, 'Server menolak perubahan ini.'));
        return;
      }
      setModels(models.map(m =>
        m.id === id ? { ...m, enabled } : m
      ));
      notify('ok', enabled ? `${label} diaktifkan` : `${label} dinonaktifkan`);
    } catch (e) {
      console.error('Toggle model failed:', e);
      notify('bad', `${label} tidak berubah`, networkMessage());
    } finally {
      setSaving(false);
    }
  };

  const setPrimary = async (id: string) => {
    const label = models.find(m => m.id === id)?.display_name || id;
    setSaving(true);
    try {
      const res = await fetch('/api/admin-ai?action=model-set-primary', {
        method: 'POST',
        headers: await jsonHeaders(),
        body: JSON.stringify({ id })
      });
      if (!res.ok) {
        notify('bad', 'Model utama tidak berubah', await readError(res, 'Server menolak perubahan ini.'));
        return;
      }
      setModels(models.map(m => ({
        ...m,
        is_primary: m.id === id,
        is_fallback: m.id === id ? false : m.is_fallback,
        enabled: m.id === id ? true : m.enabled
      })));
      notify('ok', `${label} jadi model utama`, 'Semua permintaan AI dicoba ke model ini lebih dulu.');
    } catch (e) {
      console.error('Set primary failed:', e);
      notify('bad', 'Model utama tidak berubah', networkMessage());
    } finally {
      setSaving(false);
    }
  };

  const setFallback = async (id: string) => {
    const label = models.find(m => m.id === id)?.display_name || id;
    setSaving(true);
    try {
      const res = await fetch('/api/admin-ai?action=model-set-fallback', {
        method: 'POST',
        headers: await jsonHeaders(),
        body: JSON.stringify({ id })
      });
      if (!res.ok) {
        notify('bad', 'Model cadangan tidak berubah', await readError(res, 'Server menolak perubahan ini.'));
        return;
      }
      setModels(models.map(m => ({
        ...m,
        is_fallback: m.id === id,
        enabled: m.id === id ? true : m.enabled
      })));
      notify('ok', `${label} jadi model cadangan`, 'Dipakai kalau model utama gagal menjawab.');
    } catch (e) {
      console.error('Set fallback failed:', e);
      notify('bad', 'Model cadangan tidak berubah', networkMessage());
    } finally {
      setSaving(false);
    }
  };

  /**
   * `quiet` suppresses only the SUCCESS toast, for runs that trail another
   * action (save key, delete key) which already reported its own result. A bad
   * verdict is always announced — that is the whole reason to re-check.
   */
  const validateProvider = async (providerId: string, opts?: { quiet?: boolean }) => {
    const quiet = opts?.quiet === true;
    const label = providers.find(p => p.id === providerId)?.name || providerId;
    setValidating(providerId);
    try {
      const res = await fetch('/api/admin-ai?action=validate-provider', {
        method: 'POST',
        headers: await jsonHeaders(),
        body: JSON.stringify({ provider_id: providerId })
      });
      if (!res.ok) {
        notify('bad', `${label} gagal diperiksa`, await readError(res, 'Pemeriksaan tidak bisa dijalankan.'));
        return;
      }
      const result = await res.json().catch(() => null);
      if (!result || typeof result.runtime_status !== 'string') {
        // A 200 with an unreadable body is not a pass — say so instead of
        // leaving the old verdict on screen.
        notify('warn', `${label} belum bisa dipastikan`, 'Server menjawab, tapi hasil pemeriksaannya tidak terbaca.');
        return;
      }
      setHealthData(prev => {
        const existing = prev.findIndex(h => h.provider === providerId);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = { ...updated[existing], ...result };
          return updated;
        }
        return [...prev, result];
      });
      // A 200 only means the check ran; the verdict is inside the payload.
      const verdict: RuntimeStatus = result.runtime_status;
      if (verdict === 'ACTIVE') {
        if (!quiet) {
          notify('ok', `${label} siap dipakai`, result.latency_ms != null ? `Balasan dalam ${result.latency_ms} ms.` : undefined);
        }
      } else {
        notify(
          verdict === 'RATE_LIMITED' || verdict === 'MISSING_KEY' ? 'warn' : 'bad',
          `${label}: ${STATUS_LABEL[verdict] || 'status tidak dikenal'}`,
          STATUS_HINT[verdict] || humanize(result.error_message, 'Provider tidak menerima permintaan uji.')
        );
      }
    } catch (e) {
      console.error('Validate failed:', e);
      notify('bad', `${label} gagal diperiksa`, networkMessage());
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
      const res = await fetch('/api/webhook-notify', {
        method: 'POST',
        headers: await jsonHeaders(),
        body: JSON.stringify({ test: true }),
      });
      // A non-JSON body (proxy error page, empty 502) used to throw here and
      // surface as a raw exception string.
      if (!res.ok) {
        const message = await readError(res, 'Notifikasi percobaan tidak terkirim.');
        setWebhookResult({ ok: false, message });
        notify('bad', 'Notifikasi tidak terkirim', message);
        return;
      }
      const data = await res.json().catch(() => ({} as any));
      if (data.success) {
        setWebhookResult({ ok: true, message: 'Notifikasi percobaan terkirim ke Discord.' });
        notify('ok', 'Notifikasi terkirim', 'Cek kanal Discord kamu sekarang.');
      } else {
        // 200 + `success: false` is still a failure; it used to be reported as
        // whatever raw string the endpoint happened to return.
        const message = humanize(data.error, 'Discord tidak menerima notifikasi percobaan.');
        setWebhookResult({ ok: false, message });
        notify('bad', 'Notifikasi tidak terkirim', message);
      }
    } catch (e) {
      console.error('Webhook test failed:', e);
      const message = networkMessage();
      setWebhookResult({ ok: false, message });
      notify('bad', 'Notifikasi tidak terkirim', message);
    } finally {
      setWebhookTesting(false);
    }
  };

  const statusCounts = useMemo(() => {
    // INVALID_KEY used to be missing from this list, so a provider whose key
    // the server had rejected was counted in no cell at all — the summary
    // under-reported exactly the failure the owner most needs to see.
    const counts: Record<string, number> = {
      ACTIVE: 0,
      MISSING_KEY: 0,
      INVALID_KEY: 0,
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
  const totalFailed = useMemo(() => usageStats.reduce((sum, s) => sum + s.failed_requests, 0), [usageStats]);
  const selectableModels = useMemo(
    () => [...models].sort((a, b) => {
      if (a.provider_id !== b.provider_id) return a.provider_id.localeCompare(b.provider_id);
      return (a.display_name || a.name || a.id).localeCompare(b.display_name || b.name || b.id);
    }),
    [models]
  );
  const modelRoutingById = useMemo(() => new Map(models.map(model => [model.id, model])), [models]);
  const primaryModel = useMemo(() => models.find(m => m.is_primary), [models]);
  const fallbackModel = useMemo(() => models.find(m => m.is_fallback && m.id !== primaryModel?.id), [models, primaryModel?.id]);
  const modelOptionLabel = (model: Model) => {
    const label = model.display_name || model.name || model.id;
    const state = model.enabled ? 'aktif' : 'nonaktif, otomatis menyala saat dipilih';
    return `${label} (${model.provider_id}, ${state})`;
  };

  // ── Custom provider CRUD ────────────────────────────────────────────────
  // Every one of these used to fire-and-forget: the response was never read,
  // the form closed either way, and a rejected write looked exactly like a
  // saved one.
  const createCustomProvider = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/custom-provider?action=create-provider', {
        method: 'POST',
        headers: await jsonHeaders(),
        body: JSON.stringify(newProvider)
      });
      if (!res.ok) {
        notify('bad', 'Provider belum tersimpan', await readError(res, 'Server menolak konfigurasi ini.'));
        return;
      }
      const label = newProvider.name;
      setShowAddProvider(false);
      setNewProvider({ id: '', name: '', base_url: '', auth_type: 'bearer', api_format: 'openai', chat_endpoint: '/chat/completions', priority: 50 });
      await reload();
      notify('ok', `Provider ${label} ditambahkan`, 'Simpan kuncinya, lalu tarik daftar modelnya.');
    } catch (e) {
      console.error('Create custom provider failed:', e);
      notify('bad', 'Provider belum tersimpan', networkMessage());
    } finally {
      setSaving(false);
    }
  };

  const deleteCustomProvider = async (id: string) => {
    const label = customProviders.find(p => p.id === id)?.name || id;
    try {
      const res = await fetch('/api/custom-provider?action=delete-provider', {
        method: 'POST',
        headers: await jsonHeaders(),
        body: JSON.stringify({ id })
      });
      if (!res.ok) {
        notify('bad', `${label} masih ada`, await readError(res, 'Server menolak penghapusan.'));
        return;
      }
      await reload();
      notify('ok', `Provider ${label} dihapus`, 'Model dan kunci miliknya ikut terhapus.');
    } catch (e) {
      console.error('Delete custom provider failed:', e);
      notify('bad', `${label} masih ada`, networkMessage());
    }
  };

  // Integration fix: this used to call the global `confirm()`. `const confirm =
  // useConfirm()` now shadows it, so the call threw "confirm is not a function"
  // and the delete never ran. Routed through the same dialog as deleteKey.
  const requestDeleteCustomProvider = (id: string) => {
    const label = customProviders.find(p => p.id === id)?.name || id;
    confirm.ask({
      title: 'Hapus provider ini?',
      body: 'Semua model dan kunci milik provider ini ikut terhapus. Tindakan ini tidak bisa dibatalkan.',
      target: label,
      confirmLabel: 'Ya, hapus provider',
      onConfirm: () => deleteCustomProvider(id),
    });
  };

  const createCustomModel = async (providerId: string) => {
    setSaving(true);
    try {
      const modelId = `${providerId}/${newModel.model_id}`;
      const res = await fetch('/api/custom-provider?action=create-model', {
        method: 'POST',
        headers: await jsonHeaders(),
        body: JSON.stringify({ ...newModel, id: modelId, provider_id: providerId })
      });
      if (!res.ok) {
        notify('bad', 'Model belum tersimpan', await readError(res, 'Server menolak model ini.'));
        return;
      }
      const label = newModel.display_name || newModel.model_id;
      setShowAddModel(null);
      setNewModel({ id: '', model_id: '', display_name: '' });
      await reload();
      notify('ok', `Model ${label} ditambahkan`);
    } catch (e) {
      console.error('Create custom model failed:', e);
      notify('bad', 'Model belum tersimpan', networkMessage());
    } finally {
      setSaving(false);
    }
  };

  const deleteCustomModel = async (id: string, label: string) => {
    try {
      const res = await fetch('/api/custom-provider?action=delete-model', {
        method: 'POST',
        headers: await jsonHeaders(),
        body: JSON.stringify({ id })
      });
      if (!res.ok) {
        notify('bad', `${label} masih ada`, await readError(res, 'Server menolak penghapusan.'));
        return;
      }
      await reload();
      notify('ok', `Model ${label} dihapus`);
    } catch (e) {
      console.error('Delete custom model failed:', e);
      notify('bad', `${label} masih ada`, networkMessage());
    }
  };

  const requestDeleteCustomModel = (id: string, label: string) => {
    confirm.ask({
      title: 'Hapus model ini?',
      body: 'Model ini hilang dari daftar perutean. Kalau dia sedang jadi model utama, permintaan AI akan jatuh ke cadangan.',
      target: label,
      confirmLabel: 'Ya, hapus model',
      onConfirm: () => deleteCustomModel(id, label),
    });
  };

  const createCustomKey = async (providerId: string) => {
    setSaving(true);
    try {
      const res = await fetch('/api/custom-provider?action=add-key', {
        method: 'POST',
        headers: await jsonHeaders(),
        body: JSON.stringify({ ...newKey, provider_id: providerId })
      });
      if (!res.ok) {
        notify('bad', 'Kunci belum tersimpan', await readError(res, 'Server menolak kunci ini.'));
        return;
      }
      const label = newKey.key_name || 'default';
      setShowAddKey(null);
      setNewKey({ key_name: 'default', api_key: '' });
      await reload();
      notify('ok', `Kunci “${label}” tersimpan`);
    } catch (e) {
      console.error('Create custom key failed:', e);
      notify('bad', 'Kunci belum tersimpan', networkMessage());
    } finally {
      setSaving(false);
    }
  };

  /** Inline "simpan kunci" on a custom provider card. This used to read the
   *  value straight out of the DOM with getElementById, ignore the response
   *  entirely, then clear the field — so a rejected key looked saved. */
  const saveCustomKey = async (providerId: string) => {
    const value = (providerKeys[providerId] || '').trim();
    if (!value || value === '••••••••') return;
    const label = customProviders.find(p => p.id === providerId)?.name || providerId;
    setSavingKey(providerId);
    try {
      const res = await fetch('/api/custom-provider?action=add-key', {
        method: 'POST',
        headers: await jsonHeaders(),
        body: JSON.stringify({ provider_id: providerId, key_name: 'default', api_key: value })
      });
      if (!res.ok) {
        notify('bad', 'Kunci belum tersimpan', await readError(res, 'Server menolak kunci ini.'));
        return;
      }
      setProviderKeys(prev => ({ ...prev, [providerId]: '' }));
      await reload();
      notify('ok', `Kunci ${label} tersimpan`, 'Tekan Uji koneksi untuk memastikan kuncinya berfungsi.');
    } catch (e) {
      console.error('Save custom key failed:', e);
      notify('bad', 'Kunci belum tersimpan', networkMessage());
    } finally {
      setSavingKey(null);
    }
  };

  const deleteCustomKey = async (id: string, label: string) => {
    try {
      const res = await fetch('/api/custom-provider?action=delete-key', {
        method: 'POST',
        headers: await jsonHeaders(),
        body: JSON.stringify({ id })
      });
      if (!res.ok) {
        notify('bad', 'Kunci masih tersimpan', await readError(res, 'Server menolak penghapusan.'));
        return;
      }
      await reload();
      notify('ok', `Kunci “${label}” dihapus`);
    } catch (e) {
      console.error('Delete custom key failed:', e);
      notify('bad', 'Kunci masih tersimpan', networkMessage());
    }
  };

  const requestDeleteCustomKey = (id: string, label: string) => {
    confirm.ask({
      title: 'Hapus kunci API?',
      body: 'Provider ini berhenti melayani permintaan AI sampai ada kunci lain yang aktif.',
      target: label,
      confirmLabel: 'Ya, hapus kunci',
      onConfirm: () => deleteCustomKey(id, label),
    });
  };

  const testCustomProvider = async (providerId: string) => {
    const label = customProviders.find(p => p.id === providerId)?.name || providerId;
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/custom-provider?action=test-key', {
        method: 'POST',
        headers: await jsonHeaders(),
        body: JSON.stringify({ provider_id: providerId })
      });
      if (!res.ok) {
        const message = await readError(res, 'Uji koneksi tidak bisa dijalankan.');
        setTestResult({ providerId, ok: false, error: message });
        notify('bad', `${label} gagal diuji`, message);
        return;
      }
      // `res.json()` on an empty or HTML body throws; that used to escape as a
      // raw exception and left the banner showing the previous result.
      const result = await res.json().catch(() => null);
      if (!result) {
        const message = 'Server menjawab, tapi hasilnya tidak terbaca.';
        setTestResult({ providerId, ok: false, error: message });
        notify('warn', `${label} belum bisa dipastikan`, message);
        return;
      }
      // `ok: false` arrives with HTTP 200 from this endpoint, so the verdict
      // lives in the payload — a 200 alone is not a pass.
      const ok = result.ok === true;
      const reason = humanize(result.error, 'Provider menolak permintaan uji.');
      setTestResult({ providerId, ...result, ok, error: ok ? undefined : reason });
      if (ok) {
        notify('ok', `${label} tersambung`, result.latencyMs != null ? `Balasan dalam ${result.latencyMs} ms.` : undefined);
      } else {
        notify('bad', `${label} tidak tersambung`, reason);
      }
    } catch (e) {
      console.error('Test custom provider failed:', e);
      const message = networkMessage();
      setTestResult({ providerId, ok: false, error: message });
      notify('bad', `${label} gagal diuji`, message);
    } finally {
      setTesting(false);
    }
  };

  const tabs: Array<{ id: TabId; label: string; icon: typeof Activity }> = [
    { id: 'health', label: 'Kesehatan', icon: Activity },
    { id: 'providers', label: 'Provider', icon: Server },
    { id: 'custom', label: 'Tambahan', icon: Puzzle },
    { id: 'routing', label: 'Perutean', icon: Zap },
    { id: 'usage', label: 'Pemakaian', icon: BarChart3 },
    { id: 'webhooks', label: 'Notifikasi', icon: Bell },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-7 h-7 animate-spin text-brand-rust" aria-hidden="true" />
        <p className="text-sm text-ink-muted">Memuat ruang mesin AI…</p>
      </div>
    );
  }

  const panelProps = (id: TabId) => ({
    role: 'tabpanel' as const,
    id: `panel-${id}`,
    'aria-labelledby': `tab-${id}`,
  });

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="mb-8">
        <div className="h-px w-16 bg-brand-rust mb-4" aria-hidden="true" />
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-5 h-5 text-brand-rust shrink-0" aria-hidden="true" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-subtle">
                Ruang mesin
              </span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl leading-[1.02] tracking-[-0.02em] text-brand-ink">
              Provider &amp; Model AI
            </h1>
            <p className="text-sm text-ink-muted mt-2 max-w-prose">
              Pantau provider, simpan kunci API, dan tentukan model mana yang dipakai lebih dulu.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchData({ announce: true, silent: true })}
            disabled={refreshing}
            className={`${BTN_QUIET} ${TAP} gap-2 px-4 shrink-0`}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
            {refreshing ? 'Memuat…' : 'Muat ulang'}
          </Button>
        </div>
      </header>

      {loadError && (
        <AdminNotice tone="bad" title="Sebagian data belum tampil" className="mb-6">
          {loadError}{' '}
          <button
            onClick={() => fetchData({ announce: true, silent: true })}
            className="underline font-medium text-[#8b2500]"
          >
            Coba lagi
          </button>
        </AdminNotice>
      )}

      {/* ── Status ringkas ────────────────────────────────────────── */}
      {/* One compact strip instead of three stacked panels: the fleet
          summary, service status, and the health tab's first grid all
          said the same thing in three different shapes. The provider
          cards below carry the detail. */}
      <section className="mb-8" aria-label="Status ringkas">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border border-brand-ink/12 bg-white px-4 py-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-ink-subtle" aria-hidden="true" />
            <span className="text-sm font-medium text-brand-ink">AI</span>
            <span className={cn('text-xs font-semibold px-2 py-1', statusCounts.ACTIVE > 0 ? TONE.ok.surface + ' ' + TONE.ok.text : TONE.bad.surface + ' ' + TONE.bad.text)}>
              {statusCounts.ACTIVE > 0 ? 'Aktif' : 'Mati'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-ink-subtle" aria-hidden="true" />
            <span className="text-sm font-medium text-brand-ink">Kunci</span>
            <span className="text-xs tabular-nums text-ink-muted">
              {statusCounts.MISSING_KEY} kosong · {statusCounts.INVALID_KEY} ditolak
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-ink-subtle" aria-hidden="true" />
            <span className="text-sm font-medium text-brand-ink">Balasan</span>
            <span className="text-xs tabular-nums text-ink-muted">
              {totalRequests.toLocaleString('id-ID')} permintaan
            </span>
          </div>
          {systemHealth?.config && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <ServicePill label="AI" ok={!!systemHealth.config.aiConfigured} />
              <ServicePill label="Bayar" ok={!!systemHealth.config.paymentConfigured} />
              <ServicePill label="DB" ok={!!systemHealth.config.databaseConfigured} />
              <ServicePill label="Notif" ok={!!systemHealth.config.webhookConfigured} />
            </div>
          )}
        </div>
      </section>

      {/* ── Tabs ───────────────────────────────────────────────────── */}
      {/* Full-bleed scroller on a phone: the strip slides, the page does not. */}
      <div className="mb-8 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto">
        <div role="tablist" aria-label="Bagian pengaturan AI" className="flex gap-px bg-brand-ink/12 border border-brand-ink/12 w-max min-w-full">
          {tabs.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                id={`tab-${id}`}
                role="tab"
                type="button"
                aria-selected={active}
                aria-controls={`panel-${id}`}
                onClick={() => setActiveTab(id)}
                className={cn(
                  'flex items-center gap-2 px-4 h-11 text-sm font-medium whitespace-nowrap transition-colors focus-visible:rounded-none!',
                  active
                    ? 'bg-brand-ink text-brand-cream'
                    : 'bg-white text-ink-muted hover:bg-brand-cream hover:text-brand-ink'
                )}
              >
                <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ══ Kesehatan ══════════════════════════════════════════════ */}
      {activeTab === 'health' && (
        <section {...panelProps('health')} className="space-y-4">
          <SectionHeading icon={Activity} hint="Tekan Periksa untuk menguji satu provider langsung ke sumbernya.">
            Armada Provider
          </SectionHeading>

          {providers.length === 0 ? (
            <EmptyState icon={Server} title="Belum ada provider bawaan" hint="Tambahkan lewat tab Tambahan, atau muat ulang halaman ini." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-brand-ink/12 border border-brand-ink/12">
              {providers.map(provider => {
                const health = getProviderHealth(provider.id);
                const status = health?.runtime_status || (provider.enabled ? 'ACTIVE' : 'DISABLED');
                return (
                  <article key={provider.id} className="bg-white p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <h3 className="font-heading text-xl text-brand-ink leading-tight truncate">{provider.name}</h3>
                        <p className="text-xs text-ink-muted mt-0.5">Urutan pakai: {provider.priority}</p>
                      </div>
                      <StatusBadge status={status} />
                    </div>

                    {health?.latency_ms != null && (
                      <p className="flex items-center gap-1.5 text-xs text-ink-muted mb-2">
                        <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        Balasan {health.latency_ms} ms
                      </p>
                    )}
                    {health?.error_message && (
                      /* Quoted verbatim and labelled as such: the raw upstream
                         text is diagnostic, so it is shown as the provider's
                         words rather than as the panel's own sentence. */
                      <div className={cn('text-xs px-2 py-1.5 mb-2', TONE.bad.surface, TONE.bad.text)}>
                        <p className="font-semibold">Pesan dari provider</p>
                        <p className="font-mono break-all mt-0.5">{health.error_message}</p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 mt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => validateProvider(provider.id)}
                        disabled={validating === provider.id}
                        className={`${BTN_QUIET} ${TAP} gap-2 px-4`}
                      >
                        {validating === provider.id
                          ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                          : <RefreshCw className="w-4 h-4" aria-hidden="true" />}
                        Periksa
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleProvider(provider.id, !provider.enabled)}
                        disabled={saving}
                        className={`${BTN_QUIET} ${TAP} px-4`}
                      >
                        {provider.enabled ? 'Matikan' : 'Nyalakan'}
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ══ Provider ══════════════════════════════════════════════ */}
      {activeTab === 'providers' && (
        <section {...panelProps('providers')} className="space-y-4">
          <SectionHeading icon={Key} hint="Tempel kunci, simpan, lalu periksa. Kunci tersimpan langsung dipakai mesin AI.">
            Kunci API Provider
          </SectionHeading>

          {providers.length === 0 && (
            <EmptyState icon={Server} title="Belum ada provider bawaan" hint="Muat ulang halaman, atau tambahkan provider di tab Tambahan." />
          )}

          {providers.map(provider => {
            const health = getProviderHealth(provider.id);
            const status = health?.runtime_status || (provider.enabled ? 'ACTIVE' : 'DISABLED');
            const hasKey = secrets.some(s => s.provider_id === provider.id);
            const keySource = health?.key_source || (hasKey ? 'database' : 'none');
            const currentKey = providerKeys[provider.id] || '';
            const canEditKey = currentKey !== '' && currentKey !== '••••••••';

            return (
              <article key={provider.id} className={`${PANEL} p-4 sm:p-5`}>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="min-w-0">
                    <h3 className="font-heading text-xl text-brand-ink leading-tight truncate">{provider.name}</h3>
                    <p className="text-xs text-ink-muted mt-1">
                      Urutan pakai: {provider.priority}
                      {health?.latency_ms != null && ` · ${health.latency_ms} ms`}
                      {keySource !== 'none' && ` · kunci dari ${keySource === 'database' ? 'basis data' : 'variabel server'}`}
                    </p>
                    {health?.error_message && (
                      <div className={cn('text-xs px-2 py-1.5 mt-2', TONE.bad.surface, TONE.bad.text)}>
                        <p className="font-semibold">Pesan dari provider</p>
                        <p className="font-mono break-all mt-0.5">{health.error_message}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <StatusBadge status={status} />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleProvider(provider.id, !provider.enabled)}
                      disabled={saving}
                      className={`${BTN_QUIET} ${TAP} px-4`}
                    >
                      {provider.enabled ? 'Matikan' : 'Nyalakan'}
                    </Button>
                  </div>
                </div>

                {/* Key row — stacks on a phone so nothing is squeezed off-screen */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1 min-w-0">
                    <label className="sr-only" htmlFor={`key-${provider.id}`}>
                      Kunci API {provider.name}
                    </label>
                    <input
                      id={`key-${provider.id}`}
                      type={showKeys[provider.id] ? 'text' : 'password'}
                      value={currentKey}
                      onChange={e => setProviderKeys(prev => ({ ...prev, [provider.id]: e.target.value }))}
                      placeholder={hasKey ? '•••••••• (kunci tersimpan)' : 'Tempel kunci API provider…'}
                      className={`${INPUT} pr-12`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowKeys(prev => ({ ...prev, [provider.id]: !prev[provider.id] }))}
                      className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center text-ink-muted hover:text-brand-ink focus-visible:rounded-none!"
                      aria-label={showKeys[provider.id] ? 'Sembunyikan kunci' : 'Tampilkan kunci'}
                    >
                      {showKeys[provider.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => saveKey(provider.id)}
                      disabled={!canEditKey || savingKey === provider.id}
                      className={`${TAP} px-4 flex-1 sm:flex-none`}
                    >
                      {savingKey === provider.id
                        ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                        : null}
                      Simpan
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => validateProvider(provider.id)}
                      disabled={validating === provider.id}
                      className={`${BTN_QUIET} ${TAP_ICON}`}
                      aria-label={`Periksa kunci ${provider.name}`}
                    >
                      {validating === provider.id
                        ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                        : <TestTube className="w-4 h-4" aria-hidden="true" />}
                    </Button>
                    {/* Integration fix: this used to call deleteKey directly, so
                        the confirmation written in requestDeleteKey was dead
                        code and the key vanished on a single tap. */}
                    {hasKey && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => requestDeleteKey(provider.id)}
                        disabled={savingKey === provider.id}
                        className={TAP_ICON}
                        aria-label={`Hapus kunci API ${provider.name}`}
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Detect models */}
                {canEditKey && !detectedModels[provider.id]?.length && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => detectModels(provider.id)}
                    disabled={detectingModels === provider.id}
                    className={`${BTN_QUIET} ${TAP} gap-2 px-4 mt-2`}
                  >
                    {detectingModels === provider.id
                      ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      : <Scan className="w-4 h-4" aria-hidden="true" />}
                    {detectingModels === provider.id ? 'Mencari model…' : 'Cari model'}
                  </Button>
                )}

                {/* Detected models */}
                {detectedModels[provider.id]?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-brand-ink/12">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <h4 className="text-sm font-semibold text-brand-ink">
                        Ketemu {detectedModels[provider.id].length} model
                      </h4>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedDetected(prev => ({
                            ...prev,
                            [provider.id]: detectedModels[provider.id].map((m: any) => m.model_id)
                          }))}
                          className={`${BTN_QUIET} ${TAP} px-3`}
                        >
                          Pilih semua
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedDetected(prev => ({ ...prev, [provider.id]: [] }))}
                          className={`${BTN_QUIET} ${TAP} px-3`}
                        >
                          Kosongkan
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-ink-muted mb-2">Centang model yang mau dipakai.</p>
                    <ul className="max-h-56 overflow-y-auto border border-brand-ink/12 divide-y divide-brand-ink/10">
                      {detectedModels[provider.id].map((m: any) => (
                        <li key={m.model_id}>
                          <label className="flex items-center gap-3 px-3 min-h-11 py-2 cursor-pointer hover:bg-brand-cream">
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
                              className="w-5 h-5 shrink-0 accent-[#8b2500]"
                            />
                            <span className="text-xs font-mono text-brand-ink break-all">{m.model_id}</span>
                            {m.context_window && (
                              <span className="text-[11px] text-ink-subtle ml-auto shrink-0">
                                {(m.context_window / 1000).toFixed(0)}k
                              </span>
                            )}
                          </label>
                        </li>
                      ))}
                    </ul>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Button
                        size="sm"
                        onClick={() => importDetectedModels(provider.id)}
                        disabled={!selectedDetected[provider.id]?.length || importingModels === provider.id}
                        className={`${TAP} px-4`}
                      >
                        {importingModels === provider.id
                          ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                          : null}
                        Tambahkan {selectedDetected[provider.id]?.length || 0} model
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setDetectedModels(prev => ({ ...prev, [provider.id]: [] }));
                          setSelectedDetected(prev => ({ ...prev, [provider.id]: [] }));
                        }}
                        className={`${BTN_QUIET} ${TAP} px-4`}
                      >
                        Batal
                      </Button>
                    </div>
                  </div>
                )}

                {/* Saved models for this provider */}
                {models.filter(m => m.provider_id === provider.id).length > 0 && (
                  <div className="mt-4 pt-4 border-t border-brand-ink/12">
                    <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted mb-2">
                      Model tersimpan
                    </h4>
                    <ul className="flex flex-wrap gap-1.5">
                      {models.filter(m => m.provider_id === provider.id).map(model => (
                        <li key={model.id}>
                          <StatusChip tone={model.is_primary ? 'ok' : model.is_fallback ? 'warn' : model.enabled ? 'info' : 'idle'}>
                            {model.name}
                            {model.is_primary && ' · utama'}
                            {model.is_fallback && ' · cadangan'}
                            {!model.is_primary && !model.is_fallback && !model.enabled && ' · mati'}
                          </StatusChip>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>
            );
          })}
        </section>
      )}

      {/* ══ Tambahan (custom providers) ═══════════════════════════ */}
      {activeTab === 'custom' && (
        <section {...panelProps('custom')} className="space-y-4">
          <SectionHeading icon={Puzzle} hint="Untuk endpoint AI di luar daftar bawaan. Mulai dari preset, lalu periksa URL-nya.">
            Provider Tambahan
          </SectionHeading>

          {!showAddProvider && (
            <Button onClick={() => setShowAddProvider(true)} className={`${TAP} gap-2 px-4`}>
              <Plus className="w-4 h-4" aria-hidden="true" />
              Tambah provider
            </Button>
          )}

          {/* Test result */}
          {testResult && (
            <AdminNotice
              tone={testResult.ok ? 'ok' : 'bad'}
              title={testResult.ok ? 'Koneksi berhasil' : 'Koneksi gagal'}
            >
              {testResult.providerId}
              {testResult.latencyMs != null && ` · ${testResult.latencyMs} ms`}
              {testResult.error && ` · ${testResult.error}`}
            </AdminNotice>
          )}

          {/* Presets */}
          {!showAddProvider && customProviders.length === 0 && (
            <div className={`${PANEL} p-5`}>
              <h3 className="font-heading text-xl text-brand-ink mb-1">Preset provider</h3>
              <p className="text-sm text-ink-muted mb-4">
                Mulai dari preset, lalu periksa URL dan formatnya sebelum menyimpan.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-brand-ink/12 border border-brand-ink/12">
                {[
                  { id: 'openrouter', name: 'OpenRouter', url: 'https://openrouter.ai/api/v1', fmt: 'openai', auth: 'bearer' },
                  { id: 'together', name: 'Together AI', url: 'https://api.together.xyz/v1', fmt: 'openai', auth: 'bearer' },
                  { id: 'groq', name: 'Groq', url: 'https://api.groq.com/openai/v1', fmt: 'openai', auth: 'bearer' },
                  { id: 'deepseek', name: 'DeepSeek', url: 'https://api.deepseek.com/v1', fmt: 'openai', auth: 'bearer' },
                ].map(preset => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setNewProvider({
                        id: preset.id, name: preset.name, base_url: preset.url,
                        auth_type: preset.auth, api_format: preset.fmt,
                        chat_endpoint: '/chat/completions', priority: 50
                      });
                      setShowAddProvider(true);
                    }}
                    className="flex flex-col items-center justify-center gap-2 bg-white px-3 py-5 min-h-11 hover:bg-brand-cream transition-colors focus-visible:rounded-none!"
                  >
                    <Globe className="w-5 h-5 text-brand-rust" aria-hidden="true" />
                    <span className="text-sm font-medium text-brand-ink text-center">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add provider form */}
          {showAddProvider && (
            <div className={`${PANEL} p-5`}>
              <h3 className="font-heading text-xl text-brand-ink mb-4">Provider baru</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={FIELD_LABEL} htmlFor="np-id">ID provider *</label>
                  <input id="np-id" value={newProvider.id} onChange={e => setNewProvider(p => ({ ...p, id: e.target.value }))}
                    placeholder="misalnya openrouter" className={INPUT} />
                </div>
                <div>
                  <label className={FIELD_LABEL} htmlFor="np-name">Nama provider *</label>
                  <input id="np-name" value={newProvider.name} onChange={e => setNewProvider(p => ({ ...p, name: e.target.value }))}
                    placeholder="misalnya OpenRouter" className={INPUT} />
                </div>
                <div className="md:col-span-2">
                  <label className={FIELD_LABEL} htmlFor="np-url">Alamat dasar API *</label>
                  <input id="np-url" value={newProvider.base_url} onChange={e => setNewProvider(p => ({ ...p, base_url: e.target.value }))}
                    placeholder="https://openrouter.ai/api/v1" className={INPUT} />
                </div>
                <div>
                  <label className={FIELD_LABEL} htmlFor="np-auth">Jenis autentikasi</label>
                  <select id="np-auth" value={newProvider.auth_type} onChange={e => setNewProvider(p => ({ ...p, auth_type: e.target.value }))}
                    className={INPUT}>
                    <option value="bearer">Bearer Token</option>
                    <option value="x-api-key">Header X-API-Key</option>
                  </select>
                </div>
                <div>
                  <label className={FIELD_LABEL} htmlFor="np-format">Format API</label>
                  <select id="np-format" value={newProvider.api_format} onChange={e => {
                    const fmt = e.target.value;
                    setNewProvider(p => ({
                      ...p,
                      api_format: fmt,
                      chat_endpoint: fmt === 'gemini' ? '/v1beta/models/{model}:generateContent' :
                                     fmt === 'anthropic' ? '/v1/messages' :
                                     '/chat/completions'
                    }));
                  }} className={INPUT}>
                    <option value="openai">Kompatibel OpenAI</option>
                    <option value="gemini">Google Gemini</option>
                    <option value="anthropic">Anthropic Claude</option>
                    <option value="mistral">Mistral</option>
                    <option value="cohere">Cohere</option>
                  </select>
                </div>
                <div>
                  <label className={FIELD_LABEL} htmlFor="np-endpoint">Endpoint chat</label>
                  <input id="np-endpoint" value={newProvider.chat_endpoint} onChange={e => setNewProvider(p => ({ ...p, chat_endpoint: e.target.value }))}
                    className={INPUT} />
                </div>
                <div>
                  <label className={FIELD_LABEL} htmlFor="np-priority">Urutan pakai</label>
                  <input id="np-priority" type="number" value={newProvider.priority} onChange={e => setNewProvider(p => ({ ...p, priority: Number(e.target.value) }))}
                    className={INPUT} />
                  <p className="text-xs text-ink-muted mt-1">Angka lebih kecil dicoba lebih dulu.</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-5">
                <Button onClick={createCustomProvider}
                  disabled={saving || !newProvider.id || !newProvider.name || !newProvider.base_url}
                  className={`${TAP} gap-2 px-4`}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Plus className="w-4 h-4" aria-hidden="true" />}
                  Simpan provider
                </Button>
                <Button variant="ghost" onClick={() => setShowAddProvider(false)} className={`${BTN_QUIET} ${TAP} px-4`}>
                  Batal
                </Button>
              </div>
            </div>
          )}

          {/* Custom provider cards */}
          {customProviders.map(provider => {
            const providerModels = customModels.filter(m => m.provider_id === provider.id);
            const providerKeyRows = customKeys.filter(k => k.provider_id === provider.id);
            const providerKey = providerKeyRows[0];
            const detectedForProvider = detectedModels[provider.id] || [];
            const selectedForProvider = selectedDetected[provider.id] || [];
            const savedModelIds = providerModels.map(m => m.model_id);
            const draft = providerKeys[provider.id] || '';

            return (
              <article key={provider.id} className={`${PANEL} p-4 sm:p-5`}>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <h3 className="font-heading text-xl text-brand-ink leading-tight truncate">{provider.name}</h3>
                    <p className="text-xs text-ink-muted font-mono break-all mt-0.5">{provider.base_url}</p>
                  </div>
                  <ul className="flex flex-wrap gap-1.5 justify-end shrink-0">
                    <li><StatusChip tone="info">{provider.api_format}</StatusChip></li>
                    <li><StatusChip tone="idle">{provider.auth_type}</StatusChip></li>
                    <li><StatusChip tone="idle">urutan {provider.priority}</StatusChip></li>
                  </ul>
                </div>

                {/* Key row */}
                <div className="flex flex-col sm:flex-row gap-2 mb-3">
                  <label className="sr-only" htmlFor={`custom-key-${provider.id}`}>
                    Kunci API {provider.name}
                  </label>
                  <input
                    id={`custom-key-${provider.id}`}
                    type="password"
                    value={draft}
                    onChange={e => setProviderKeys(prev => ({ ...prev, [provider.id]: e.target.value }))}
                    placeholder={providerKey ? '•••••••• (kunci tersimpan)' : 'Tempel kunci API provider…'}
                    className={`${INPUT} flex-1 min-w-0`}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => saveCustomKey(provider.id)}
                      disabled={savingKey === provider.id || !draft.trim()}
                      className={`${TAP} px-4 flex-1 sm:flex-none`}
                    >
                      {savingKey === provider.id ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : null}
                      Simpan kunci
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => testCustomProvider(provider.id)}
                      disabled={testing}
                      className={`${BTN_QUIET} ${TAP_ICON}`}
                      aria-label={`Uji koneksi ${provider.name}`}
                    >
                      {testing ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <TestTube className="w-4 h-4" aria-hidden="true" />}
                    </Button>
                  </div>
                </div>

                <p className="text-xs text-ink-muted mb-3">
                  Tarik daftar model dari API provider ini, lalu tambahkan yang bisa kamu akses ke perutean.
                </p>

                {detectionMessages[provider.id] && (
                  <AdminNotice
                    tone={detectionMessages[provider.id].ok ? 'ok' : 'bad'}
                    className="mb-3"
                  >
                    {detectionMessages[provider.id].message}
                  </AdminNotice>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setShowAddModel(provider.id)} className={`${BTN_QUIET} ${TAP} gap-2 px-4`}>
                    <Plus className="w-4 h-4" aria-hidden="true" /> Tambah model
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowAddKey(provider.id)} className={`${BTN_QUIET} ${TAP} gap-2 px-4`}>
                    <Key className="w-4 h-4" aria-hidden="true" /> Tambah kunci
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => detectCustomModels(provider.id)}
                    disabled={detectingModels === provider.id || importingModels === provider.id || (!providerKey && !draft)}
                    className={`${BTN_QUIET} ${TAP} gap-2 px-4`}
                    title={!providerKey && !draft ? 'Simpan atau tempel kunci API dulu sebelum menarik model' : undefined}
                  >
                    {detectingModels === provider.id
                      ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      : <Scan className="w-4 h-4" aria-hidden="true" />}
                    Tarik model
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => requestDeleteCustomProvider(provider.id)} className={`${TAP} gap-2 px-4`}>
                    <Trash2 className="w-4 h-4" aria-hidden="true" /> Hapus
                  </Button>
                </div>

                {/* Detected list */}
                {detectedForProvider.length > 0 && (
                  <div className="mt-4 border border-brand-ink/12 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-brand-ink">Model yang bisa diakses</h4>
                        <p className="text-xs text-ink-muted">
                          Daftar dari provider. Pilih hanya yang mau tersedia di perutean.
                        </p>
                      </div>
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedDetected(prev => ({
                            ...prev,
                            [provider.id]: detectedForProvider
                              .map((m: any) => m.model_id)
                              .filter((id: string) => !savedModelIds.includes(id))
                          }))}
                          className={`${BTN_QUIET} ${TAP} px-3`}
                        >
                          Pilih yang baru
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedDetected(prev => ({ ...prev, [provider.id]: [] }))}
                          className={`${BTN_QUIET} ${TAP} px-3`}
                        >
                          Kosongkan
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => importCustomDetectedModels(provider.id)}
                          disabled={importingModels === provider.id || selectedForProvider.length === 0}
                          className={`${TAP} gap-2 px-4`}
                        >
                          {importingModels === provider.id
                            ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                            : <Plus className="w-4 h-4" aria-hidden="true" />}
                          Tambah {selectedForProvider.length}
                        </Button>
                      </div>
                    </div>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-brand-ink/12 border border-brand-ink/12 max-h-72 overflow-y-auto">
                      {detectedForProvider.map((model: any) => {
                        const isSaved = savedModelIds.includes(model.model_id);
                        const isSelected = selectedForProvider.includes(model.model_id);
                        return (
                          <li key={model.model_id}>
                            <label
                              className={cn(
                                'flex items-start gap-3 px-3 py-2.5 min-h-11 h-full text-sm cursor-pointer',
                                isSaved ? 'bg-brand-cream' : 'bg-white hover:bg-brand-cream'
                              )}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                disabled={isSaved}
                                onChange={(e) => {
                                  setSelectedDetected(prev => ({
                                    ...prev,
                                    [provider.id]: e.target.checked
                                      ? [...(prev[provider.id] || []), model.model_id]
                                      : (prev[provider.id] || []).filter(id => id !== model.model_id)
                                  }));
                                }}
                                className="mt-0.5 w-5 h-5 shrink-0 accent-[#8b2500]"
                              />
                              <span className="min-w-0">
                                <span className="block text-brand-ink break-words">{model.display_name || model.model_id}</span>
                                <span className="block text-xs text-ink-muted font-mono break-all">{model.model_id}</span>
                                {isSaved && (
                                  <span className={cn('block text-[11px] mt-0.5 font-semibold', TONE.ok.text)}>
                                    Sudah ditambahkan
                                  </span>
                                )}
                              </span>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {/* Add model form */}
                {showAddModel === provider.id && (
                  <div className="mt-4 pt-4 border-t border-brand-ink/12">
                    <h4 className="text-sm font-semibold text-brand-ink mb-3">Model baru</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={FIELD_LABEL} htmlFor={`nm-id-${provider.id}`}>ID model di provider</label>
                        <input id={`nm-id-${provider.id}`} value={newModel.model_id} onChange={e => setNewModel(m => ({ ...m, model_id: e.target.value }))}
                          placeholder="misalnya claude-3-5-sonnet" className={INPUT} />
                      </div>
                      <div>
                        <label className={FIELD_LABEL} htmlFor={`nm-name-${provider.id}`}>Nama tampilan</label>
                        <input id={`nm-name-${provider.id}`} value={newModel.display_name} onChange={e => setNewModel(m => ({ ...m, display_name: e.target.value }))}
                          placeholder="misalnya Claude 3.5 Sonnet" className={INPUT} />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" onClick={() => createCustomModel(provider.id)}
                        disabled={saving || !newModel.model_id || !newModel.display_name} className={`${TAP} px-4`}>
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : null}
                        Simpan model
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setShowAddModel(null)} className={`${BTN_QUIET} ${TAP} px-4`}>
                        Batal
                      </Button>
                    </div>
                  </div>
                )}

                {/* Add key form */}
                {showAddKey === provider.id && (
                  <div className="mt-4 pt-4 border-t border-brand-ink/12">
                    <h4 className="text-sm font-semibold text-brand-ink mb-3">Kunci API baru</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-[10rem_1fr] gap-3">
                      <div>
                        <label className={FIELD_LABEL} htmlFor={`nk-name-${provider.id}`}>Nama kunci</label>
                        <input id={`nk-name-${provider.id}`} value={newKey.key_name} onChange={e => setNewKey(k => ({ ...k, key_name: e.target.value }))}
                          placeholder="default" className={INPUT} />
                      </div>
                      <div>
                        <label className={FIELD_LABEL} htmlFor={`nk-value-${provider.id}`}>Kunci API</label>
                        <input id={`nk-value-${provider.id}`} type="password" value={newKey.api_key} onChange={e => setNewKey(k => ({ ...k, api_key: e.target.value }))}
                          placeholder="Tempel kunci API provider…" className={INPUT} />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" onClick={() => createCustomKey(provider.id)} disabled={saving || !newKey.api_key} className={`${TAP} px-4`}>
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : null}
                        Simpan kunci
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setShowAddKey(null)} className={`${BTN_QUIET} ${TAP} px-4`}>
                        Batal
                      </Button>
                    </div>
                  </div>
                )}

                {/* Models & keys */}
                <div className="mt-4 pt-4 border-t border-brand-ink/12 grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted mb-2">
                      Model ({providerModels.length})
                    </h4>
                    {providerModels.length === 0 ? (
                      <p className="text-xs text-ink-muted">Belum ada model tersimpan untuk provider ini.</p>
                    ) : (
                      <ul className="border border-brand-ink/12 divide-y divide-brand-ink/10">
                        {providerModels.map(model => {
                          const routingModel = modelRoutingById.get(model.id);
                          const routingLabel = routingModel?.is_primary ? 'Utama'
                            : routingModel?.is_fallback ? 'Cadangan'
                            : routingModel ? 'Siap dipakai'
                            : 'Belum tersinkron';
                          const routingTone: Tone = routingModel?.is_primary ? 'ok'
                            : routingModel?.is_fallback ? 'warn'
                            : routingModel ? 'info'
                            : 'bad';
                          const label = model.display_name || model.model_id;
                          return (
                            <li key={model.id} className="flex items-start justify-between gap-2 bg-white px-3 py-2.5">
                              <div className="min-w-0 flex-1">
                                <span className="block text-sm text-brand-ink break-words">{label}</span>
                                <span className="block text-xs text-ink-muted font-mono break-all">{model.model_id}</span>
                                <StatusChip tone={routingTone} className="mt-1.5">{routingLabel}</StatusChip>
                              </div>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => requestDeleteCustomModel(model.id, label)}
                                className={TAP_ICON}
                                aria-label={`Hapus model ${label}`}
                              >
                                <Trash2 className="w-4 h-4" aria-hidden="true" />
                              </Button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                  <div>
                    <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted mb-2">
                      Kunci ({providerKeyRows.length})
                    </h4>
                    {providerKeyRows.length === 0 ? (
                      <p className="text-xs text-ink-muted">Belum ada kunci API tersimpan.</p>
                    ) : (
                      <ul className="border border-brand-ink/12 divide-y divide-brand-ink/10">
                        {providerKeyRows.map(key => (
                          <li key={key.id} className="flex items-start justify-between gap-2 bg-white px-3 py-2.5">
                            <div className="min-w-0 flex-1">
                              <span className="block text-sm text-brand-ink break-words">{key.key_name}</span>
                              <StatusChip
                                tone={key.status === 'valid' ? 'ok' : key.status === 'invalid' ? 'bad' : 'idle'}
                                className="mt-1.5"
                              >
                                {key.status === 'valid' ? 'Terpakai' : key.status === 'invalid' ? 'Ditolak' : 'Belum diuji'}
                              </StatusChip>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => requestDeleteCustomKey(key.id, key.key_name)}
                              className={TAP_ICON}
                              aria-label={`Hapus kunci ${key.key_name}`}
                            >
                              <Trash2 className="w-4 h-4" aria-hidden="true" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </article>
            );
          })}

          {customProviders.length === 0 && !showAddProvider && (
            <EmptyState
              icon={Puzzle}
              title="Belum ada provider tambahan"
              hint="Pakai preset di atas, atau isi sendiri konfigurasinya."
            />
          )}
        </section>
      )}

      {/* ══ Perutean ══════════════════════════════════════════════ */}
      {activeTab === 'routing' && (
        <section {...panelProps('routing')} className="space-y-8">
          <div>
            <SectionHeading icon={Zap} hint="Model yang dicoba lebih dulu, dan cadangannya kalau yang utama gagal.">
              Perutean Aktif
            </SectionHeading>

            <div className={`${PANEL} p-5`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={FIELD_LABEL} htmlFor="pilih-utama">Model utama</label>
                  <select
                    id="pilih-utama"
                    value={primaryModel?.id || ''}
                    onChange={(e) => e.target.value && setPrimary(e.target.value)}
                    disabled={saving || selectableModels.length === 0}
                    className={`${INPUT} disabled:opacity-50`}
                  >
                    <option value="" disabled>Pilih model utama…</option>
                    {selectableModels.map(model => (
                      <option key={model.id} value={model.id}>{modelOptionLabel(model)}</option>
                    ))}
                  </select>
                  <p className="text-xs text-ink-muted mt-1.5">Model pertama yang dicoba untuk setiap permintaan AI.</p>
                </div>

                <div>
                  <label className={FIELD_LABEL} htmlFor="pilih-cadangan">Model cadangan</label>
                  <select
                    id="pilih-cadangan"
                    value={fallbackModel?.id || ''}
                    onChange={(e) => e.target.value && setFallback(e.target.value)}
                    disabled={saving || selectableModels.length === 0}
                    className={`${INPUT} disabled:opacity-50`}
                  >
                    <option value="" disabled>Pilih model cadangan…</option>
                    {selectableModels
                      .filter(model => model.id !== primaryModel?.id)
                      .map(model => (
                        <option key={model.id} value={model.id}>{modelOptionLabel(model)}</option>
                      ))}
                  </select>
                  <p className="text-xs text-ink-muted mt-1.5">Dipakai kalau model utama gagal menjawab.</p>
                </div>
              </div>

              {selectableModels.length === 0 && (
                <AdminNotice tone="warn" title="Belum ada model tersimpan" className="mt-5">
                  Buka tab Provider, simpan atau periksa sebuah kunci, lalu tekan Cari model dan tambahkan minimal satu model.
                </AdminNotice>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-brand-ink/12 border border-brand-ink/12 mt-5">
                <RoleCard tone="ok" role="Model utama" model={primaryModel} emptyText="Model utama belum dipilih" />
                <RoleCard tone="warn" role="Model cadangan" model={fallbackModel} emptyText="Model cadangan belum dipilih" />
              </div>
            </div>
          </div>

          <div>
            <SectionHeading icon={Cpu} hint="Semua model yang sudah tersimpan, beserta perannya.">
              Model Tersimpan
            </SectionHeading>
            {models.length === 0 ? (
              <EmptyState icon={Cpu} title="Belum ada model tersimpan" hint="Tambahkan model dari tab Provider atau Tambahan." />
            ) : (
              <ul className="border border-brand-ink/12 divide-y divide-brand-ink/10">
                {models.map(model => {
                  const roleTone: Tone = model.is_primary ? 'ok' : model.is_fallback ? 'warn' : 'idle';
                  const roleLabel = model.is_primary ? 'Utama' : model.is_fallback ? 'Cadangan' : 'Cadangan kedua';
                  return (
                    <li key={model.id} className="bg-white p-3 sm:px-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-brand-ink break-words">
                            {model.display_name || model.name}
                          </p>
                          <p className="text-xs text-ink-muted font-mono break-all mt-0.5">
                            {model.provider_id} · {model.name}
                          </p>
                        </div>
                        <StatusChip tone={roleTone}>{roleLabel}</StatusChip>
                      </div>
                      {/* Controls drop to their own row so nothing is squeezed
                          off-screen on a phone. */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPrimary(model.id)}
                          disabled={saving || model.is_primary}
                          className={`${BTN_QUIET} ${TAP} px-4`}
                        >
                          Jadikan utama
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setFallback(model.id)}
                          disabled={saving || model.is_fallback || model.is_primary}
                          className={`${BTN_QUIET} ${TAP} px-4`}
                        >
                          Jadikan cadangan
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleModel(model.id, !model.enabled)}
                          disabled={saving}
                          className={`${BTN_QUIET} ${TAP} px-4`}
                        >
                          {model.enabled ? 'Nonaktifkan' : 'Aktifkan'}
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      )}

      {/* ══ Pemakaian ═════════════════════════════════════════════ */}
      {activeTab === 'usage' && (
        <section {...panelProps('usage')} className="space-y-8">
          <div>
            <SectionHeading icon={TrendingUp} hint="Dihitung dari tujuh hari terakhir.">
              Ringkasan Pemakaian
            </SectionHeading>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-brand-ink/12 border border-brand-ink/12">
              <CountCell icon={TrendingUp} label="Total permintaan" text={totalRequests.toLocaleString('id-ID')} tone="idle" />
              <CountCell
                icon={CheckCircle2}
                label="Tingkat keberhasilan"
                text={`${successRate}%`}
                tone={successRate >= 90 ? 'ok' : successRate >= 70 ? 'warn' : 'bad'}
              />
              <CountCell
                icon={Clock}
                label="Rata-rata balasan"
                text={`${avgLatency} ms`}
                tone={avgLatency < 500 ? 'ok' : avgLatency < 1000 ? 'warn' : 'bad'}
              />
              <CountCell
                icon={XCircle}
                label="Permintaan gagal"
                text={totalFailed.toLocaleString('id-ID')}
                tone={totalFailed === 0 ? 'ok' : 'bad'}
              />
            </div>
          </div>

          <div>
            <SectionHeading icon={BarChart3} hint="Geser tabel ke samping untuk melihat kolom lainnya.">
              Pemakaian per Model
            </SectionHeading>
            {usageStats.length > 0 ? (
              <div className="overflow-x-auto border border-brand-ink/12">
                <table className="w-full min-w-[46rem] border-collapse text-sm">
                  <caption className="sr-only">Pemakaian tiap model selama tujuh hari terakhir</caption>
                  <thead>
                    <tr className="bg-brand-cream">
                      <th scope="col" className="text-left px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">Model</th>
                      <th scope="col" className="text-right px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">Permintaan</th>
                      <th scope="col" className="text-right px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">Berhasil</th>
                      <th scope="col" className="text-right px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">Gagal</th>
                      <th scope="col" className="text-right px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">Rata-rata</th>
                      <th scope="col" className="text-right px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">Token</th>
                      <th scope="col" className="text-right px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">Biaya</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usageStats.map(s => {
                      const lat = s.total_requests > 0 ? Math.round(s.total_latency_ms / s.total_requests) : 0;
                      return (
                        <tr key={`${s.provider_id}-${s.model_id}`} className="bg-white border-t border-brand-ink/10">
                          <th scope="row" className="text-left px-3 py-3 font-medium text-brand-ink">
                            {s.model_id || s.provider_id}
                          </th>
                          <td className="px-3 py-3 text-right text-brand-ink tabular-nums">{s.total_requests.toLocaleString('id-ID')}</td>
                          <td className={cn('px-3 py-3 text-right font-medium tabular-nums', TONE.ok.text)}>
                            {s.successful_requests.toLocaleString('id-ID')}
                          </td>
                          <td className={cn('px-3 py-3 text-right font-medium tabular-nums', s.failed_requests > 0 ? TONE.bad.text : 'text-ink-muted')}>
                            {s.failed_requests.toLocaleString('id-ID')}
                          </td>
                          <td className="px-3 py-3 text-right text-ink-muted tabular-nums">{lat} ms</td>
                          <td className="px-3 py-3 text-right text-ink-muted tabular-nums">
                            {(s.total_tokens_in + s.total_tokens_out).toLocaleString('id-ID')}
                          </td>
                          <td className="px-3 py-3 text-right text-ink-muted tabular-nums">
                            ${s.total_cost_usd?.toFixed(4) || '0.0000'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                icon={BarChart3}
                title="Belum ada pemakaian dalam 7 hari terakhir"
                hint="Angka muncul setelah ada yang memakai Herr Deutsch."
              />
            )}
          </div>
        </section>
      )}

      {/* ══ Notifikasi ════════════════════════════════════════════ */}
      {activeTab === 'webhooks' && (
        <section {...panelProps('webhooks')} className="space-y-8">
          <div>
            <SectionHeading icon={Bell} hint="Pemberitahuan admin dikirim ke kanal Discord.">
              Webhook Discord
            </SectionHeading>

            <div className={`${PANEL} p-5`}>
              {/* systemHealth is null whenever the health request failed —
                  reading .config straight off it used to crash this whole tab. */}
              {!systemHealth ? (
                <AdminNotice tone="warn" title="Status layanan belum termuat">
                  Muat ulang halaman untuk melihat apakah webhook sudah terpasang.
                </AdminNotice>
              ) : (
                <>
                  <div className={cn('flex flex-wrap items-center gap-x-3 gap-y-1 p-3 mb-5',
                    systemHealth.config?.webhookConfigured ? TONE.ok.surface : TONE.bad.surface)}>
                    {systemHealth.config?.webhookConfigured
                      ? <CheckCircle2 className={cn('w-4 h-4 shrink-0', TONE.ok.text)} aria-hidden="true" />
                      : <XCircle className={cn('w-4 h-4 shrink-0', TONE.bad.text)} aria-hidden="true" />}
                    <span className="text-sm font-mono text-brand-ink">DISCORD_WEBHOOK_URL</span>
                    <StatusChip tone={systemHealth.config?.webhookConfigured ? 'ok' : 'bad'} className="sm:ml-auto">
                      {systemHealth.config?.webhookConfigured ? 'Terpasang' : 'Belum diisi'}
                    </StatusChip>
                    <p className="text-xs text-ink-muted w-full">
                      {systemHealth.config?.webhookConfigured
                        ? 'Pemberitahuan akan dikirim ke Discord.'
                        : 'Isi variabel DISCORD_WEBHOOK_URL di server dulu.'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      variant="ghost"
                      onClick={testWebhook}
                      disabled={webhookTesting || !systemHealth.config?.webhookConfigured}
                      className={`${BTN_QUIET} ${TAP} gap-2 px-4`}
                    >
                      {webhookTesting
                        ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                        : <Send className="w-4 h-4" aria-hidden="true" />}
                      {webhookTesting ? 'Mengirim…' : 'Kirim notifikasi percobaan'}
                    </Button>
                  </div>

                  {webhookResult && (
                    <AdminNotice
                      tone={webhookResult.ok ? 'ok' : 'bad'}
                      title={webhookResult.ok ? 'Terkirim' : 'Tidak terkirim'}
                      className="mt-4"
                    >
                      {webhookResult.message}
                    </AdminNotice>
                  )}
                </>
              )}
            </div>
          </div>

          <div>
            <SectionHeading icon={Zap} hint="Kejadian yang otomatis dikabarkan ke Discord.">
              Pemicu Notifikasi
            </SectionHeading>
            <ul className="border border-brand-ink/12 divide-y divide-brand-ink/10">
              {[
                { event: 'Pembayaran berhasil', desc: 'Saat pengguna menyelesaikan pembayaran QRIS.' },
                { event: 'Provider AI bermasalah', desc: 'Saat pemeriksaan provider gagal.' },
                { event: 'Pembayaran gagal', desc: 'Saat webhook pembayaran melaporkan kegagalan.' },
              ].map(({ event, desc }) => (
                <li key={event} className="flex items-start justify-between gap-3 bg-white p-3 sm:px-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-brand-ink">{event}</p>
                    <p className="text-xs text-ink-muted mt-0.5">{desc}</p>
                  </div>
                  <StatusChip tone="ok">Aktif</StatusChip>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <div className="h-16" />

      {/* Integration fix: notify() is called ~35 times in this file and
          confirm.ask() gates every destructive action, but neither surface was
          ever mounted — every message was swallowed and the delete
          confirmations could never appear, leaving those buttons dead. Mounted
          here the same way Admin.tsx does it. */}
      <AdminFeedbackStack feedback={feedback} />
      <ConfirmDialog control={confirm} />
    </div>
  );
}

/* ============================================================================
   Local presentational pieces. Kept in this file on purpose: splitting a
   2,000-line page into modules is not something to attempt without a way to
   run the tests.
   ========================================================================= */

/** Status as icon + Indonesian word + tone — never colour on its own. */
function StatusBadge({ status }: { status: RuntimeStatus }) {
  const Icon = STATUS_ICON[status] ?? XCircle;
  return (
    <StatusChip tone={toneOf(status)} className="shrink-0">
      <Icon className="w-3 h-3 shrink-0" aria-hidden="true" />
      {STATUS_LABEL[status] ?? 'Tidak diketahui'}
    </StatusChip>
  );
}

function CountCell({
  icon: Icon,
  label,
  count,
  text,
  tone,
}: {
  icon: typeof Activity;
  label: string;
  count?: number;
  text?: string;
  tone: Tone;
}) {
  return (
    <div className="bg-white p-4 sm:p-5">
      <Icon className={cn('w-4 h-4 mb-3', TONE[tone].text)} aria-hidden="true" />
      <p className="font-heading text-3xl sm:text-4xl leading-none text-brand-ink tabular-nums">
        {text ?? (count ?? 0).toLocaleString('id-ID')}
      </p>
      <p className="text-xs text-ink-muted mt-2 leading-snug">{label}</p>
    </div>
  );
}

function ServicePill({ label, ok, detail }: { label: string; ok: boolean; detail?: string }) {
  return (
    <div className="bg-white flex items-center gap-3 px-4 py-3">
      {ok
        ? <CheckCircle2 className={cn('w-4 h-4 shrink-0', TONE.ok.text)} aria-hidden="true" />
        : <XCircle className={cn('w-4 h-4 shrink-0', TONE.bad.text)} aria-hidden="true" />}
      <div className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-brand-ink truncate">{label}</span>
        {detail && <span className="block text-xs text-ink-muted truncate">{detail}</span>}
      </div>
      <StatusChip tone={ok ? 'ok' : 'bad'} className="ml-auto shrink-0">
        {ok ? 'Aktif' : 'Mati'}
      </StatusChip>
    </div>
  );
}

function RoleCard({
  tone,
  role,
  model,
  emptyText,
}: {
  tone: Tone;
  role: string;
  model?: Model;
  emptyText: string;
}) {
  return (
    <div className="bg-white p-5">
      <p className={cn('text-[11px] font-semibold uppercase tracking-[0.14em] mb-2', TONE[tone].text)}>
        {role}
      </p>
      {model ? (
        <>
          <p className="font-heading text-2xl leading-tight text-brand-ink break-words">
            {model.display_name || model.name}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <StatusChip tone="idle">{model.provider_id}</StatusChip>
            <StatusChip tone={model.enabled ? 'ok' : 'idle'}>
              {model.enabled ? 'Aktif' : 'Nonaktif'}
            </StatusChip>
          </div>
        </>
      ) : (
        <p className={cn('text-sm font-medium', TONE.warn.text)}>{emptyText}</p>
      )}
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  hint,
}: {
  icon: typeof Puzzle;
  title: string;
  hint?: string;
}) {
  return (
    <div className={`${PANEL} px-4 py-12 text-center`}>
      <Icon className="w-8 h-8 text-ink-subtle mx-auto mb-3" aria-hidden="true" />
      <p className="text-sm font-medium text-brand-ink">{title}</p>
      {hint && <p className="text-sm text-ink-muted mt-1">{hint}</p>}
    </div>
  );
}
