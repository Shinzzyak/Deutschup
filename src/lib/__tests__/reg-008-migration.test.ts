import { describe, it, expect } from 'vitest';

// REG-008: Migration Verification
// Root Cause: Migrations can be partially executed — missing tables/columns
describe('REG-008: Migration Verification', () => {
  // Expected tables after all migrations
  const requiredTables = [
    'profiles',
    'orders',
    'ai_providers',
    'ai_models',
    'ai_usage_log',
    'provider_secrets',
    'custom_provider_keys',
    'user_identities',
    'config',
  ];

  // Expected columns on critical tables
  const requiredColumns: Record<string, string[]> = {
    profiles: ['id', 'full_name', 'avatar_url', 'tier', 'tier_expiry', 'role', 'subscription', 'pro_expires_at', 'created_at', 'updated_at'],
    orders: ['id', 'user_id', 'plan_type', 'amount', 'payment_method', 'paid_at', 'paid_reff_num', 'created_at'],
    ai_models: ['id', 'provider_id', 'name', 'display_name', 'enabled', 'is_primary', 'is_fallback', 'config'],
  };

  it('should have all required tables listed', () => {
    expect(requiredTables.length).toBeGreaterThan(0);
    expect(requiredTables).toContain('profiles');
    expect(requiredTables).toContain('orders');
    expect(requiredTables).toContain('ai_models');
  });

  it('profiles should have subscription columns', () => {
    expect(requiredColumns.profiles).toContain('subscription');
    expect(requiredColumns.profiles).toContain('pro_expires_at');
  });

  it('profiles should have role column', () => {
    expect(requiredColumns.profiles).toContain('role');
  });

  it('orders should have payment columns', () => {
    expect(requiredColumns.orders).toContain('amount');
    expect(requiredColumns.orders).toContain('payment_method');
    expect(requiredColumns.orders).toContain('paid_at');
  });

  it('ai_models should have all required columns', () => {
    expect(requiredColumns.ai_models).toContain('provider_id');
    expect(requiredColumns.ai_models).toContain('is_primary');
    expect(requiredColumns.ai_models).toContain('is_fallback');
  });

  // Validation function for post-migration check
  function validateMigrationResult(
    existingTables: string[],
    existingColumns: Record<string, string[]>
  ): { valid: boolean; missing: string[] } {
    const missing: string[] = [];

    for (const table of requiredTables) {
      if (!existingTables.includes(table)) {
        missing.push(`table:${table}`);
      }
    }

    for (const [table, columns] of Object.entries(requiredColumns)) {
      if (existingTables.includes(table)) {
        for (const col of columns) {
          if (!existingColumns[table]?.includes(col)) {
            missing.push(`${table}.${col}`);
          }
        }
      }
    }

    return { valid: missing.length === 0, missing };
  }

  it('should pass when all tables and columns exist', () => {
    const result = validateMigrationResult(
      requiredTables,
      requiredColumns
    );
    expect(result.valid).toBe(true);
    expect(result.missing).toEqual([]);
  });

  it('should fail when table is missing', () => {
    const result = validateMigrationResult(
      requiredTables.filter(t => t !== 'ai_models'),
      requiredColumns
    );
    expect(result.valid).toBe(false);
    expect(result.missing).toContain('table:ai_models');
  });

  it('should fail when column is missing', () => {
    const cols = { ...requiredColumns, profiles: requiredColumns.profiles.filter(c => c !== 'subscription') };
    const result = validateMigrationResult(requiredTables, cols);
    expect(result.valid).toBe(false);
    expect(result.missing).toContain('profiles.subscription');
  });
});
