import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { getAuthHeaders } from '../../lib/auth-headers';
import { useToast } from '../ui/toast';
import {
  AdminNotice,
  BTN_QUIET,
  StatusChip,
  TAP,
  networkMessage,
  readError,
  type Tone,
} from './AdminUI';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

interface ValidateSecretModalProps {
  providerId: string;
  providerName: string;
  onClose: () => void;
}

type RuntimeStatus =
  | 'ACTIVE'
  | 'MISSING_KEY'
  | 'INVALID_KEY'
  | 'UNREACHABLE'
  | 'RATE_LIMITED'
  | 'DISABLED';

const VERDICT: Record<RuntimeStatus, { tone: Tone; label: string; hint: string }> = {
  ACTIVE: {
    tone: 'ok',
    label: 'Kunci berfungsi',
    hint: 'Provider menjawab permintaan uji dengan normal.',
  },
  MISSING_KEY: {
    tone: 'warn',
    label: 'Kunci kosong',
    hint: 'Belum ada kunci tersimpan untuk provider ini. Pasang kuncinya dulu.',
  },
  RATE_LIMITED: {
    tone: 'warn',
    label: 'Kena batas',
    hint: 'Kuota provider sedang penuh. Tunggu beberapa saat, lalu periksa lagi.',
  },
  INVALID_KEY: {
    tone: 'bad',
    label: 'Kunci ditolak',
    hint: 'Provider menolak kunci yang tersimpan. Ganti dengan kunci baru.',
  },
  UNREACHABLE: {
    tone: 'bad',
    label: 'Tak terjangkau',
    hint: 'Alamat provider tidak menjawab. Cek URL-nya atau coba lagi nanti.',
  },
  DISABLED: {
    tone: 'idle',
    label: 'Dimatikan',
    hint: 'Provider ini sengaja dimatikan, jadi kuncinya tidak dipakai.',
  },
};

/* The store's `validateSecret()` can never reach a verdict — it cannot read a
   secret value back out of the API, so it returns `{ valid: false }` with a
   developer note for EVERY provider. This modal used to render that as a red
   "Invalid", telling the owner a perfectly good key was broken. The real check
   runs server-side; this now calls it directly, the same endpoint the AI panel
   uses for its Periksa button. */

export default function ValidateSecretModal({
  providerId,
  providerName,
  onClose,
}: ValidateSecretModalProps) {
  const [validating, setValidating] = useState(true);
  const [status, setStatus] = useState<RuntimeStatus | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [detail, setDetail] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setValidating(true);
      setFailure(null);
      try {
        const headers = await getAuthHeaders(true);
        const res = await fetch('/api/admin-ai?action=validate-provider', {
          method: 'POST',
          headers,
          body: JSON.stringify({ provider_id: providerId }),
        });
        if (cancelled) return;

        if (!res.ok) {
          const message = await readError(res, 'Pemeriksaan tidak bisa dijalankan.');
          if (cancelled) return;
          setFailure(message);
          toast({
            title: `${providerName} gagal diperiksa`,
            description: message,
            variant: 'error',
          });
          return;
        }

        const data = await res.json().catch(() => null);
        if (cancelled) return;

        // A 200 only means the check ran; the verdict is inside the payload.
        const verdict: RuntimeStatus | undefined = data?.runtime_status;
        if (!verdict || !VERDICT[verdict]) {
          const message = 'Server menjawab, tapi hasil pemeriksaannya tidak terbaca.';
          setFailure(message);
          toast({
            title: `${providerName} belum bisa dipastikan`,
            description: message,
            variant: 'error',
          });
          return;
        }

        setStatus(verdict);
        setLatency(typeof data.latency_ms === 'number' ? data.latency_ms : null);
        setDetail(typeof data.error_message === 'string' ? data.error_message : null);
        toast({
          title: `${providerName}: ${VERDICT[verdict].label}`,
          description: VERDICT[verdict].hint,
          variant: verdict === 'ACTIVE' ? 'success' : verdict === 'DISABLED' ? 'info' : 'error',
        });
      } catch (e) {
        console.error('Validate secret failed:', e);
        if (cancelled) return;
        const message = networkMessage();
        setFailure(message);
        toast({
          title: `${providerName} gagal diperiksa`,
          description: message,
          variant: 'error',
        });
      } finally {
        if (!cancelled) setValidating(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [providerId, providerName, toast]);

  const verdict = status ? VERDICT[status] : null;

  return (
    <Dialog
      open
      onOpenChange={(open: boolean) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="bg-white! rounded-none! border-brand-ink/15! sm:max-w-md"
      >
        <DialogHeader>
          <DialogTitle className="font-heading text-xl text-brand-ink">
            Periksa kunci {providerName}
          </DialogTitle>
          <DialogDescription className="text-ink-muted">
            Kunci tersimpan dicoba langsung ke provider dari server.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          {validating && (
            <div className="flex items-center gap-3 py-6">
              <Loader2 className="w-5 h-5 animate-spin text-brand-rust" aria-hidden="true" />
              <p className="text-sm text-ink-muted">Sedang mencoba kunci ke provider…</p>
            </div>
          )}

          {!validating && failure && (
            <AdminNotice tone="bad" title="Pemeriksaan tidak selesai">
              {failure}
            </AdminNotice>
          )}

          {!validating && !failure && verdict && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {verdict.tone === 'ok' && (
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-[#1a6b3d]" aria-hidden="true" />
                )}
                <StatusChip tone={verdict.tone}>{verdict.label}</StatusChip>
                {latency != null && (
                  <span className="text-xs text-ink-muted tabular-nums">{latency} ms</span>
                )}
              </div>
              <p className="text-sm text-ink-muted">{verdict.hint}</p>
              {detail && (
                <div className="bg-[#f6e8e3] border border-[#e0bfb2] px-3 py-2 text-xs text-[#8b2500]">
                  <p className="font-semibold">Pesan dari provider</p>
                  <p className="font-mono break-all mt-0.5">{detail}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className={`${BTN_QUIET} ${TAP} px-4`}>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
