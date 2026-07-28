import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuthStore } from '../stores/authStore';
import { dbProxy } from '../lib/supabase';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  ArrowRight,
  ChevronLeft,
  GraduationCap,
  MessageCircle,
  Briefcase,
  Plane,
  Loader2,
} from 'lucide-react';

type Step = 'welcome' | 'goal' | 'ready';

/**
 * Why there is no "what is your level?" question any more.
 *
 * The level shown everywhere in the app comes from the server: progressStore
 * reads `currentLevel` out of get-progress, and the next level only opens when
 * the checkpoint before it is passed. The client cannot set it, and
 * `upsert-profile` (api/db-proxy.ts) accepts exactly three fields —
 * full_name, avatar_url, onboarding_completed. There is no column to write a
 * level or a goal into.
 *
 * So the old question could never have changed anything: whatever you picked,
 * you were dropped at A1 with lesson a1-1 unlocked. Asking and then ignoring is
 * worse than not asking, so the question is gone and the honest version of the
 * answer is printed on the last step instead.
 *
 * The goal question stays because the answer is used immediately and visibly:
 * it decides where the "Mulai dari sini" button sends you, and it is shown —
 * and editable — on the Profile page afterwards. It is stored in localStorage
 * under GOAL_STORAGE_KEY; Profile.tsx reads the same key.
 */
export const GOAL_STORAGE_KEY = 'deutschup_goal';

export interface LearningGoal {
  id: string;
  label: string;
  desc: string;
  icon: typeof GraduationCap;
  /** Where "Mulai dari sini" takes this user. Every path is a real route in App.tsx. */
  startPath: string;
  startLabel: string;
  /** One line explaining why that is the right first stop. */
  startReason: string;
}

export const GOALS: LearningGoal[] = [
  {
    id: 'exam',
    label: 'Persiapan ujian',
    desc: 'Goethe, TestDaF, atau sertifikasi lain',
    icon: GraduationCap,
    startPath: '/simulasi',
    startLabel: 'Simulasi Ujian',
    startReason: 'Kerjakan satu simulasi dulu supaya kamu tahu bagian mana yang masih goyah.',
  },
  {
    id: 'conversation',
    label: 'Percakapan',
    desc: 'Bisa ngobrol dengan orang Jerman',
    icon: MessageCircle,
    startPath: '/verbs',
    startLabel: 'Latihan Kata Kerja',
    startReason: 'Kata kerja adalah tulang punggung kalimat lisan — kuasai ini dulu, ngobrol jadi jauh lebih lancar.',
  },
  {
    id: 'career',
    label: 'Karier',
    desc: 'Untuk pekerjaan atau bisnis',
    icon: Briefcase,
    startPath: '/koreksi',
    startLabel: 'Koreksi Tulisan',
    startReason: 'Tulis email atau paragraf pendek, lalu biarkan dikoreksi — itu keterampilan yang paling cepat terpakai di kantor.',
  },
  {
    id: 'travel',
    label: 'Perjalanan',
    desc: 'Bepergian ke Jerman atau Austria',
    icon: Plane,
    startPath: '/vocab',
    startLabel: 'Latihan Kosakata',
    startReason: 'Mulai dari kosakata harian — itu yang paling sering kamu pakai di jalan.',
  },
];

/** Reads back the stored goal. Exported so Profile.tsx uses one definition. */
export function getStoredGoal(): LearningGoal | null {
  try {
    const id = localStorage.getItem(GOAL_STORAGE_KEY);
    return GOALS.find((g) => g.id === id) || null;
  } catch {
    return null;
  }
}

const STEPS: Step[] = ['welcome', 'goal', 'ready'];

