import React from 'react';
import { SavedNote, SubjectId } from '../types/education';
import { SUBJECTS } from '../data/courses';
import { BookOpen, X, Trash2, Download, Copy, Check } from 'lucide-react';

interface StudyNotebookDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notes: SavedNote[];
  onDeleteNote: (id: string) => void;
  onClearAll: () => void;
}

export const StudyNotebookDrawer: React.FC<StudyNotebookDrawerProps> = ({
  isOpen,
  onClose,
  notes,
  onDeleteNote,
  onClearAll,
}) => {
  const [selectedFilter, setSelectedFilter] = React.useState<SubjectId | 'all'>('all');
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const filteredNotes =
    selectedFilter === 'all' ? notes : notes.filter((n) => n.subjectId === selectedFilter);

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportAll = () => {
    if (notes.length === 0) return;
    const allText = notes
      .map(
        (n) =>
          `# ${n.title} (${n.subjectId.toUpperCase()})\nFecha: ${n.date}\n\n${n.content}\n\n---\n`
      )
      .join('\n');

    const blob = new Blob([allText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OmniTutor_Cuaderno_Estudio.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm">
      <div className="flex flex-col w-full max-w-lg h-full bg-slate-900 border-l border-slate-800 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-500/10 rounded-xl text-sky-400 border border-sky-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Cuaderno de Apuntes</h2>
              <p className="text-xs text-slate-400">Tus notas, fórmulas y resúmenes guardados ({notes.length})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-1.5 px-6 py-3 bg-slate-950/50 border-b border-slate-800 overflow-x-auto text-xs">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors whitespace-nowrap shrink-0 ${
              selectedFilter === 'all'
                ? 'bg-white text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Todos ({notes.length})
          </button>
          {SUBJECTS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedFilter(s.id)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors whitespace-nowrap shrink-0 ${
                selectedFilter === s.id
                  ? 'bg-slate-800 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {s.name.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center text-slate-500 text-xs">
              <BookOpen className="w-8 h-8 mb-2 opacity-40" />
              <p>No tienes apuntes guardados en esta categoría.</p>
              <p className="mt-1 text-[11px] text-slate-600">
                Usa el botón "Guardar Apunte" en el chat o en las herramientas para archivar contenido aquí.
              </p>
            </div>
          ) : (
            filteredNotes.map((note) => {
              const subj = SUBJECTS.find((s) => s.id === note.subjectId);
              return (
                <div
                  key={note.id}
                  className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2.5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="font-bold text-[10px] uppercase tracking-wider"
                      style={{ color: subj?.color || '#38bdf8' }}
                    >
                      {subj?.name || note.subjectId}
                    </span>
                    <span className="text-[10px] text-slate-500">{note.date}</span>
                  </div>

                  <h3 className="font-bold text-white text-sm">{note.title}</h3>
                  <div className="text-slate-300 whitespace-pre-wrap font-sans max-h-48 overflow-y-auto pr-1">
                    {note.content}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => handleCopy(note.content, note.id)}
                      className="flex items-center gap-1 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition-colors"
                      title="Copiar contenido"
                    >
                      {copiedId === note.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => onDeleteNote(note.id)}
                      className="flex items-center gap-1 p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-900 transition-colors"
                      title="Eliminar apunte"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        {notes.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-t border-slate-800 text-xs">
            <button
              onClick={onClearAll}
              className="text-rose-400 hover:text-rose-300 transition-colors"
            >
              Borrar todo
            </button>
            <button
              onClick={handleExportAll}
              className="flex items-center gap-1.5 py-2 px-4 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl transition-all shadow-md active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Markdown</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
