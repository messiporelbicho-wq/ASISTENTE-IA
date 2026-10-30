import React, { useState, useEffect } from 'react';
import { SubjectId } from '../types/education';
import { fetchQuiz } from '../utils/aiClient';
import { CheckCircle2, XCircle, RotateCcw, Sparkles, Award } from 'lucide-react';

interface CleanQuizViewProps {
  subjectId: SubjectId;
  subjectName: string;
  accentColor: string;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const CleanQuizView: React.FC<CleanQuizViewProps> = ({
  subjectId,
  subjectName,
  accentColor,
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadQuestions = async () => {
    setLoading(true);
    setCurrentIndex(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setScore(0);
    setIsCompleted(false);

    try {
      const data = await fetchQuiz(subjectId);
      if (data && data.length > 0) {
        setQuestions(data);
      }
    } catch {
      // fallback handled in fetchQuiz
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [subjectId]);

  const currentQ = questions[currentIndex];

  const handleSelect = (idx: number) => {
    if (showExplanation) return;
    setSelectedOption(idx);
    setShowExplanation(true);
    if (idx === currentQ.correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      setIsCompleted(true);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400">
        <div className="w-10 h-10 border-4 border-slate-700 border-t-sky-500 rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium">Preparando preguntas de {subjectName}...</p>
      </div>
    );
  }

  if (isCompleted) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="max-w-xl mx-auto p-8 bg-slate-900/90 rounded-2xl border border-slate-800 text-center shadow-xl">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-yellow-400/30 flex items-center justify-center border border-amber-500/30">
          <Award className="w-8 h-8 text-amber-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">¡Práctica Completada!</h3>
        <p className="text-slate-400 mb-6 text-sm">
          Has respondido las preguntas sobre <span className="text-white font-medium">{subjectName}</span>
        </p>

        <div className="inline-flex items-center gap-6 px-6 py-4 rounded-xl bg-slate-800/80 border border-slate-700/60 mb-6">
          <div className="text-center">
            <span className="text-xs text-slate-400 uppercase tracking-wider block">Aciertos</span>
            <span className="text-2xl font-black text-emerald-400">{score} / {questions.length}</span>
          </div>
          <div className="w-px h-10 bg-slate-700" />
          <div className="text-center">
            <span className="text-xs text-slate-400 uppercase tracking-wider block">Puntaje</span>
            <span className="text-2xl font-black text-sky-400">{percentage}%</span>
          </div>
        </div>

        <div>
          <button
            onClick={loadQuestions}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-sm transition-all shadow-lg shadow-sky-500/20"
          >
            <RotateCcw className="w-4 h-4" />
            Intentar Nuevamente
          </button>
        </div>
      </div>
    );
  }

  if (!currentQ) {
    return (
      <div className="text-center p-8 text-slate-400">
        <p>No se encontraron preguntas para este curso.</p>
        <button onClick={loadQuestions} className="mt-4 text-sky-400 hover:underline text-sm">
          Recargar
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl">
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
            Pregunta {currentIndex + 1} de {questions.length}
          </span>
          <span className="text-xs text-slate-400">• {subjectName}</span>
        </div>
        <div className="text-xs font-semibold text-slate-400">
          Aciertos: <span className="text-emerald-400">{score}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-slate-800 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Title */}
      <h3 className="text-lg sm:text-xl font-bold text-white mb-6 leading-relaxed">
        {currentQ.question}
      </h3>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {currentQ.options.map((option, idx) => {
          const isSelected = selectedOption === idx;
          const isCorrect = idx === currentQ.correctIndex;

          let btnStyle = 'bg-slate-800/70 hover:bg-slate-800 border-slate-700/80 text-slate-200';
          if (showExplanation) {
            if (isCorrect) {
              btnStyle = 'bg-emerald-950/40 border-emerald-500/80 text-emerald-200';
            } else if (isSelected) {
              btnStyle = 'bg-rose-950/40 border-rose-500/80 text-rose-200';
            } else {
              btnStyle = 'bg-slate-800/40 border-slate-800 text-slate-500 opacity-60';
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={showExplanation}
              className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 text-sm sm:text-base font-medium ${btnStyle}`}
            >
              <span className="w-7 h-7 rounded-lg bg-slate-900/80 border border-slate-700 flex items-center justify-center shrink-0 font-bold text-xs text-slate-400">
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="flex-1 pt-0.5">{option}</span>
              {showExplanation && isCorrect && (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              )}
              {showExplanation && isSelected && !isCorrect && (
                <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation Box */}
      {showExplanation && (
        <div className="p-4 rounded-xl bg-slate-800/90 border border-slate-700 mb-6 text-sm text-slate-300 animate-fadeIn">
          <div className="flex items-center gap-2 font-semibold text-xs uppercase tracking-wider text-sky-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            Explicación Didáctica
          </div>
          <p className="leading-relaxed">{currentQ.explanation}</p>
        </div>
      )}

      {/* Next Button */}
      {showExplanation && (
        <div className="flex justify-end">
          <button
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-sm transition-all shadow-md shadow-sky-500/20"
          >
            {currentIndex + 1 < questions.length ? 'Siguiente Pregunta →' : 'Ver Resultados Finales'}
          </button>
        </div>
      )}
    </div>
  );
};
