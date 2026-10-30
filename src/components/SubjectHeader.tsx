import React from 'react';
import { SubjectConfig, AcademicLevel, TutorMode } from '../types/education';
import { BookOpen, FileText, CheckCircle2, Calculator, Sparkles, Brain, GraduationCap } from 'lucide-react';

interface SubjectHeaderProps {
  subject: SubjectConfig;
  academicLevel: AcademicLevel;
  onChangeAcademicLevel: (level: AcademicLevel) => void;
  tutorMode: TutorMode;
  onChangeTutorMode: (mode: TutorMode) => void;
  onOpenSolver: () => void;
  onOpenQuiz: () => void;
  onOpenSummary: () => void;
}

export const SubjectHeader: React.FC<SubjectHeaderProps> = ({
  subject,
  academicLevel,
  onChangeAcademicLevel,
  tutorMode,
  onChangeTutorMode,
  onOpenSolver,
  onOpenQuiz,
  onOpenSummary,
}) => {
  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-5 mb-5 shadow-xl backdrop-blur">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Subject Title & Category Info */}
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 shrink-0 shadow-md">
            <img
              src={subject.avatarImg}
              alt={subject.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <span className="font-bold tracking-wide" style={{ color: subject.color }}>
                {subject.category}
              </span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-300">Tutor de IA Personal</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">{subject.name}</h1>
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{subject.tagline}</p>
          </div>
        </div>

        {/* Quick Tools Action Buttons */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={onOpenSolver}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-xs font-bold rounded-xl border border-sky-500/30 transition-all active:scale-95 shadow-sm"
          >
            <Calculator className="w-4 h-4" />
            <span>Resolver Ejercicio</span>
          </button>

          <button
            onClick={onOpenQuiz}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-bold rounded-xl border border-amber-500/30 transition-all active:scale-95 shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Quiz Interactivo</span>
          </button>

          <button
            onClick={onOpenSummary}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl border border-emerald-500/30 transition-all active:scale-95 shadow-sm"
          >
            <FileText className="w-4 h-4" />
            <span>Resumen y Flashcards</span>
          </button>
        </div>
      </div>

      {/* Selectors Bar: Academic Level & Pedagogical Mode */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-5 pt-4 border-t border-slate-800/80 text-xs">
        {/* Pedagogical Tutor Mode */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-semibold">Modo de Explicación:</span>
          <div className="flex items-center p-1 bg-slate-950/80 border border-slate-800 rounded-xl">
            <button
              onClick={() => onChangeTutorMode('explicacion')}
              title="Explicación clara y detallada paso a paso"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                tutorMode === 'explicacion'
                  ? 'bg-white text-slate-950 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Paso a Paso</span>
            </button>
            <button
              onClick={() => onChangeTutorMode('socratico')}
              title="El tutor te guía con preguntas reflexivas para que lo deduzcas tú mismo"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                tutorMode === 'socratico'
                  ? 'bg-white text-slate-950 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Brain className="w-3.5 h-3.5 text-amber-600" />
              <span>Socrático (Guía)</span>
            </button>
            <button
              onClick={() => onChangeTutorMode('resumen')}
              title="Resumen conciso con viñetas y fórmulas esenciales"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                tutorMode === 'resumen'
                  ? 'bg-white text-slate-950 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>Síntesis</span>
            </button>
          </div>
        </div>

        {/* Academic Level */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-semibold flex items-center gap-1">
            <GraduationCap className="w-3.5 h-3.5 text-sky-400" />
            <span>Nivel:</span>
          </span>
          <div className="flex items-center p-1 bg-slate-950/80 border border-slate-800 rounded-xl">
            {(
              [
                { id: 'primaria', label: 'Primaria' },
                { id: 'secundaria', label: 'Secundaria' },
                { id: 'preuniversitario', label: 'Pre-U' },
                { id: 'universitario', label: 'Universidad' },
              ] as { id: AcademicLevel; label: string }[]
            ).map((lvl) => (
              <button
                key={lvl.id}
                onClick={() => onChangeAcademicLevel(lvl.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  academicLevel === lvl.id
                    ? 'bg-sky-500 text-slate-950 shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lvl.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
