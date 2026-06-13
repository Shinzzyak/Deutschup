import { create } from 'zustand';
import { getSupabaseAdminClient } from '../../lib/api-utils';

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
      const supabase = getSupabaseAdminClient();
      const { data, error } = await supabase
        .from('provider_secrets')
        .select('*')
        .order('provider_id');

      if (error) throw error;
      set({ secrets: data || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchProviders: async () => {
    set({ loading: true, error: null });
    try {
      const supabase = getSupabaseAdminClient();
      
      // Get all providers
      const { data: providers, error: pError } = await supabase
        .from('ai_providers')
        .select('*')
        .order('priority');

      if (pError) throw pError;

      // Get all secrets
      const { data: secrets, error: sError } = await supabase
        .from('provider_secrets')
        .select('*');

      if (sError) throw sError;

      // Build provider status
      const providerStatus: ProviderStatus[] = (providers || []).map(provider => {
        const secret = (secrets || []).find(s => 
          s.provider_id === provider.id && s.secret_key === 'api_key'
        );
        
        // Check env var
        const envKey = `${provider.id.toUpperCase()}_API_KEY`;
        const hasEnvKey = typeof process !== 'undefined' && process.env?.[envKey];
        
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
          maskedKey = maskKey(secret.secret_value);
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
        loading: false 
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  addSecret: async (providerId: string, secretKey: string, secretValue: string) => {
    set({ loading: true, error: null });
    try {
      const supabase = getSupabaseAdminClient();
      
      // Check if secret already exists
      const { data: existing } = await supabase
        .from('provider_secrets')
        .select('id')
        .eq('provider_id', providerId)
        .eq('secret_key', secretKey)
        .single();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('provider_secrets')
          .update({ 
            secret_value: secretValue, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('provider_secrets')
          .insert({
            provider_id: providerId,
            secret_key: secretKey,
            secret_value: secretValue,
          });

        if (error) throw error;
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
      const supabase = getSupabaseAdminClient();
      const { error } = await supabase
        .from('provider_secrets')
        .update({ 
          secret_value: secretValue, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id);

      if (error) throw error;

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
      const supabase = getSupabaseAdminClient();
      const { error } = await supabase
        .from('provider_secrets')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Refresh
      await get().fetchProviders();
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  validateSecret: async (providerId: string) => {
    try {
      const supabase = getSupabaseAdminClient();
      
      // Get the secret
      const { data: secret } = await supabase
        .from('provider_secrets')
        .select('secret_value')
        .eq('provider_id', providerId)
        .eq('secret_key', 'api_key')
        .single();

      if (!secret) {
        return { valid: false, error: 'No API key found' };
      }

      // Validate based on provider
      let valid = false;
      let error: string | undefined;

      switch (providerId) {
        case 'gemini':
          // Test Gemini API
          try {
            const response = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models?key=${secret.secret_value}`
            );
            valid = response.ok;
            if (!response.ok) {
              const data = await response.json();
              error = data.error?.message || 'Invalid API key';
            }
          } catch (e: any) {
            error = e.message;
          }
          break;

        case 'deepseek':
          // Test DeepSeek API
          try {
            const response = await fetch('https://api.deepseek.com/v1/models', {
              headers: { 'Authorization': `Bearer ${secret.secret_value}` }
            });
            valid = response.ok;
            if (!response.ok) {
              error = `HTTP ${response.status}`;
            }
          } catch (e: any) {
            error = e.message;
          }
          break;

        case 'mimo':
          // Test Mimo API
          const baseUrl = process.env?.MIMO_BASE_URL || 'https://api.xiaomimimo.com/v1';
          try {
            const response = await fetch(`${baseUrl}/models`, {
              headers: { 'Authorization': `Bearer ${secret.secret_value}` }
            });
            valid = response.ok;
            if (!response.ok) {
              error = `HTTP ${response.status}`;
            }
          } catch (e: any) {
            error = e.message;
          }
          break;

        case 'qwen':
          // Test Qwen API (OpenAI-compatible)
          try {
            const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/models', {
              headers: { 'Authorization': `Bearer ${secret.secret_value}` }
            });
            valid = response.ok;
            if (!response.ok) {
              error = `HTTP ${response.status}`;
            }
          } catch (e: any) {
            error = e.message;
          }
          break;

        default:
          error = 'Validation not supported for this provider';
      }

      return { valid, error };
    } catch (error: any) {
      return { valid: false, error: error.message };
    }
  },
}));