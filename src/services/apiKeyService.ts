import { createClient } from '@supabase/supabase-js';

interface ApiKey {
  id: string;
  provider: string;
  key_name: string;
  api_key: string;
  is_active: boolean;
  priority: number;
  last_checked: string | null;
  status: 'valid' | 'invalid' | 'rate_limited' | 'unchecked';
  requests_today: number;
  created_at: string;
}

interface ValidationResult {
  valid: boolean;
  error?: string;
  rateLimited?: boolean;
}

// Supabase client - using environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || '';

let supabase: any = null;

function getSupabaseClient() {
  if (!supabase && supabaseUrl && supabaseServiceKey) {
    supabase = createClient(supabaseUrl, supabaseServiceKey);
  }
  return supabase;
}

// Provider validation endpoints
const PROVIDER_VALIDATORS: Record<string, (key: string) => Promise<ValidationResult>> = {
  gemini: async (key: string) => {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models?key=${key}`
      );
      if (response.status === 429) {
        return { valid: false, rateLimited: true, error: 'Rate limited' };
      }
      if (response.status === 401 || response.status === 403) {
        return { valid: false, error: 'Invalid API key' };
      }
      return { valid: response.ok };
    } catch (error) {
      return { valid: false, error: String(error) };
    }
  },

  openai: async (key: string) => {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${key}` },
      });
      if (response.status === 429) {
        return { valid: false, rateLimited: true, error: 'Rate limited' };
      }
      if (response.status === 401 || response.status === 403) {
        return { valid: false, error: 'Invalid API key' };
      }
      return { valid: response.ok };
    } catch (error) {
      return { valid: false, error: String(error) };
    }
  },

  deepseek: async (key: string) => {
    try {
      const response = await fetch('https://api.deepseek.com/v1/models', {
        headers: { Authorization: `Bearer ${key}` },
      });
      if (response.status === 429) {
        return { valid: false, rateLimited: true, error: 'Rate limited' };
      }
      if (response.status === 401 || response.status === 403) {
        return { valid: false, error: 'Invalid API key' };
      }
      return { valid: response.ok };
    } catch (error) {
      return { valid: false, error: String(error) };
    }
  },

  openrouter: async (key: string) => {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: { Authorization: `Bearer ${key}` },
      });
      if (response.status === 429) {
        return { valid: false, rateLimited: true, error: 'Rate limited' };
      }
      if (response.status === 401 || response.status === 403) {
        return { valid: false, error: 'Invalid API key' };
      }
      return { valid: response.ok };
    } catch (error) {
      return { valid: false, error: String(error) };
    }
  },
};

/**
 * Get the best active key for a provider (lowest priority, status=valid, is_active=true)
 */
export async function getActiveKey(provider: string): Promise<ApiKey | null> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase client not configured');
  }

  const { data, error } = await client
    .from('api_keys')
    .select('*')
    .eq('provider', provider)
    .eq('is_active', true)
    .eq('status', 'valid')
    .order('priority', { ascending: true })
    .limit(1)
    .single();

  if (error || !data) {
    return null;
  }

  return data as ApiKey;
}

/**
 * Validate a key against the provider's API
 */
export async function validateKey(provider: string, key: string): Promise<ValidationResult> {
  const validator = PROVIDER_VALIDATORS[provider.toLowerCase()];
  if (!validator) {
    return { valid: false, error: `Unknown provider: ${provider}` };
  }
  return await validator(key);
}

/**
 * Get the next available key when current key fails
 */
export async function getNextKey(
  provider: string,
  currentPriority: number
): Promise<ApiKey | null> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase client not configured');
  }

  const { data, error } = await client
    .from('api_keys')
    .select('*')
    .eq('provider', provider)
    .eq('is_active', true)
    .in('status', ['valid', 'unchecked'])
    .gt('priority', currentPriority)
    .order('priority', { ascending: true })
    .limit(1)
    .single();

  if (error || !data) {
    return null;
  }

  return data as ApiKey;
}

/**
 * Update key status in database
 */
async function updateKeyStatus(
  keyId: string,
  status: ApiKey['status']
): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  await client
    .from('api_keys')
    .update({
      status,
      last_checked: new Date().toISOString(),
    })
    .eq('id', keyId);
}

/**
 * Increment request counter for a key
 */
