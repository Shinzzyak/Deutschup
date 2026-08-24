import { supabase } from '../lib/supabase';

// ============================================================
// Types
// ============================================================

export interface AIProvider {
  id: string;
  name: string;
  enabled: boolean;
  priority: number;
  status: 'active' | 'degraded' | 'down' | 'disabled';
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AIModel {
  id: string;
  provider_id: string;
  name: string;
  display_name: string;
  enabled: boolean;
  is_primary: boolean;
  is_fallback: boolean;
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AIProviderStats {
  provider_id: string;
  model_id: string;
  date: string;
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  avg_latency_ms: number;
  total_tokens_in: number;
  total_tokens_out: number;
  total_cost_usd: number;
}

export interface AIRoutingConfig {
  primaryModel: AIModel;
  fallbackModel: AIModel;
  providers: AIProvider[];
}

// ============================================================
// Provider Queries
// ============================================================

export async function fetchProviders(): Promise<AIProvider[]> {
  const { data, error } = await supabase
    .from('ai_providers')
    .select('*')
    .order('priority', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function fetchProvider(id: string): Promise<AIProvider | null> {
  const { data, error } = await supabase
    .from('ai_providers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function updateProvider(id: string, updates: Partial<AIProvider>): Promise<void> {
  const { error } = await supabase
    .from('ai_providers')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}

export async function toggleProvider(id: string, enabled: boolean): Promise<void> {
  const { error } = await supabase
    .from('ai_providers')
    .update({ enabled, status: enabled ? 'active' : 'disabled', updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}

export async function updateProviderPriority(id: string, priority: number): Promise<void> {
  const { error } = await supabase
    .from('ai_providers')
    .update({ priority, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}

// ============================================================
// Model Queries
// ============================================================

export async function fetchModels(): Promise<AIModel[]> {
  const { data, error } = await supabase
    .from('ai_models')
    .select('*')
    .order('provider_id', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function fetchModelsByProvider(providerId: string): Promise<AIModel[]> {
  const { data, error } = await supabase
    .from('ai_models')
    .select('*')
    .eq('provider_id', providerId)
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function fetchModel(id: string): Promise<AIModel | null> {
  const { data, error } = await supabase
    .from('ai_models')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function updateModel(id: string, updates: Partial<AIModel>): Promise<void> {
  const { error } = await supabase
    .from('ai_models')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}

export async function toggleModel(id: string, enabled: boolean): Promise<void> {
  const { error } = await supabase
    .from('ai_models')
    .update({ enabled, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}

export async function setPrimaryModel(modelId: string): Promise<void> {
  // First, clear all primary flags for this provider
  const model = await fetchModel(modelId);
  if (!model) throw new Error('Model not found');

  // Clear all primary flags for this provider
  const { error: clearError } = await supabase
    .from('ai_models')
    .update({ is_primary: false, updated_at: new Date().toISOString() })
    .eq('provider_id', model.provider_id)
    .eq('is_primary', true);

  if (clearError) throw clearError;

  // Set new primary
  const { error } = await supabase
    .from('ai_models')
    .update({ is_primary: true, enabled: true, updated_at: new Date().toISOString() })
    .eq('id', modelId);

  if (error) throw error;
}

export async function setFallbackModel(modelId: string): Promise<void> {
  const model = await fetchModel(modelId);
  if (!model) throw new Error('Model not found');

  // Clear all fallback flags for this provider
  const { error: clearError } = await supabase
    .from('ai_models')
    .update({ is_fallback: false, updated_at: new Date().toISOString() })
    .eq('provider_id', model.provider_id)
    .eq('is_fallback', true);

  if (clearError) throw clearError;

  // Set new fallback
  const { error } = await supabase
    .from('ai_models')
    .update({ is_fallback: true, enabled: true, updated_at: new Date().toISOString() })
    .eq('id', modelId);

  if (error) throw error;
}

// ============================================================
// Routing Config (for AI layer)
// ============================================================

export async function getRoutingConfig(): Promise<AIRoutingConfig> {
  // Get enabled providers ordered by priority
  const { data: providers, error: pError } = await supabase
    .from('ai_providers')
    .select('*')
    .eq('enabled', true)
    .order('priority', { ascending: true });

  if (pError) throw pError;

  // Get primary model
  const { data: primaryModel, error: pmError } = await supabase
    .from('ai_models')
    .select('*')
    .eq('is_primary', true)
    .eq('enabled', true)
    .single();

  if (pmError || !primaryModel) {
    // Fallback to first enabled model from highest priority provider
    const { data: firstModel, error: fmError } = await supabase
      .from('ai_models')
      .select('*')
      .eq('enabled', true)
      .order('provider_id', { ascending: true })
      .limit(1)
      .single();

    if (fmError || !firstModel) {
      throw new Error('No enabled AI models found');
    }

    return {
      primaryModel: firstModel,
      fallbackModel: firstModel,
      providers: providers || [],
    };
  }

  // Get fallback model
  const { data: fallbackModel, error: fmError } = await supabase
    .from('ai_models')
    .select('*')
    .eq('is_fallback', true)
    .eq('enabled', true)
    .single();

  return {
    primaryModel,
    fallbackModel: fallbackModel || primaryModel,
    providers: providers || [],
  };
}

// ============================================================
// Usage Stats
// ============================================================

export async function fetchUsageStats(days: number = 7): Promise<AIProviderStats[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('ai_usage_log')
    .select('*')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function fetchProviderStats(providerId: string, days: number = 7): Promise<AIProviderStats[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('ai_usage_log')
    .select('*')
    .eq('provider_id', providerId)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// ============================================================
// Helpers
// ============================================================

export function getProvidersForMap(providers: AIProvider[]): Map<string, AIProvider> {
  return new Map(providers.map(p => [p.id, p]));
}

export function getModelsForProvider(models: AIModel[], providerId: string): AIModel[] {
  return models.filter(m => m.provider_id === providerId);
}

export function getPrimaryModel(models: AIModel[]): AIModel | undefined {
  return models.find(m => m.is_primary && m.enabled);
}

export function getFallbackModel(models: AIModel[]): AIModel | undefined {
  return models.find(m => m.is_fallback && m.enabled);
}
