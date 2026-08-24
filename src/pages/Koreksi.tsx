import { useRef, useState } from 'react';
import { Link } from 'react-router';
import { AlertCircle, ArrowRight, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';
import { authedFetch } from '../lib/auth-headers';

/** Soft cap. Longer inputs make the model drift into essay feedback and burn
 *  the per-minute rate limit for a result nobody reads. */
const MAX_CHARS = 500;

type Correction = {
  isPerfect: boolean;
  correctedSentence: string;
  explanation: string;
};

type Failure = {
  /** Already written for a human — comes from the API when it has something to say. */
  message: string;
  /** Free-tier ceiling reached: the way out is the pricing page, not a retry. */
  isQuota: boolean;
  resetLabel: string | null;
};

/** Wall-clock label for a quota reset timestamp, in Indonesian. */
function formatReset(resetAt?: number): string | null {
  if (typeof resetAt !== 'number' || !Number.isFinite(resetAt)) return null;
  const at = new Date(resetAt);
  if (Number.isNaN(at.getTime())) return null;
  const time = at.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  if (at.toDateString() === new Date().toDateString()) return `pukul ${time}`;
  const day = at.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });
  return `${day} pukul ${time}`;
}

/**
 * api/ai.ts already writes warm Indonesian error copy (quota text, "Herr Deutsch
 * sedang istirahat sebentar", the AI-off notice). Read it and show it; only fall
 * back to our own wording when the response carries nothing usable.
 */
function toFailure(status: number, payload: any): Failure {
  const serverMessage = typeof payload?.error === 'string' && payload.error.trim() ? payload.error.trim() : null;
  const isQuota = status === 402 || payload?.code === 'QUOTA_EXCEEDED';
  if (serverMessage) {
    return { message: serverMessage, isQuota, resetLabel: formatReset(payload?.resetAt) };
  }
  if (status === 401) {
    return { message: 'Sesi kamu sudah berakhir. Muat ulang halaman ini lalu masuk lagi, ya.', isQuota: false, resetLabel: null };
  }
  if (status === 429) {
    return { message: 'Terlalu banyak permintaan berturut-turut. Tunggu sekitar satu menit, lalu coba lagi.', isQuota: false, resetLabel: null };
  }
  return { message: 'Herr Deutsch belum bisa menjawab sekarang. Coba lagi sebentar lagi, ya.', isQuota, resetLabel: null };
}

