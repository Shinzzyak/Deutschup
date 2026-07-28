import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAISecretsStore } from '../../stores/aiSecretsStore';
import { useToast } from '../ui/toast';
import { AdminNotice, BTN_QUIET, FIELD_LABEL, INPUT, TAP } from './AdminUI';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

interface AddSecretModalProps {
  providerId: string;
  providerName: string;
  onClose: () => void;
}

/** Turns whatever the store parked in `error` into a sentence worth reading. */
function humanize(raw: unknown): string {
  const text = typeof raw === 'string' ? raw.trim() : '';
  if (!text) return 'Kunci ditolak server. Periksa kuncinya, lalu coba lagi.';
  if (/^HTTP 40[13]$/.test(text)) {
    return 'Sesi admin tidak diterima. Muat ulang halaman lalu masuk lagi.';
  }
  if (/^HTTP 4\d\d$/.test(text)) return 'Server menolak kunci ini.';
  if (/^HTTP 5\d\d$/.test(text)) return 'Server sedang bermasalah. Coba lagi sebentar lagi.';
  if (/Failed to fetch|NetworkError|Load failed/i.test(text)) {
    return 'Tidak bisa menghubungi server. Periksa koneksi internet, lalu coba lagi.';
  }
  const looksTechnical =
    text.length > 160 || /error:|Error:|undefined|\bnull\b|\bat\s.+:\d+|[{}<>]/.test(text);
  return looksTechnical ? 'Kunci ditolak server. Periksa kuncinya, lalu coba lagi.' : text;
}

export default function AddSecretModal({ providerId, providerName, onClose }: AddSecretModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addSecret = useAISecretsStore((s) => s.addSecret);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!apiKey.trim()) {
      setError('Kunci API belum diisi.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await addSecret(providerId, 'api_key', apiKey.trim());

      // The store catches its own failures and parks the message in state
      // instead of rethrowing, so awaiting it without incident proves nothing:
      // this modal used to print "API key saved successfully" for a rejected
      // key every single time. Read the store back for the real verdict.
      const storeError = useAISecretsStore.getState().error;
      if (storeError) {
        const message = humanize(storeError);
        setError(message);
        toast({ title: 'Kunci belum tersimpan', description: message, variant: 'error' });
        return;
      }

      toast({
        title: `Kunci ${providerName} tersimpan`,
        description: 'Tekan Periksa kunci untuk memastikan kuncinya diterima provider.',
        variant: 'success',
      });
      onClose();
    } catch (err) {
      console.error('Add secret failed:', err);
      const message = humanize((err as { message?: unknown } | null)?.message);
      setError(message);
      toast({ title: 'Kunci belum tersimpan', description: message, variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open
      onOpenChange={(open: boolean) => {
        if (!open && !loading) onClose();
      }}
    >
      {/* `.glass-heavy` on DialogContent is declared outside every cascade
          layer, so a plain `bg-white` utility loses to it. The `!` postfix is
          the only way to win that fight without editing the shared stylesheet. */}
      <DialogContent
        showCloseButton={false}
        className="bg-white! rounded-none! border-brand-ink/15! sm:max-w-md"
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="font-heading text-xl text-brand-ink">
              Kunci API {providerName}
            </DialogTitle>
            <DialogDescription className="text-ink-muted">
              Kunci disimpan di server dan tidak pernah ditampilkan utuh lagi setelah tersimpan.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            <label className={FIELD_LABEL} htmlFor="secret-api-key">
              Kunci API
            </label>
            <input
              type="password"
              id="secret-api-key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className={INPUT}
              placeholder="Tempel kunci API di sini…"
              autoFocus
              aria-invalid={!!error}
            />
          </div>

          {error && (
            <AdminNotice tone="bad" title="Belum tersimpan" className="mt-3">
              {error}
            </AdminNotice>
          )}

          <DialogFooter className="mt-5">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={loading}
              className={`${BTN_QUIET} ${TAP} px-4`}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading || !apiKey.trim()} className={`${TAP} gap-2 px-4`}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : null}
              {loading ? 'Menyimpan…' : 'Simpan kunci'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
