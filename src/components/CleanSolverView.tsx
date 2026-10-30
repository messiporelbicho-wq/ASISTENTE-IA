import React, { useState } from 'react';
import { SubjectId, SavedNote } from '../types/education';
import { solveProblem } from '../utils/aiClient';
import { MarkdownRenderer } from './MarkdownRenderer';
import { Sparkles, Copy, Check, Bookmark, Volume2, VolumeX, ArrowRight, Lightbulb } from 'lucide-react';

interface CleanSolverViewProps {
  subjectId: SubjectId;
  subjectName: string;
  academicLevel?: string;
  onSaveNote: (note: Omit<SavedNote, 'id' | 'createdAt'>) => void;
}

const SAMPLE_EXERCISES: Record<SubjectId, string[]> = {
  matematica: [
    '1 + 1',
    '25 × 4 + 50',
    'x² - 5x + 6 = 0',
    '3x + 8 = 20',
    '√64 + 16',
    '15% de 200',
  ],
  comunicacion: [
    'Resumen de Don Quijote de la Mancha',
    '¿Qué significa metáfora y cuál es su diferencia con el símil?',
    'Significado y diferencia: Denotación vs Connotación',
    '¿Qué significa la palabra "elocuente"?',
    'Resumen de La Ilíada y lecciones centrales',
    'Diferencia y significado entre Diptongo e Hiato',
  ],
  ciencias: [
    '¿Qué es la fotosíntesis y cuál es su ecuación?',
    'Las 3 Leyes del Movimiento de Newton con ejemplos',
    'Mitosis: etapas, significado e importancia celular',
    'Calcula la fuerza para una masa de 5 kg con aceleración de 3 m/s²',
  ],
  sociales: [
    'Resumen y causas de la Revolución Francesa (1789)',
    '¿Qué significa PIB (Producto Interno Bruto) y cómo se calcula?',
    'Causas principales de la Segunda Guerra Mundial',
    '¿Qué es la democracia representativa y la división de poderes?',
  ],
  idiomas: [
    'Significado y uso de Phrasal Verbs con ejemplos',
    '¿Cuándo usar Present Perfect vs Past Simple?',
    'Common False Friends en inglés (Actually, Embarrassed)',
    'Explica los modales: Can, Could, Should y Must',
  ],
  programacion: [
    '¿Qué significa recursividad y cómo funciona?',
    'Resumen de Programación Orientada a Objetos (POO)',
    '¿Cuál es la diferencia entre Pila (Stack) y Cola (Queue)?',
    'Escribe una función en Python para verificar si una palabra es palíndromo',
  ],
};

export const CleanSolverView: React.FC<CleanSolverViewProps> = ({
  subjectId,
  subjectName,
  academicLevel = 'secundaria',
  onSaveNote,
}) => {
  const [problemText, setProblemText] = useState('');
  const [loading, setLoading] = useState(false);
  const [solution, setSolution] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const samples = SAMPLE_EXERCISES[subjectId] || SAMPLE_EXERCISES.matematica;

  const handleSolve = async (textToSolve?: string) => {
    const text = (textToSolve || problemText).trim();
    if (!text || loading) return;

    setLoading(true);
    setSolution(null);
    setSaved(false);

    try {
      const result = await solveProblem(subjectId, text, academicLevel);
      setSolution(result.explanation);
    } catch {
      setSolution('No se pudo resolver en este momento. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!solution) return;
    navigator.clipboard.writeText(solution);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (!solution || saved) return;
    onSaveNote({
      title: `Resolución: ${problemText.slice(0, 35) || subjectName}`,
      subjectId,
      content: solution,
      category: subjectName,
    });
    setSaved(true);
  };

  const toggleSpeak = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      if (!solution) return;
      window.speechSynthesis.cancel();
      // Clean markdown tags for natural speech
      const cleanText = solution
        .replace(/#+\s/g, '')
        .replace(/\*\*/g, '')
        .replace(/`+/g, '')
        .replace(/\$+/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'es-ES';
      utterance.rate = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Input Box Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2 mb-2 text-sky-400 font-semibold text-xs uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          Resolución Paso a Paso Automática
        </div>
        <h3 className="text-xl font-bold text-white mb-2">
          Pega o escribe tu ejercicio de {subjectName}
        </h3>
        <p className="text-slate-400 text-sm mb-4">
          La IA analizará el enunciado, identificará los datos y te dará la explicación detallada con cada paso lógico.
        </p>

        {/* Text Area */}
        <textarea
          value={problemText}
          onChange={(e) => setProblemText(e.target.value)}
          placeholder={
            subjectId === 'comunicacion'
              ? 'Ejemplo: Pega un texto para resumir, pide el resumen de una obra (ej. Don Quijote, Ilíada), o consulta qué significa una palabra o figura...'
              : subjectId === 'matematica'
              ? 'Ejemplo: 1 + 1, 25 x 4, x² - 5x + 6 = 0, o cualquier operación o problema...'
              : `Ejemplo: Escribe tu ejercicio o consulta sobre ${subjectName}...`
          }
          rows={3}
          className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all resize-none mb-4"
        />

        {/* Quick Example Pills */}
        <div className="mb-5">
          <span className="text-xs text-slate-400 font-medium block mb-2 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            O prueba con estos ejercicios típicos (1 clic):
          </span>
          <div className="flex flex-wrap gap-2">
            {samples.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setProblemText(sample);
                  handleSolve(sample);
                }}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-all text-left flex items-center gap-1.5 group"
              >
                <span>{sample}</span>
                <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            onClick={() => handleSolve()}
            disabled={!problemText.trim() || loading}
            className={`px-6 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all shadow-lg ${
              !problemText.trim() || loading
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-sky-500/25'
            }`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Analizando a fondo y resolviendo...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analizar y Resolver con Conclusión</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Solution Display Card */}
      {solution && (
        <div className="p-6 rounded-2xl bg-slate-900/95 border border-slate-700/80 shadow-2xl animate-fadeIn">
          {/* Header of Solution */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h4 className="font-bold text-white text-base">Desarrollo y Solución</h4>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleSpeak}
                title={isSpeaking ? 'Detener lectura' : 'Escuchar explicación en voz alta'}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1.5"
              >
                {isSpeaking ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-sky-400" />}
                <span className="hidden sm:inline">{isSpeaking ? 'Detener' : 'Escuchar'}</span>
              </button>

              <button
                onClick={handleCopy}
                title="Copiar texto de la solución"
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1.5"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span className="hidden sm:inline">{copied ? 'Copiado' : 'Copiar'}</span>
              </button>

              <button
                onClick={handleSave}
                title="Guardar en mis apuntes personales"
                className={`p-2 rounded-lg transition-all text-xs flex items-center gap-1.5 ${
                  saved
                    ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                <span className="hidden sm:inline">{saved ? 'Guardado' : 'Guardar Apunte'}</span>
              </button>
            </div>
          </div>

          {/* Render Solution */}
          <div className="text-slate-200">
            <MarkdownRenderer content={solution} />
          </div>
        </div>
      )}
    </div>
  );
};
