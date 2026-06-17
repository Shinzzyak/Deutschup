import { motion } from 'motion/react';
import { MessageSquare, BookOpen, GraduationCap, BarChart3, PenLine, Check } from 'lucide-react';

const features = [
  { icon: MessageSquare, label: 'AI Tutor' },
  { icon: BookOpen, label: 'Structured Curriculum' },
  { icon: GraduationCap, label: 'Goethe-style Learning' },
  { icon: BarChart3, label: 'Progress Tracking' },
  { icon: PenLine, label: 'Smart Corrections' },
];

export default function SocialProof() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
            Platform yang Dirancang untuk{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Hasil
            </span>
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Fitur yang benar-benar membantu kamu belajar — bukan janji kosong.
          </p>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 max-w-4xl mx-auto">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex items-center gap-4 bg-slate-50 hover:bg-white rounded-2xl p-5 border border-transparent hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-50 transition-all"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span className="text-sm font-semibold text-slate-700">{feature.label}</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom trust line */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center text-sm text-slate-400 mt-10"
        >
          Dirancang oleh pengembang yang memahami kebutuhan belajar bahasa Jerman.
        </motion.p>
      </div>
    </section>
  );
}