async function incrementRequestCount(keyId: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  // First get current count
  const { data } = await client
    .from('api_keys')
    .select('requests_today')
    .eq('id', keyId)
    .single();

  if (data) {
    await client
      .from('api_keys')
      .update({ requests_today: (data.requests_today || 0) + 1 })
      .eq('id', keyId);
  }
}

/**
 * Rotate keys when current key fails - tries to get next available key
 */
export async function rotateKeys(provider: string): Promise<ApiKey | null> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase client not configured');
  }

  // Get any valid or unchecked key, ordered by priority
  const { data, error } = await client
    .from('api_keys')
    .select('*')
    .eq('provider', provider)
    .eq('is_active', true)
    .in('status', ['valid', 'unchecked'])
    .order('priority', { ascending: true })
    .limit(1)
    .single();

  if (error || !data) {
    return null;
  }

  // If unchecked, validate it first
  if (data.status === 'unchecked') {
    const validation = await validateKey(provider, data.api_key);
    if (validation.valid) {
      await updateKeyStatus(data.id, 'valid');
      data.status = 'valid';
    } else if (validation.rateLimited) {
      await updateKeyStatus(data.id, 'rate_limited');
      data.status = 'rate_limited';
    } else {
      await updateKeyStatus(data.id, 'invalid');
      data.status = 'invalid';
      // Try next key
      return rotateKeys(provider);
    }
  }

  // Increment request counter
  await incrementRequestCount(data.id);

  return data as ApiKey;
}

/**
 * Get all keys for admin view
 */
export async function getAllKeys(): Promise<ApiKey[]> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase client not configured');
  }

  const { data, error } = await client
    .from('api_keys')
    .select('*')
    .order('provider', { ascending: true })
    .order('priority', { ascending: true });

  if (error) {
    throw error;
  }

  return (data || []) as ApiKey[];
}

/**
 * Mark a key as rate limited
 */
export async function markKeyRateLimited(keyId: string): Promise<void> {
  await updateKeyStatus(keyId, 'rate_limited');
}

/**
 * Mark a key as invalid
 */
export async function markKeyInvalid(keyId: string): Promise<void> {
  await updateKeyStatus(keyId, 'invalid');
}

/**
 * Handle API call failure - marks key and returns next available
 */
export async function handleKeyFailure(
  provider: string,
  currentKey: ApiKey,
  statusCode: number
): Promise<ApiKey | null> {
  if (statusCode === 429) {
    await markKeyRateLimited(currentKey.id);
  } else if (statusCode === 401 || statusCode === 403) {
    await markKeyInvalid(currentKey.id);
  }

  // Try to get next key
  const nextKey = await getNextKey(provider, currentKey.priority);
  if (nextKey) {
    await incrementRequestCount(nextKey.id);
    return nextKey;
  }

  // No more keys available, try rotation
  return await rotateKeys(provider);
}

/**
 * Reset rate limited keys (should be called periodically)
 */
export async function resetRateLimitedKeys(): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  await client
    .from('api_keys')
    .update({
      status: 'valid',
      last_checked: new Date().toISOString(),
    })
    .eq('status', 'rate_limited')
    .lt('last_checked', oneHourAgo);
}

/**
 * Get API key with auto-failover - main entry point for getting keys
 */
export async function getApiKeyWithFailover(provider: string): Promise<ApiKey | null> {
  // First try to get an already valid key
  let key = await getActiveKey(provider);
  
  if (key) {
    await incrementRequestCount(key.id);
    return key;
  }

  // If no valid key, try rotation (which validates unchecked keys)
  return await rotateKeys(provider);
}

/**
 * Validate all keys for a provider and update their status
 */
export async function validateAllKeysForProvider(provider: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  const { data: keys } = await client
    .from('api_keys')
    .select('*')
    .eq('provider', provider)
    .eq('is_active', true);

  if (!keys) return;

  for (const key of keys) {
    const validation = await validateKey(provider, key.api_key);
    if (validation.valid) {
      await updateKeyStatus(key.id, 'valid');
    } else if (validation.rateLimited) {
      await updateKeyStatus(key.id, 'rate_limited');
    } else {
      await updateKeyStatus(key.id, 'invalid');
    }
  }
}

export default {
  getActiveKey,
  validateKey,
  getNextKey,
  rotateKeys,
  getAllKeys,
  markKeyRateLimited,
  markKeyInvalid,
  handleKeyFailure,
  resetRateLimitedKeys,
  getApiKeyWithFailover,
  validateAllKeysForProvider,
};