import React, { useState } from 'react';
import { SubjectConfig, AcademicLevel, SummaryResult } from '../types/education';
import { FileText, X, Sparkles, BookMarked, Layers, RotateCcw, Check, BookmarkPlus } from 'lucide-react';

interface SummaryAndCardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: SubjectConfig;
  academicLevel: AcademicLevel;
  onSaveNote: (title: string, content: string) => void;
}

export const SummaryAndCardsModal: React.FC<SummaryAndCardsModalProps> = ({
  isOpen,
  onClose,
  subject,
  academicLevel,
  onSaveNote,
}) => {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!inputText.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setFlippedCards({});

    try {
      const res = await fetch('/api/tutor/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId: subject.id,
          content: inputText.trim(),
          academicLevel,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Error al generar la síntesis.');
      }

      const data: SummaryResult = await res.json();
      setResult(data);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  const toggleFlip = (index: number) => {
    setFlippedCards((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleSaveToNotebook = () => {
    if (!result) return;
    const content = `RESUMEN:\n${result.summary}\n\nPUNTOS CLAVE:\n${result.keyPoints
      .map((k) => `• ${k}`)
      .join('\n')}\n\nTARJETAS:\n${result.flashcards
      .map((f) => `P: ${f.front} -> R: ${f.back}`)
      .join('\n')}`;

    onSaveNote(`Resumen: ${result.title}`, content);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="flex flex-col w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Síntesis y Flashcards</h2>
              <p className="text-xs text-slate-400">
                Resumen ejecutivo y tarjetas de estudio para {subject.name}
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
          {/* Input text */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Pega tu texto, apuntes o tema a resumir:
            </label>
            <div className="flex flex-col gap-3">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Pega aquí el contenido de tu lectura, clase o capítulo para sintetizar..."
                rows={4}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 resize-none"
              />
              <button
                onClick={handleGenerate}
                disabled={!inputText.trim() || loading}
                className="self-end flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Crear Resumen y Tarjetas</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-xs text-rose-300">
              {error}
            </div>
          )}

          {/* Results View */}
          {result && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-lg font-black text-white">{result.title}</h3>
                <button
                  onClick={handleSaveToNotebook}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg transition-colors border border-emerald-500/30 font-semibold"
                >
                  {saved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
                  <span>{saved ? 'Guardado' : 'Guardar en Cuaderno'}</span>
                </button>
              </div>

              {/* Executive Summary */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <BookMarked className="w-3.5 h-3.5" />
                  <span>Resumen Ejecutivo</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">{result.summary}</p>
              </div>

              {/* Key Points */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                <div className="text-xs font-bold uppercase tracking-wider text-sky-400">Puntos Clave</div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {result.keyPoints.map((pt, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Flashcards */}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-3">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Tarjetas Mnemotécnicas (Haz clic para voltear)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {result.flashcards.map((fc, i) => {
                    const isFlipped = flippedCards[i];
                    return (
                      <div
                        key={i}
                        onClick={() => toggleFlip(i)}
                        className={`p-4 rounded-xl border cursor-pointer min-h-[110px] flex flex-col justify-between transition-all select-none ${
                          isFlipped
                            ? 'bg-amber-950/40 border-amber-500/50 text-amber-200 shadow-md'
                            : 'bg-slate-950/90 border-slate-800 text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                          {isFlipped ? 'Respuesta' : `Tarjeta #${i + 1} (Pregunta)`}
                        </div>
                        <div className="text-xs font-semibold my-2">
                          {isFlipped ? fc.back : fc.front}
                        </div>
                        <div className="text-[10px] text-slate-500 self-end">
                          {isFlipped ? '↺ Volver a la pregunta' : 'Haz clic para ver respuesta'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
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
