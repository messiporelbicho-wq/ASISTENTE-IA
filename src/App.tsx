import React, { useState, useEffect } from 'react';
import {
  SubjectId,
  AcademicLevel,
  ChatMessage,
  SavedNote,
} from './types/education';
import { SUBJECTS } from './data/courses';
import { CleanChatView } from './components/CleanChatView';
import { CleanSolverView } from './components/CleanSolverView';
import { CleanQuizView } from './components/CleanQuizView';
import { CleanNotebookView } from './components/CleanNotebookView';
import {
  GraduationCap,
  MessageSquare,
  Zap,
  CheckCircle2,
  Bookmark,
  Sparkles,
  Calculator,
  PenTool,
  Atom,
  Compass,
  Globe2,
  Code2,
} from 'lucide-react';

type AppTab = 'chat' | 'solver' | 'quiz' | 'notebook';

const SUBJECT_ICONS: Record<SubjectId, React.ReactNode> = {
  matematica: <Calculator className="w-4 h-4" />,
  comunicacion: <PenTool className="w-4 h-4" />,
  ciencias: <Atom className="w-4 h-4" />,
  sociales: <Compass className="w-4 h-4" />,
  idiomas: <Globe2 className="w-4 h-4" />,
  programacion: <Code2 className="w-4 h-4" />,
};

export default function App() {
  const [currentSubjectId, setCurrentSubjectId] = useState<SubjectId>('matematica');
  const [activeTab, setActiveTab] = useState<AppTab>('chat');
  const [academicLevel, setAcademicLevel] = useState<AcademicLevel>('secundaria');

  // Multi-subject chat histories
  const [chatHistories, setChatHistories] = useState<Record<SubjectId, ChatMessage[]>>({
    matematica: [],
    comunicacion: [],
    ciencias: [],
    sociales: [],
    idiomas: [],
    programacion: [],
  });

  // Persistent notes in localStorage
  const [notes, setNotes] = useState<SavedNote[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('edugenio_notes');
        if (saved) return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('edugenio_notes', JSON.stringify(notes));
  }, [notes]);

  const currentSubject =
    SUBJECTS.find((s) => s.id === currentSubjectId) || SUBJECTS[1]; // default to matematica

  const handleSaveNote = (newNoteData: Omit<SavedNote, 'id' | 'createdAt'>) => {
    const newNote: SavedNote = {
      ...newNoteData,
      id: `note_${Date.now()}`,
      createdAt: new Date().toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    setNotes((prev) => [newNote, ...prev]);
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleClearNotes = () => {
    if (window.confirm('¿Seguro que deseas vaciar todos tus apuntes guardados?')) {
      setNotes([]);
    }
  };

  const handleClearSubjectChat = () => {
    setChatHistories((prev) => ({
      ...prev,
      [currentSubjectId]: [],
    }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500/30">
      {/* 1. TOP BAR */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base tracking-tight">EduGenio</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  Respuestas Conclusas
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Análisis profundo de preguntas • Resoluciones definitivas
              </p>
            </div>
          </div>

          {/* Academic Level Toggle */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            {(
              [
                { id: 'primaria', label: 'Primaria' },
                { id: 'secundaria', label: 'Secundaria' },
                { id: 'universitario', label: 'Universidad' },
              ] as const
            ).map((level) => (
              <button
                key={level.id}
                onClick={() => setAcademicLevel(level.id)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                  academicLevel === level.id
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {level.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* 2. SUBJECT CATEGORY SELECTOR (Clean, scrollable, 1-click) */}
      <section className="bg-slate-900/60 border-b border-slate-800/70 px-4 sm:px-6 py-2.5">
        <div className="max-w-6xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1 shrink-0 hidden md:inline">
            Materias:
          </span>
          {SUBJECTS.map((sub) => {
            const isActive = sub.id === currentSubjectId;
            return (
              <button
                key={sub.id}
                onClick={() => setCurrentSubjectId(sub.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-white border border-sky-500/60 shadow-md shadow-sky-500/10'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800'
                }`}
              >
                <span className={isActive ? 'text-sky-400' : 'text-slate-400'}>
                  {SUBJECT_ICONS[sub.id]}
                </span>
                <span>{sub.name.split(' ')[0]}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. NAVIGATION TABS (Tutor, Resolver, Quiz, Apuntes) */}
      <div className="bg-slate-950 px-4 sm:px-6 pt-3 pb-2 border-b border-slate-900">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'chat'
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                  : 'bg-slate-900/70 text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Tutor IA</span>
            </button>

            <button
              onClick={() => setActiveTab('solver')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'solver'
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                  : 'bg-slate-900/70 text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Resolver Ejercicio</span>
            </button>

            <button
              onClick={() => setActiveTab('quiz')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'quiz'
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                  : 'bg-slate-900/70 text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Test Rápido</span>
            </button>

            <button
              onClick={() => setActiveTab('notebook')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'notebook'
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                  : 'bg-slate-900/70 text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800'
              }`}
            >
              <Bookmark className="w-4 h-4 text-purple-400" />
              <span>Mis Apuntes</span>
              {notes.length > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {notes.length}
                </span>
              )}
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400">
            <span className="font-medium text-slate-300">{currentSubject.name}</span>
            <span className="text-slate-600">•</span>
            <span className="text-sky-400 capitalize">{academicLevel}</span>
          </div>
        </div>
      </div>

      {/* 4. MAIN WORKSPACE */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6">
        {activeTab === 'chat' && (
          <CleanChatView
            subject={currentSubject}
            academicLevel={academicLevel}
            messages={chatHistories[currentSubjectId] || []}
            onUpdateMessages={(newMsgs) =>
              setChatHistories((prev) => ({ ...prev, [currentSubjectId]: newMsgs }))
            }
            onSaveNote={handleSaveNote}
            onClearHistory={handleClearSubjectChat}
          />
        )}

        {activeTab === 'solver' && (
          <CleanSolverView
            subjectId={currentSubjectId}
            subjectName={currentSubject.name}
            academicLevel={academicLevel}
            onSaveNote={handleSaveNote}
          />
        )}

        {activeTab === 'quiz' && (
          <CleanQuizView
            subjectId={currentSubjectId}
            subjectName={currentSubject.name}
            accentColor={currentSubject.color}
          />
        )}

        {activeTab === 'notebook' && (
          <CleanNotebookView
            notes={notes}
            onDeleteNote={handleDeleteNote}
            onClearNotes={handleClearNotes}
          />
        )}
      </main>

      {/* 5. FOOTER */}
      <footer className="py-3 px-4 border-t border-slate-900 text-center text-xs text-slate-500">
        EduGenio AI • Matemática, Comunicación, Ciencias, Sociales, Idiomas y Programación • Respuestas didácticas paso a paso
      </footer>
    </div>
  );
}
