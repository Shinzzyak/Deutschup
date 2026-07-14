import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const identitySource = new URL('../clerk/identity.ts', import.meta.url);
const migration = new URL('../../../supabase/migrations/20260714160000_lock_identity_rpc_and_config.sql', import.meta.url);

describe('identity RPC least privilege', () => {
  it('resolves the current identity through the verified server session', () => {
    const source = readFileSync(identitySource, 'utf8');
    expect(source).toContain("dbProxy('get-session')");
    expect(source).not.toContain('supabase.rpc');
  });

  it('ships a versioned migration that removes public execution from identity RPCs', () => {
    expect(existsSync(migration)).toBe(true);
    const sql = readFileSync(migration, 'utf8');
    for (const fn of ['resolve_user_id(text)', 'resolve_clerk_id(uuid)', 'upsert_user_identity(text, text)']) {
      expect(sql).toContain(`REVOKE ALL ON FUNCTION public.${fn} FROM PUBLIC`);
      expect(sql).toContain(`GRANT EXECUTE ON FUNCTION public.${fn} TO service_role`);
    }
  });
});
