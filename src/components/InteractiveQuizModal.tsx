import React, { useState } from 'react';
import { SubjectConfig, AcademicLevel, QuizData } from '../types/education';
import { CheckCircle2, X, Sparkles, Check, HelpCircle, RotateCcw, Award, Flame } from 'lucide-react';

interface InteractiveQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: SubjectConfig;
  academicLevel: AcademicLevel;
}

export const InteractiveQuizModal: React.FC<InteractiveQuizModalProps> = ({
  isOpen,
  onClose,
  subject,
  academicLevel,
}) => {
  const [topic, setTopic] = useState(subject.subtopics[0]);
  const [loading, setLoading] = useState(false);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  if (!isOpen) return null;

  const handleGenerateQuiz = async (customTopic?: string) => {
    const targetTopic = customTopic || topic;
    if (!targetTopic.trim() || loading) return;
    setLoading(true);
    setError(null);
    setUserAnswers({});
    setShowResults(false);

    try {
      const res = await fetch('/api/tutor/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId: subject.id,
          topic: targetTopic.trim(),
          academicLevel,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Error al generar el cuestionario.');
      }

      const data: QuizData = await res.json();
      setQuizData(data);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'Error al conectar con la IA.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionIndex: number, optionIndex: number) => {
    if (showResults) return;
    setUserAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  // Calculate score
  const correctCount = quizData
    ? quizData.questions.reduce((acc, q, idx) => (userAnswers[idx] === q.correctOptionIndex ? acc + 1 : acc), 0)
    : 0;

  const totalQuestions = quizData?.questions.length || 0;
  const isAllAnswered = quizData ? Object.keys(userAnswers).length === totalQuestions : false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="flex flex-col w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Cuestionario Interactivo</h2>
              <p className="text-xs text-slate-400">
                Ponte a prueba en {subject.name} ({academicLevel})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Topic selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Tema a evaluar:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Escribe un tema (ej: Teorema de Pitágoras, Ensayos, Leyes de Newton...)"
                className="flex-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={() => handleGenerateQuiz()}
                disabled={!topic.trim() || loading}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generar</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick subtopics badges */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {subject.subtopics.map((sub, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setTopic(sub);
                    handleGenerateQuiz(sub);
                  }}
                  className="px-2.5 py-1 bg-slate-950/60 hover:bg-slate-800 border border-slate-800 rounded-lg text-[11px] text-slate-400 hover:text-white transition-colors"
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-xs text-rose-300">
              {error}
            </div>
          )}

          {/* Quiz questions */}
          {quizData && (
            <div className="space-y-6">
              {/* Score Trophy Banner */}
              {showResults && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 border border-amber-500/40 flex items-center justify-between shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-full bg-amber-500/20 text-amber-400">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
                        {correctCount === totalQuestions
                          ? '¡Puntaje Perfecto!'
                          : correctCount >= totalQuestions / 2
                          ? '¡Buen Trabajo!'
                          : 'Sigue Practicando'}
                      </div>
                      <div className="text-lg font-black text-white">
                        {correctCount} de {totalQuestions} correctas ({Math.round((correctCount / totalQuestions) * 100)}%)
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleGenerateQuiz()}
                    className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Otro Quiz</span>
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                <span className="font-bold text-slate-300">Tema: {quizData.topic}</span>
                <span className="text-slate-400">
                  Progreso: {Object.keys(userAnswers).length} / {totalQuestions}
                </span>
              </div>

              {quizData.questions.map((q, qIndex) => {
                const selectedOpt = userAnswers[qIndex];
                const isAnswered = selectedOpt !== undefined;

                return (
                  <div
                    key={q.id || qIndex}
                    className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {qIndex + 1}
                      </span>
                      <h4 className="font-bold text-white text-sm leading-snug">{q.question}</h4>
                    </div>

                    {/* Options */}
                    <div className="grid grid-cols-1 gap-2 pl-7.5">
                      {q.options.map((opt, optIndex) => {
                        const isSelected = selectedOpt === optIndex;
                        const isCorrect = q.correctOptionIndex === optIndex;

                        let btnStyle = 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800/80';

                        if (showResults) {
                          if (isCorrect) {
                            btnStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-bold';
                          } else if (isSelected && !isCorrect) {
                            btnStyle = 'bg-rose-950/60 border-rose-500 text-rose-200 line-through';
                          }
                        } else if (isSelected) {
                          btnStyle = 'bg-amber-500/20 border-amber-500 text-amber-200 font-semibold';
                        }

                        return (
                          <button
                            key={optIndex}
                            onClick={() => handleSelectOption(qIndex, optIndex)}
                            className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${btnStyle}`}
                          >
                            <span>{opt}</span>
                            {showResults && isCorrect && (
                              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {showResults && (
                      <div className="ml-7.5 mt-2 p-2.5 bg-slate-900/90 border border-slate-800 rounded-lg text-xs text-slate-400">
                        <strong className="text-slate-300">Explicación pedagógica: </strong>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Action Buttons */}
              {!showResults && (
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setShowResults(true)}
                    disabled={!isAllAnswered}
                    className="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md active:scale-95 disabled:opacity-40"
                  >
                    {isAllAnswered ? 'Ver Calificación y Explicaciones' : 'Responde todas las preguntas para calificar'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 bg-slate-950 border-t border-slate-800">
          <button
            onClick={onClose}
            className="py-2 px-5 text-xs font-semibold text-slate-300 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