export default function Koreksi() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Correction | null>(null);
  const [failure, setFailure] = useState<Failure | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const tooLong = input.length > MAX_CHARS;
  const canSubmit = !!input.trim() && !tooLong && !loading;

  const handleKoreksi = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setResult(null);
    setFailure(null);

    try {
      const resp = await authedFetch('/api/ai?action=koreksi-kalimat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sentence: input.trim() })
      });

      const data = await resp.json().catch(() => null);

      // The old version pushed the response into `result` no matter what it was,
      // so an error payload rendered as a German correction the student trusted.
      if (!resp.ok) {
        setFailure(toFailure(resp.status, data));
        return;
      }

      const explanation = typeof data?.explanation === 'string' ? data.explanation.trim() : '';
      if (!explanation) {
        setFailure({
          message: 'Jawaban dari Herr Deutsch datang tidak lengkap, jadi tidak kami tampilkan agar tidak menyesatkan. Coba kirim kalimatnya sekali lagi.',
          isQuota: false,
          resetLabel: null,
        });
        return;
      }

      setResult({
        isPerfect: data.isPerfect === true,
        correctedSentence: typeof data.correctedSentence === 'string' ? data.correctedSentence.trim() : '',
        explanation,
      });
    } catch (e) {
      console.error('[KOREKSI] request failed:', e);
      setFailure({
        message: 'Koneksi ke Herr Deutsch terputus. Periksa jaringanmu, lalu coba lagi — kalimatmu masih ada di kotak tulis.',
        isQuota: false,
        resetLabel: null,
      });
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl/Cmd + Enter submits — the whole page is one textarea and one button.
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleKoreksi();
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-20">
      {/* Header */}
      <div className="mb-10 border-l-4 border-brand-rust pl-5 md:pl-6">
        <p className="mb-2 text-xs font-bold tracking-[0.18em] text-brand-rust uppercase">Bantuan menulis</p>
        <h1 className="mb-3 flex items-center gap-3 font-serif text-3xl font-bold tracking-tight text-brand-ink md:text-4xl">
          <Sparkles className="h-7 w-7 shrink-0 text-brand-rust" aria-hidden="true" />
          <span>Koreksi kalimat</span>
        </h1>
        <p className="max-w-xl text-lg text-ink-muted">
          Tulis satu kalimat bahasa Jerman. Herr Deutsch memeriksa artikel, kata kerja, dan susunannya,
          lalu menjelaskan alasannya dalam bahasa Indonesia.
        </p>
        <p className="mt-3 text-sm text-ink-subtle">
          Gratis untuk semua pengguna — tidak ada jatah harian. Cukup beri jeda sebentar antar pemeriksaan.
        </p>
      </div>

      {/* Composer */}
      <div className="mb-8 border border-brand-ink/12 bg-white p-6 md:p-8">
        <label htmlFor="sentence" className="mb-3 block text-sm font-bold tracking-wide text-brand-ink uppercase">
          Kalimatmu
        </label>
        <textarea
          id="sentence"
          name="sentence"
          ref={textareaRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Misal: Ich habe einen Auto gekauft."
          aria-describedby="sentence-counter"
          aria-invalid={tooLong}
          className={cn(
            'mb-3 min-h-[140px] w-full resize-none border bg-brand-cream/40 p-4 text-lg leading-relaxed text-brand-ink transition-colors',
            'placeholder:text-ink-subtle focus:border-brand-rust focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-rust/25',
            // WCAG 1.4.11: a text field's border is the only thing that marks it
            // as a control, so it needs 3:1 against both the field fill and the
            // page. brand-ink/15 (#dadada) was 1.33:1 against the cream/40 fill.
            // ink-subtle is 4.89:1 there and matches the FIELD constant that
            // VerbTrainer/VocabTrainerDB already use for their inputs.
            tooLong ? 'border-brand-rust' : 'border-ink-subtle'
          )}
        />

        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
          <p id="sentence-counter" className={cn('text-sm', tooLong ? 'font-bold text-brand-rust' : 'text-ink-subtle')}>
            {tooLong
              ? `Kepanjangan — kurangi ${input.length - MAX_CHARS} huruf lagi (maksimal ${MAX_CHARS}).`
              : `${input.length} / ${MAX_CHARS} huruf`}
          </p>
          <p className="text-sm text-ink-subtle">
            Tekan <kbd className="border border-brand-ink/20 bg-brand-cream px-1.5 py-0.5 font-mono text-xs text-brand-ink">Ctrl</kbd>
            {' + '}
            <kbd className="border border-brand-ink/20 bg-brand-cream px-1.5 py-0.5 font-mono text-xs text-brand-ink">Enter</kbd> untuk memeriksa
          </p>
        </div>

        <Button
          onClick={handleKoreksi}
          disabled={!canSubmit}
          size="lg"
          className="h-14 w-full bg-brand-ink px-8 text-base font-bold tracking-wide text-brand-cream transition-colors hover:bg-brand-rust sm:w-auto"
        >
          {loading ? (
            <><Loader2 className="mr-3 h-5 w-5 animate-spin" aria-hidden="true" /> Sedang diperiksa…</>
          ) : (
            'Periksa kalimat'
          )}
        </Button>
      </div>

      {/* Failure — never dressed up as a correction */}
      <div aria-live="polite">
        {failure && (
          <div className="border border-brand-rust/25 border-l-4 border-l-brand-rust bg-brand-rust/5 p-6 md:p-8">
            <div className="flex gap-4">
              <AlertCircle className="mt-0.5 h-6 w-6 shrink-0 text-brand-rust" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <h2 className="mb-2 font-serif text-xl font-bold text-brand-ink">
                  {failure.isQuota ? 'Jatah gratismu sudah habis' : 'Koreksi belum bisa ditampilkan'}
                </h2>
                <p className="text-base leading-relaxed text-ink-muted">{failure.message}</p>
                {failure.resetLabel && (
                  <p className="mt-2 text-sm text-ink-subtle">Jatah berikutnya terbuka {failure.resetLabel}.</p>
                )}
                <div className="mt-5 flex flex-wrap gap-3">
                  {failure.isQuota ? (
                    <Button
                      render={<Link to="/pricing" />}
                      className="h-11 bg-brand-rust px-6 font-bold text-brand-cream hover:bg-brand-ink"
                    >
                      Lihat paket Pro <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleKoreksi}
                      disabled={!canSubmit}
                      className="h-11 bg-brand-ink px-6 font-bold text-brand-cream hover:bg-brand-rust"
                    >
                      Coba lagi
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    onClick={() => { setFailure(null); textareaRef.current?.focus(); }}
                    className="h-11 px-4 text-ink-muted hover:text-brand-ink"
                  >
                    Ubah kalimat
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
            <div
              className={cn(
                'border border-l-4 p-6 md:p-8',
                result.isPerfect
                  ? 'border-brand-green/25 border-l-brand-green bg-brand-green/10'
                  : 'border-brand-rust/25 border-l-brand-rust bg-brand-rust/5'
              )}
            >
              <div className="flex flex-col gap-6 sm:flex-row">
                <div className="shrink-0">
                  {result.isPerfect ? (
                    <CheckCircle2 className="h-10 w-10 text-brand-green" aria-hidden="true" />
                  ) : (
                    <AlertCircle className="h-10 w-10 text-brand-rust" aria-hidden="true" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="mb-1 font-serif text-2xl font-bold text-brand-ink">
                    {result.isPerfect ? 'Sudah tepat' : 'Masih bisa dirapikan'}
                  </h2>
                  <p className="mb-5 text-sm text-ink-subtle">
                    {result.isPerfect
                      ? 'Kalimatmu sudah benar secara tata bahasa.'
                      : 'Ada bagian yang perlu diperbaiki. Versi rapinya di bawah ini.'}
                  </p>

                  {!result.isPerfect && result.correctedSentence && (
                    <div className="mb-6 border-l-2 border-brand-ink/20 bg-white/70 py-3 pl-4">
                      <p className="mb-1 text-xs font-bold tracking-[0.14em] text-ink-subtle uppercase">Versi yang benar</p>
                      <p className="font-serif text-xl leading-snug text-brand-ink md:text-2xl">{result.correctedSentence}</p>
                    </div>
                  )}

                  <div className="text-base leading-relaxed text-ink-muted [&_code]:bg-brand-ink/5 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm [&_code]:text-brand-ink [&_em]:italic [&_li]:mb-1 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_p:last-child]:mb-0 [&_p]:mb-3 [&_strong]:font-bold [&_strong]:text-brand-ink [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5">
                    <ReactMarkdown>{result.explanation}</ReactMarkdown>
                  </div>

                  <Button
                    variant="ghost"
                    onClick={() => { setResult(null); setInput(''); textareaRef.current?.focus(); }}
                    className="mt-6 h-11 px-4 text-ink-muted hover:text-brand-ink"
                  >
                    Periksa kalimat lain
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
