import { create } from 'zustand';
import { supabase } from '../lib/supabase';

// ============================================================
// Types
// ============================================================

export interface ProviderSecret {
  id: string;
  provider_id: string;
  secret_key: string;
  secret_value: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface ProviderStatus {
  id: string;
  name: string;
  priority: number;
  enabled: boolean;
  status: 'active' | 'missing_key' | 'invalid' | 'disabled';
  source: 'database' | 'environment' | 'none';
  hasKey: boolean;
  lastValidated?: string;
  maskedKey?: string;
}

interface AISecretsState {
  secrets: ProviderSecret[];
  providers: ProviderStatus[];
  loading: boolean;
  error: string | null;
  fetchSecrets: () => Promise<void>;
  fetchProviders: () => Promise<void>;
  addSecret: (providerId: string, secretKey: string, secretValue: string) => Promise<void>;
  updateSecret: (id: string, secretValue: string) => Promise<void>;
  deleteSecret: (id: string) => Promise<void>;
  validateSecret: (providerId: string) => Promise<{ valid: boolean; error?: string }>;
}

// ============================================================
// Helpers
// ============================================================

function maskKey(key: string): string {
  if (!key || key.length < 8) return '****';
  const start = key.slice(0, 4);
  const end = key.slice(-4);
  return `${start}${'*'.repeat(Math.min(key.length - 8, 8))}${end}`;
}

async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ============================================================
// Store
// ============================================================

export const useAISecretsStore = create<AISecretsState>((set, get) => ({
  secrets: [],
  providers: [],
  loading: false,
  error: null,

  fetchSecrets: async () => {
    set({ loading: true, error: null });
    try {
      const headers = await authHeaders();
      const res = await fetch('/api/admin-ai?action=secrets', { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      set({ secrets: data || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchProviders: async () => {
    set({ loading: true, error: null });
    try {
      const headers = await authHeaders();

      // Get providers and secrets via API
      const [providersRes, secretsRes] = await Promise.all([
        fetch('/api/admin-ai?action=providers', { headers }),
        fetch('/api/admin-ai?action=secrets', { headers }),
      ]);

      if (!providersRes.ok) throw new Error(`Providers fetch failed: HTTP ${providersRes.status}`);
      const providers = await providersRes.json();
      const secrets = secretsRes.ok ? await secretsRes.json() : [];

      // Build provider status
      const providerStatus: ProviderStatus[] = (providers || []).map((provider: any) => {
        const secret = (secrets || []).find((s: any) =>
          s.provider_id === provider.id && s.secret_key === 'api_key'
        );

        // Check env var (will be false in browser, but keep for completeness)
        const envKey = `${provider.id.toUpperCase()}_API_KEY`;
        const hasEnvKey = typeof process !== 'undefined' && (process.env as any)?.[envKey];

        let status: ProviderStatus['status'] = 'disabled';
        let source: ProviderStatus['source'] = 'none';
        let hasKey = false;
        let maskedKey: string | undefined;

        if (!provider.enabled) {
          status = 'disabled';
        } else if (secret) {
          status = 'active';
          source = 'database';
          hasKey = true;
          // Don't expose secret_value from API — use masked placeholder
          maskedKey = '**** (stored in DB)';
        } else if (hasEnvKey) {
          status = 'active';
          source = 'environment';
          hasKey = true;
          maskedKey = '****';
        } else {
          status = 'missing_key';
          source = 'none';
          hasKey = false;
        }

        return {
          id: provider.id,
          name: provider.name,
          priority: provider.priority,
          enabled: provider.enabled,
          status,
          source,
          hasKey,
          maskedKey,
        };
      });

      set({
        providers: providerStatus,
        secrets: secrets || [],
        loading: false,
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  addSecret: async (providerId: string, secretKey: string, secretValue: string) => {
    set({ loading: true, error: null });
    try {
      const headers = await authHeaders();
      const res = await fetch('/api/admin-ai?action=secret-add', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider_id: providerId, secret_key: secretKey, secret_value: secretValue }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      // Refresh
      await get().fetchProviders();
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  updateSecret: async (id: string, secretValue: string) => {
    set({ loading: true, error: null });
    try {
      const headers = await authHeaders();
      const res = await fetch('/api/admin-ai?action=secret-update', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, secret_value: secretValue }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      // Refresh
      await get().fetchProviders();
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  deleteSecret: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const headers = await authHeaders();
      const res = await fetch('/api/admin-ai?action=secret-delete', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      // Refresh
      await get().fetchProviders();
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  validateSecret: async (providerId: string) => {
    try {
      const headers = await authHeaders();

      // Get the secret via API
      const secretsRes = await fetch('/api/admin-ai?action=secrets', { headers });
      if (!secretsRes.ok) return { valid: false, error: 'Failed to fetch secrets' };
      const secrets = await secretsRes.json();
      const secret = secrets.find((s: any) => s.provider_id === providerId && s.secret_key === 'api_key');

      if (!secret) {
        return { valid: false, error: 'No API key found' };
      }

      // Note: We can't read secret_value from the API (it's not returned)
      // Validation must be done server-side
      return { valid: false, error: 'Validation must be done server-side (secret value not exposed)' };
    } catch (error: any) {
      return { valid: false, error: error.message };
    }
  },
}));
