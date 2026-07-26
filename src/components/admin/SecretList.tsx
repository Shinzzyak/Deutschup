import { useEffect } from 'react';
import { Loader2, RefreshCw, ShieldCheck } from 'lucide-react';
import { useAISecretsStore } from '../../stores/aiSecretsStore';
import SecretCard from './SecretCard';
import { AdminNotice, BTN_QUIET, TAP } from './AdminUI';
import { Button } from '../ui/button';

/* Light-native. The old copy leaned on dark-theme colours that never got a
   dark backdrop: text-red-400 (#ff6467) measured 2.89:1 on the white card and
   text-blue-300 (#8ec5ff) measured 1.81:1. Both are replaced by the shared
   admin tone ramp, which is measured against the surface it sits on. */

export default function SecretList() {
  const { providers, loading, error, fetchProviders } = useAISecretsStore();

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  if (loading && providers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-10">
        <Loader2 className="w-6 h-6 animate-spin text-brand-rust" aria-hidden="true" />
        <p className="text-sm text-ink-muted">Memuat daftar provider…</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-heading text-xl text-brand-ink">Kredensial Provider</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchProviders}
          disabled={loading}
          className={`${BTN_QUIET} ${TAP} gap-2 px-4`}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
          {loading ? 'Memuat…' : 'Muat ulang'}
        </Button>
      </div>

      {error && (
        <AdminNotice tone="bad" title="Daftar provider belum tampil">
          {error}{' '}
          <button onClick={fetchProviders} className="underline font-medium text-[#8b2500]">
            Coba lagi
          </button>
        </AdminNotice>
      )}

      <AdminNotice tone="info" title="Kunci disimpan di server">
        Kunci API tersimpan di basis data dengan proteksi RLS dan tidak pernah ditampilkan
        utuh lagi setelah disimpan.
      </AdminNotice>

      {providers.length > 0 ? (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-px bg-brand-ink/12 border border-brand-ink/12">
          {providers.map((provider) => (
            <li key={provider.id} className="bg-white">
              <SecretCard provider={provider} />
            </li>
          ))}
        </ul>
      ) : (
        !loading && (
          <div className="bg-white border border-brand-ink/12 px-4 py-10 text-center">
            <ShieldCheck className="w-8 h-8 text-ink-subtle mx-auto mb-3" aria-hidden="true" />
            <p className="text-sm font-medium text-brand-ink">Belum ada provider terdaftar</p>
            <p className="text-sm text-ink-muted mt-1">Tambahkan provider lewat tab Tambahan.</p>
          </div>
        )
      )}
    </div>
  );
}
