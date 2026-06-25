import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, CheckCircle2, XCircle, ArrowRight, RotateCcw, 
  Trophy, Target, Brain, ChevronDown, ChevronUp 
} from 'lucide-react';
import { goetheExamQuestions, examLevels, examSections, ExamQuestion } from '../data/goethe-exam-questions';

type Level = 'a1' | 'a2' | 'b1' | 'b2';

export default function GoetheExam() {
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<Record<string, string>>({});
  const [examComplete, setExamComplete] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const filteredQuestions = selectedLevel 
    ? goetheExamQuestions.filter(q => q.level === selectedLevel)
    : [];

  const currentQ = filteredQuestions[currentQuestion];

  const handleAnswer = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
    setShowResult(true);
    setAnswered(prev => ({ ...prev, [currentQ.id]: answer }));
    if (answer === currentQ.correctAnswer) {
      setScore(prev => prev + currentQ.points);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < filteredQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setExamComplete(true);
    }
  };

  const resetExam = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAnswered({});
    setExamComplete(false);
  };

  const totalPoints = filteredQuestions.reduce((sum, q) => sum + q.points, 0);
  const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;

  // Level Selection Screen
  if (!selectedLevel) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">🎯 Goethe Prüfung Simulator</h1>
          <p className="text-slate-400">Pilih level untuk memulai simulasi ujian</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {examLevels.map((level) => {
            const levelQuestions = goetheExamQuestions.filter(q => q.level === level.id);
            return (
              <motion.button
                key={level.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedLevel(level.id as Level)}
                className={`p-6 rounded-2xl border-2 text-left transition-all ${
                  level.color === 'green' ? 'border-green-500/30 bg-green-500/5 hover:border-green-500/60' :
                  level.color === 'blue' ? 'border-blue-500/30 bg-blue-500/5 hover:border-blue-500/60' :
                  level.color === 'purple' ? 'border-purple-500/30 bg-purple-500/5 hover:border-purple-500/60' :
                  'border-red-500/30 bg-red-500/5 hover:border-red-500/60'
                }`}
              >
                <div className="text-3xl mb-2">{level.icon}</div>
                <h3 className="text-xl font-bold">{level.name}</h3>
                <p className="text-sm text-slate-400 mt-1">{level.description}</p>
                <p className="text-xs text-slate-500 mt-2">{levelQuestions.length} soal tersedia</p>
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }

  // Exam Complete Screen
  if (examComplete) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700"
        >
          <Trophy className="w-16 h-16 mx-auto text-amber-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Selesai! 🎉</h2>
          <p className="text-slate-400 mb-6">Level {selectedLevel?.toUpperCase()}</p>
          
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-700/50 rounded-xl p-4">
              <p className="text-3xl font-bold text-amber-400">{score}</p>
              <p className="text-xs text-slate-400">Poin</p>
            </div>
            <div className="bg-slate-700/50 rounded-xl p-4">
              <p className="text-3xl font-bold text-blue-400">{percentage}%</p>
              <p className="text-xs text-slate-400">Benar</p>
            </div>
            <div className="bg-slate-700/50 rounded-xl p-4">
              <p className="text-3xl font-bold text-green-400">{Object.keys(answered).length}</p>
              <p className="text-xs text-slate-400">Dijawab</p>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={resetExam}
              className="flex items-center gap-2 px-6 py-3 bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> Ulangi
            </button>
            <button
              onClick={() => setSelectedLevel(null)}
              className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-black rounded-xl hover:bg-amber-400 transition-colors font-medium"
            >
              <Target className="w-4 h-4" /> Ganti Level
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Question Screen
  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setSelectedLevel(null)}
          className="text-sm text-slate-400 hover:text-white"
        >
          ← Kembali
        </button>
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-amber-400" />
          <span className="font-bold">{selectedLevel?.toUpperCase()}</span>
        </div>
        <div className="text-sm text-slate-400">
          {currentQuestion + 1}/{filteredQuestions.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-700 rounded-full h-2 mb-8">
        <motion.div
          className="bg-amber-500 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${((currentQuestion + 1) / filteredQuestions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              currentQ.type === 'reading' ? 'bg-blue-500/20 text-blue-300' :
              currentQ.type === 'grammar' ? 'bg-purple-500/20 text-purple-300' :
              'bg-green-500/20 text-green-300'
            }`}>
              {currentQ.type === 'reading' ? '📖 Reading' : 
               currentQ.type === 'grammar' ? '📝 Grammar' : '💬 Vocab'}
            </span>
            <span className="text-xs text-slate-500">{currentQ.points} poin</span>
          </div>

          <p className="text-lg whitespace-pre-line mb-6">{currentQ.question}</p>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options?.map((option, i) => {
              const isSelected = selectedAnswer === option;
              const isCorrect = option === currentQ.correctAnswer;
              const showCorrect = showResult && isCorrect;
              const showWrong = showResult && isSelected && !isCorrect;

              return (
                <motion.button
                  key={i}
                  whileHover={!showResult ? { scale: 1.01 } : {}}
                  whileTap={!showResult ? { scale: 0.99 } : {}}
                  onClick={() => handleAnswer(option)}
                  disabled={showResult}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    showCorrect ? 'border-green-500 bg-green-500/10' :
                    showWrong ? 'border-red-500 bg-red-500/10' :
                    isSelected ? 'border-amber-500 bg-amber-500/10' :
                    'border-slate-600 hover:border-slate-500 bg-slate-700/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                      showCorrect ? 'bg-green-500 text-white' :
                      showWrong ? 'bg-red-500 text-white' :
                      'bg-slate-600 text-slate-300'
                    }`}>
                      {showCorrect ? <CheckCircle2 className="w-5 h-5" /> :
                       showWrong ? <XCircle className="w-5 h-5" /> :
                       String.fromCharCode(65 + i)}
                    </span>
                    <span>{option}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Explanation */}
          {showResult && currentQ.explanation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-slate-700/50 rounded-xl border border-slate-600"
            >
              <p className="text-sm text-slate-300">
                💡 {currentQ.explanation}
              </p>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Next Button */}
      {showResult && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={nextQuestion}
          className="w-full py-4 bg-amber-500 text-black rounded-xl font-bold hover:bg-amber-400 transition-colors flex items-center justify-center gap-2"
        >
          {currentQuestion < filteredQuestions.length - 1 ? (
            <>Soal Berikutnya <ArrowRight className="w-5 h-5" /></>
          ) : (
            <>Lihat Hasil <Trophy className="w-5 h-5" /></>
          )}
        </motion.button>
      )}
    </div>
  );
}
