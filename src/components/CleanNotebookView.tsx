import React, { useState } from 'react';
import { SavedNote } from '../types/education';
import { MarkdownRenderer } from './MarkdownRenderer';
import { Bookmark, Trash2, Copy, Check, Download, Search, BookOpen } from 'lucide-react';

interface CleanNotebookViewProps {
  notes: SavedNote[];
  onDeleteNote: (id: string) => void;
  onClearNotes: () => void;
}

export const CleanNotebookView: React.FC<CleanNotebookViewProps> = ({
  notes,
  onDeleteNote,
  onClearNotes,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = () => {
    if (notes.length === 0) return;
    const allText = notes
      .map(
        (n) => `========================================\n${n.title} (${n.category})\nFecha: ${n.createdAt}\n========================================\n\n${n.content}\n\n`
      )
      .join('\n');

    const blob = new Blob([allText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `EduGenio_Mis_Apuntes_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header card */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs uppercase tracking-wider mb-1">
            <Bookmark className="w-4 h-4" />
            Cuaderno Digital
          </div>
          <h3 className="text-xl font-bold text-white">Mis Apuntes Guardados</h3>
          <p className="text-slate-400 text-sm">
            {notes.length} {notes.length === 1 ? 'apunte guardado' : 'apuntes guardados'} en este dispositivo
          </p>
        </div>

        {notes.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all border border-slate-700"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              Exportar (.txt)
            </button>
            <button
              onClick={onClearNotes}
              className="px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-rose-200 text-xs font-semibold flex items-center gap-1.5 transition-all border border-rose-900/40"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Limpiar
            </button>
          </div>
        )}
      </div>

      {/* Search Bar if multiple notes */}
      {notes.length > 1 && (
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar en mis apuntes guardados..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-all"
          />
        </div>
      )}

      {/* Notes List */}
      {filteredNotes.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-semibold text-slate-300 mb-1">Tu cuaderno está vacío</h4>
          <p className="text-slate-500 text-sm max-w-md mx-auto mb-4">
            Cuando la IA resuelva un ejercicio o te dé una explicación útil, pulsa el botón{' '}
            <strong className="text-slate-300">"Guardar Apunte"</strong> para conservarla aquí.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg transition-all"
            >
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                <div>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-sky-400 border border-slate-700 mr-2">
                    {note.category}
                  </span>
                  <span className="text-xs text-slate-500">{note.createdAt}</span>
                  <h4 className="font-bold text-white text-base mt-1.5">{note.title}</h4>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(note.id, note.content)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs"
                    title="Copiar apunte"
                  >
                    {copiedId === note.id ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => onDeleteNote(note.id)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition-all text-xs"
                    title="Eliminar apunte"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="text-slate-300 text-sm leading-relaxed max-h-96 overflow-y-auto pr-2">
                <MarkdownRenderer content={note.content} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
