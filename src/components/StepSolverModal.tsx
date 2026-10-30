import React, { useState } from 'react';
import { SubjectConfig, AcademicLevel, SolverResult } from '../types/education';
import { Calculator, X, Sparkles, CheckCircle2, Copy, Check, ArrowRight, Lightbulb } from 'lucide-react';

interface StepSolverModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: SubjectConfig;
  academicLevel: AcademicLevel;
  onSaveNote: (title: string, content: string) => void;
}

export const StepSolverModal: React.FC<StepSolverModalProps> = ({
  isOpen,
  onClose,
  subject,
  academicLevel,
  onSaveNote,
}) => {
  const [problemText, setProblemText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SolverResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSolve = async () => {
    if (!problemText.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/tutor/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId: subject.id,
          problem: problemText.trim(),
          academicLevel,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Error al resolver el problema.');
      }

      const data: SolverResult = await res.json();
      setResult(data);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const text = `PROBLEMA: ${result.title}\n\nPASOS:\n${result.steps
      .map(
        (s) =>
          `Paso ${s.stepNumber}: ${s.title}\n${s.explanation}${
            s.formulaOrCode ? `\nFórmula/Procedimiento: ${s.formulaOrCode}` : ''
          }`
      )
      .join('\n\n')}\n\nRESPUESTA FINAL:\n${result.finalAnswer}\n\nCONSEJO:\n${
      result.tipOrVerification || ''
    }`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToNotebook = () => {
    if (!result) return;
    const content = `${result.title}\n\n${result.steps
      .map((s) => `${s.stepNumber}. ${s.title}: ${s.explanation}`)
      .join('\n')}\n\nRespuesta: ${result.finalAnswer}`;
    onSaveNote(`Solución: ${result.title}`, content);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="flex flex-col w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-500/10 rounded-xl text-sky-400 border border-sky-500/20">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Solucionador Paso a Paso</h2>
              <p className="text-xs text-slate-400">
                Desglose conceptual y fórmulas para {subject.name} ({academicLevel})
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
          {/* Input section */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Ingresa el enunciado del ejercicio o pregunta:
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <textarea
                value={problemText}
                onChange={(e) => setProblemText(e.target.value)}
                placeholder="Ejemplo: Resuelve 3x² - 12 = 0, o explica la reacción de combustión del metano, o analiza la métrica de un soneto..."
                rows={3}
                className="flex-1 p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-sky-500 resize-none"
              />
              <button
                onClick={handleSolve}
                disabled={!problemText.trim() || loading}
                className={`sm:w-36 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-xs transition-all shadow-md ${
                  problemText.trim() && !loading
                    ? 'bg-sky-500 hover:bg-sky-400 text-slate-950 active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Resolver</span>
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

          {/* Solved Results */}
          {result && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-lg font-black text-white">{result.title}</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors border border-slate-700"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copiado' : 'Copiar'}</span>
                  </button>
                  <button
                    onClick={handleSaveToNotebook}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 rounded-lg transition-colors border border-sky-500/30 font-semibold"
                  >
                    {saved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    <span>{saved ? 'Guardado en Cuaderno' : 'Guardar Apunte'}</span>
                  </button>
                </div>
              </div>

              {/* Steps List */}
              <div className="space-y-4">
                {result.steps.map((st) => (
                  <div
                    key={st.stepNumber}
                    className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 shadow-sm"
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 font-black text-xs flex items-center justify-center border border-sky-500/30">
                        {st.stepNumber}
                      </span>
                      <h4 className="font-bold text-white text-sm">{st.title}</h4>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed pl-8.5">{st.explanation}</p>

                    {st.formulaOrCode && (
                      <div className="mt-3 ml-8.5 p-2.5 bg-slate-900 border border-slate-800 rounded-lg font-mono text-xs text-amber-300 overflow-x-auto">
                        {st.formulaOrCode}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Final Answer Banner */}
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
                  Respuesta Final
                </div>
                <div className="text-base font-extrabold text-white leading-relaxed">{result.finalAnswer}</div>
              </div>

              {/* Tip or Verification */}
              {result.tipOrVerification && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200">
                  <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Método de Verificación: </span>
                    <span className="text-slate-300">{result.tipOrVerification}</span>
                  </div>
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
