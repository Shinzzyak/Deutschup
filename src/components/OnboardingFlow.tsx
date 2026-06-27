import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Target, 
  GraduationCap, 
  ChevronRight, 
  ChevronLeft,
  Sparkles,
  MessageCircle,
  Briefcase,
  Plane
} from 'lucide-react';

type Step = 'welcome' | 'level' | 'goal';

const levels = [
  { id: 'A1', label: 'A1 — Pemula', desc: 'Baru mulai belajar Jerman', color: 'bg-[#2d8a4e]/10 text-green-700 border-[#2d8a4e]/20' },
  { id: 'A2', label: 'A2 — Dasar', desc: 'Bisa percakapan sederhana', color: 'bg-[#0a0a0a]/5 text-blue-700 border-[#0a0a0a]/20' },
  { id: 'B1', label: 'B1 — Menengah', desc: 'Bisa percakapan sehari-hari', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { id: 'B2', label: 'B2 — Lanjut', desc: 'Bisa diskusi kompleks', color: 'bg-[#0a0a0a]/5 text-purple-700 border-[#0a0a0a]/20' },
];

const goals = [
  { id: 'exam', label: 'Persiapan Ujian', desc: 'Goethe, TestDaF, atau sertifikasi lainnya', icon: GraduationCap },
  { id: 'conversation', label: 'Percakapan', desc: 'Bisa ngobrol dengan orang Jerman', icon: MessageCircle },
  { id: 'career', label: 'Karir', desc: 'Untuk pekerjaan atau bisnis', icon: Briefcase },
  { id: 'travel', label: 'Perjalanan', desc: 'Traveling ke Jerman atau Austria', icon: Plane },
];

export default function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState<Step>('welcome');
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  const handleComplete = () => {
    // Store onboarding preferences locally (profile update optional)
    if (selectedLevel) {
      localStorage.setItem('deutschup_level', selectedLevel);
    }
    if (selectedGoal) {
      localStorage.setItem('deutschup_goal', selectedGoal);
    }
    onComplete();
  };

  return (
    <div className="min-h-screen  from-slate-50 via-white to-amber-50/30 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <AnimatePresence mode="wait">
          {step === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="w-20 h-20  from-amber-400 to-amber-600  flex items-center justify-center mx-auto mb-6 ">
                <Sparkles className="w-10 h-10 bg-[#0a0a0a]" />
              </div>
              <h1 className="text-3xl font-bold text-[#0a0a0a] mb-3">
                Selamat Datang di Deutschup! 🇩🇪
              </h1>
              <p className="text-lg text-[#0a0a0a]/60 mb-8">
                Mari personalisasi pengalaman belajar kamu. 
                Hanya butuh 30 detik.
              </p>
              <button
                onClick={() => setStep('level')}
                className=" from-amber-500 to-amber-600 bg-[#0a0a0a] px-8 py-3.5  font-semibold text-lg hover:from-amber-600 hover:to-amber-700 transition-all  hover: flex items-center gap-2 mx-auto"
              >
                Mulai <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {step === 'level' && (
            <motion.div
              key="level"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <button
                onClick={() => setStep('welcome')}
                className="text-[#0a0a0a]/50 hover:text-[#0a0a0a]/70 flex items-center gap-1 mb-6 text-sm"
              >
                <ChevronLeft className="w-4 h-4" /> Kembali
              </button>
              <h2 className="text-2xl font-bold text-[#0a0a0a] mb-2">
                Level bahasa Jerman kamu? 🎯
              </h2>
              <p className="text-[#0a0a0a]/60 mb-6">
                Ini membantu kami menyesuaikan konten yang tepat.
              </p>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {levels.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setSelectedLevel(level.id)}
                    className={`p-4  border-2 text-left transition-all ${
                      selectedLevel === level.id
                        ? 'border-[#c8956c] bg-[#f5f0eb] '
                        : 'border-[#0a0a0a]/10 hover:border-[#0a0a0a]/30 bg-[#f5f0eb]'
                    }`}
                  >
                    <div className={`inline-block px-2 py-0.5  text-xs font-bold mb-2 ${level.color}`}>
                      {level.id}
                    </div>
                    <div className="font-semibold text-[#0a0a0a] text-sm">{level.label}</div>
                    <div className="text-xs text-[#0a0a0a]/50 mt-1">{level.desc}</div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => selectedLevel && setStep('goal')}
                disabled={!selectedLevel}
                className={`w-full py-3.5  font-semibold text-lg transition-all flex items-center justify-center gap-2 ${
                  selectedLevel
                    ? ' from-amber-500 to-amber-600 bg-[#0a0a0a] hover:from-amber-600 hover:to-amber-700 '
                    : 'bg-[#0a0a0a]/5 text-[#0a0a0a]/40 cursor-not-allowed'
                }`}
              >
                Lanjut <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {step === 'goal' && (
            <motion.div
              key="goal"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <button
                onClick={() => setStep('level')}
                className="text-[#0a0a0a]/50 hover:text-[#0a0a0a]/70 flex items-center gap-1 mb-6 text-sm"
              >
                <ChevronLeft className="w-4 h-4" /> Kembali
              </button>
              <h2 className="text-2xl font-bold text-[#0a0a0a] mb-2">
                Tujuan belajar kamu? 🚀
              </h2>
              <p className="text-[#0a0a0a]/60 mb-6">
                Kami akan rekomendasikan jalur belajar yang sesuai.
              </p>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {goals.map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => setSelectedGoal(goal.id)}
                    className={`p-4  border-2 text-left transition-all ${
                      selectedGoal === goal.id
                        ? 'border-[#c8956c] bg-[#f5f0eb] '
                        : 'border-[#0a0a0a]/10 hover:border-[#0a0a0a]/30 bg-[#f5f0eb]'
                    }`}
                  >
                    <goal.icon className={`w-6 h-6 mb-2 ${
                      selectedGoal === goal.id ? 'text-amber-600' : 'text-[#0a0a0a]/40'
                    }`} />
                    <div className="font-semibold text-[#0a0a0a] text-sm">{goal.label}</div>
                    <div className="text-xs text-[#0a0a0a]/50 mt-1">{goal.desc}</div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => selectedGoal && handleComplete()}
                disabled={!selectedGoal}
                className={`w-full py-3.5  font-semibold text-lg transition-all flex items-center justify-center gap-2 ${
                  selectedGoal
                    ? ' from-amber-500 to-amber-600 bg-[#0a0a0a] hover:from-amber-600 hover:to-amber-700 '
                    : 'bg-[#0a0a0a]/5 text-[#0a0a0a]/40 cursor-not-allowed'
                }`}
              >
                Selesai <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mt-8">
          {['welcome', 'level', 'goal'].map((s, i) => (
            <div
              key={s}
              className={`w-2 h-2  transition-all ${
                s === step ? 'bg-[#f5f0eb]0 w-6' : 
                ['welcome', 'level', 'goal'].indexOf(step) > i ? 'bg-[#c8956c]/80' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
