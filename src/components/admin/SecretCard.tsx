import { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { type ProviderStatus } from '../../stores/aiSecretsStore';
import AddSecretModal from './AddSecretModal';
import ValidateSecretModal from './ValidateSecretModal';
import { BTN_QUIET, StatusChip, TAP, type Tone } from './AdminUI';
import { Button } from '../ui/button';

interface SecretCardProps {
  provider: ProviderStatus;
}

/* Every status pairs a tone with an Indonesian word, so the state never rests
   on colour alone. The old map used dark-theme values on a white card:
   text-green-300 (#7bf1a8) measured 1.40:1, text-yellow-300 (#ffdf20) 1.33:1
   and text-red-300 (#ffa2a2) 1.92:1 — all far under the 4.5:1 floor. */
const STATUS: Record<ProviderStatus['status'], { tone: Tone; label: string }> = {
  active: { tone: 'ok', label: 'Aktif' },
  missing_key: { tone: 'warn', label: 'Kunci kosong' },
  invalid: { tone: 'bad', label: 'Kunci ditolak' },
  disabled: { tone: 'idle', label: 'Dimatikan' },
};

const SOURCE_LABEL: Record<ProviderStatus['source'], string> = {
  database: 'Basis data',
  environment: 'Variabel server',
  none: 'Belum ada',
};

export default function SecretCard({ provider }: SecretCardProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showValidateModal, setShowValidateModal] = useState(false);

  const status = STATUS[provider.status] ?? STATUS.disabled;

  return (
    <>
      <article className="p-4 h-full flex flex-col">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <h4 className="font-heading text-xl text-brand-ink leading-tight truncate">
              {provider.name}
            </h4>
            <p className="text-xs text-ink-muted mt-0.5">Urutan pakai: {provider.priority}</p>
          </div>
          <StatusChip tone={status.tone} className="shrink-0">
            {status.label}
          </StatusChip>
        </div>

        <dl className="text-sm space-y-1.5 mb-4">
          <div className="flex gap-2">
            <dt className="text-ink-muted w-24 shrink-0">Sumber</dt>
            <dd className="text-brand-ink min-w-0 break-words">{SOURCE_LABEL[provider.source]}</dd>
          </div>
          {provider.maskedKey && (
            <div className="flex gap-2">
              <dt className="text-ink-muted w-24 shrink-0">Kunci</dt>
              <dd className="min-w-0">
                <code className="bg-brand-cream px-2 py-0.5 text-xs font-mono text-brand-ink break-all">
                  {provider.maskedKey}
                </code>
              </dd>
            </div>
          )}
          {provider.lastValidated && (
            <div className="flex gap-2">
              <dt className="text-ink-muted w-24 shrink-0">Diperiksa</dt>
              <dd className="text-brand-ink min-w-0">
                {new Date(provider.lastValidated).toLocaleDateString('id-ID', {
                  dateStyle: 'medium',
                })}
              </dd>
            </div>
          )}
        </dl>

        <div className="flex flex-wrap gap-2 mt-auto">
          <Button onClick={() => setShowAddModal(true)} className={`${TAP} gap-2 px-4`}>
            <KeyRound className="w-4 h-4" aria-hidden="true" />
            {provider.status === 'missing_key' ? 'Pasang kunci' : 'Ganti kunci'}
          </Button>
          {provider.status !== 'missing_key' && (
            <Button
              variant="ghost"
              onClick={() => setShowValidateModal(true)}
              className={`${BTN_QUIET} ${TAP} px-4`}
            >
              Periksa kunci
            </Button>
          )}
        </div>
      </article>

      {showAddModal && (
        <AddSecretModal
          providerId={provider.id}
          providerName={provider.name}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {showValidateModal && (
        <ValidateSecretModal
          providerId={provider.id}
          providerName={provider.name}
          onClose={() => setShowValidateModal(false)}
        />
      )}
    </>
  );
}