export default function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState<Step>('welcome');
  const [goal, setGoal] = useState<LearningGoal | null>(null);
  const [finishing, setFinishing] = useState(false);
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  /**
   * Persist, then hand control back to App and go where the user chose.
   * A failed write is not surfaced: App also records completion in
   * localStorage, so the flow never repeats on this device either way.
   */
  const finish = async (destination: string) => {
    if (finishing) return;
    setFinishing(true);

    try {
      localStorage.setItem(GOAL_STORAGE_KEY, goal?.id || '');
    } catch {
      // Private-mode storage. The goal is a convenience, not a requirement.
    }

    if (user) {
      try {
        await dbProxy('upsert-profile', { userId: user.id, onboarding_completed: true });
      } catch (e) {
        console.error('[ONBOARDING] Failed to store completion flag:', e);
      }
    }

    onComplete();
    navigate(destination);
  };

  // One shared transition for every step. Reduced motion keeps the crossfade
  // but drops the horizontal travel.
  const slide = {
    initial: { opacity: 0, x: reduceMotion ? 0 : 40 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: reduceMotion ? 0 : -40 },
    transition: { duration: reduceMotion ? 0.15 : 0.3 },
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-cream px-4 py-12">
      <div className="w-full max-w-xl">
        <AnimatePresence mode="wait">
          {step === 'welcome' && (
            <motion.div key="welcome" {...slide}>
              <div className="mb-8 flex items-center gap-3">
                <div className="h-px w-12 bg-brand-rust" />
                <span className="text-xs font-bold tracking-[0.2em] text-brand-rust uppercase">
                  Selamat Datang
                </span>
              </div>

              <h1 className="font-serif text-4xl leading-[1.05] tracking-tight text-brand-ink sm:text-5xl">
                Mari mulai belajar
                <br />
                <span className="text-brand-rust italic">bahasa Jerman.</span>
              </h1>

              <p className="mt-6 text-lg leading-relaxed font-light text-ink-muted">
                Satu pertanyaan saja, lalu kami antarkan kamu ke latihan yang paling
                cocok. Kurang dari setengah menit.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => setStep('goal')}
                  className="group inline-flex items-center justify-center gap-2 bg-brand-ink px-8 py-4 text-base font-bold tracking-wide text-brand-cream transition-colors hover:bg-brand-rust"
                >
                  Mulai
                  <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>

                <button
                  type="button"
                  onClick={() => finish('/dashboard')}
                  disabled={finishing}
                  className="text-sm font-bold text-ink-muted underline-offset-4 transition-colors hover:text-brand-ink hover:underline disabled:opacity-60"
                >
                  Lewati untuk sekarang
                </button>
              </div>
            </motion.div>
          )}

          {step === 'goal' && (
            <motion.div key="goal" {...slide}>
              <button
                type="button"
                onClick={() => setStep('welcome')}
                className="mb-8 inline-flex items-center gap-1.5 text-sm font-bold text-ink-muted transition-colors hover:text-brand-ink"
              >
                <ChevronLeft aria-hidden="true" className="h-4 w-4" /> Kembali
              </button>

              <h2 className="font-serif text-3xl leading-tight tracking-tight text-brand-ink sm:text-4xl">
                Apa tujuan belajarmu?
              </h2>
              <p className="mt-3 text-base text-ink-muted">
                Pilih satu. Ini menentukan latihan mana yang kami buka lebih dulu — dan
                bisa kamu ubah kapan saja lewat halaman Profil.
              </p>

              {/* gap-px over ink draws the hairline rules between cells */}
              <div className="mt-8 grid gap-px border border-brand-ink bg-brand-ink sm:grid-cols-2">
                {GOALS.map((g) => {
                  const Icon = g.icon;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => {
                        setGoal(g);
                        setStep('ready');
                      }}
                      className="group bg-brand-cream p-5 text-left transition-colors hover:bg-brand-ink"
                    >
                      <Icon
                        aria-hidden="true"
                        className="mb-3 h-6 w-6 text-brand-rust transition-colors group-hover:text-brand-tan"
                      />
                      <div className="font-serif text-lg leading-tight text-brand-ink transition-colors group-hover:text-brand-cream">
                        {g.label}
                      </div>
                      <div className="mt-1 text-sm text-ink-subtle transition-colors group-hover:text-cream-muted">
                        {g.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 'ready' && goal && (
            <motion.div key="ready" {...slide}>
              <button
                type="button"
                onClick={() => setStep('goal')}
                className="mb-8 inline-flex items-center gap-1.5 text-sm font-bold text-ink-muted transition-colors hover:text-brand-ink"
              >
                <ChevronLeft aria-hidden="true" className="h-4 w-4" /> Ganti tujuan
              </button>

              <div className="mb-6 flex items-center gap-3">
                <div className="h-px w-12 bg-brand-rust" />
                <span className="text-xs font-bold tracking-[0.2em] text-brand-rust uppercase">
                  {goal.label}
                </span>
              </div>

              <h2 className="font-serif text-3xl leading-tight tracking-tight text-brand-ink sm:text-4xl">
                Kami sarankan mulai dari
                <br />
                <span className="text-brand-rust italic">{goal.startLabel}.</span>
              </h2>

              <p className="mt-5 text-base leading-relaxed text-ink-muted">
                {goal.startReason}
              </p>

              {/* The honest answer to the question we no longer ask. */}
              <div className="mt-8 border-l-2 border-brand-ink bg-brand-ink/5 p-5">
                <p className="text-sm leading-relaxed text-ink-muted">
                  Materi selalu dimulai dari <span className="font-bold text-brand-ink">A1</span>.
                  Kalau dasarmu sudah kuat, checkpoint tiap unit bisa kamu lewati cepat dan
                  level berikutnya langsung terbuka — jadi kamu tidak akan tertahan lama.
                </p>
              </div>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => finish(goal.startPath)}
                  disabled={finishing}
                  className="group inline-flex items-center justify-center gap-2 bg-brand-ink px-8 py-4 text-base font-bold tracking-wide text-brand-cream transition-colors hover:bg-brand-rust disabled:opacity-70"
                >
                  {finishing ? (
                    <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Mulai dari sini
                      <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => finish('/curriculum')}
                  disabled={finishing}
                  className="text-sm font-bold text-ink-muted underline-offset-4 transition-colors hover:text-brand-ink hover:underline disabled:opacity-60"
                >
                  Lihat semua materi dulu
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress rules — sharp bars, not dots */}
        <div className="mt-14 flex items-center gap-2" aria-hidden="true">
          {STEPS.map((s, i) => {
            const current = STEPS.indexOf(step);
            return (
              <div
                key={s}
                className={`h-0.5 flex-1 transition-colors ${
                  i < current ? 'bg-brand-rust' : i === current ? 'bg-brand-ink' : 'bg-brand-ink/15'
                }`}
              />
            );
          })}
        </div>
        <p className="mt-3 text-xs tracking-[0.15em] text-ink-subtle uppercase">
          Langkah {STEPS.indexOf(step) + 1} dari {STEPS.length}
        </p>
      </div>
    </div>
  );
}
