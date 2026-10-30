import React, { useState, useRef, useEffect } from 'react';
import { SubjectId, ChatMessage, SavedNote, SubjectConfig } from '../types/education';
import { sendTutorMessage } from '../utils/aiClient';
import { MarkdownRenderer } from './MarkdownRenderer';
import {
  Send,
  Sparkles,
  Copy,
  Check,
  Bookmark,
  Volume2,
  VolumeX,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Bot,
  User,
} from 'lucide-react';

interface CleanChatViewProps {
  subject: SubjectConfig;
  academicLevel: string;
  messages: ChatMessage[];
  onUpdateMessages: (newMessages: ChatMessage[]) => void;
  onSaveNote: (note: Omit<SavedNote, 'id' | 'createdAt'>) => void;
  onClearHistory: () => void;
}

const SUBJECT_QUICK_CHIPS: Record<SubjectId, { label: string; chips: string[] }> = {
  comunicacion: {
    label: 'Resúmenes y Significados:',
    chips: [
      '¿Qué significa metáfora?',
      'Resumen de Don Quijote de la Mancha',
      'Significado de Denotación vs Connotación',
      'Resumen de La Ilíada',
      '¿Qué significa elocuente?',
      'Resumen de El Principito',
      'Diferencia entre Diptongo e Hiato',
    ],
  },
  matematica: {
    label: 'Operaciones directas:',
    chips: [
      '1 + 1',
      '¿Cuánto es 1 + 1?',
      '25 × 4 + 50',
      '150 ÷ 5',
      '√64 + 16',
      '3x + 8 = 20',
      'x² - 5x + 6 = 0',
    ],
  },
  ciencias: {
    label: 'Conceptos y Leyes:',
    chips: [
      '¿Qué es la fotosíntesis?',
      'Las 3 Leyes de Newton',
      'Mitosis: etapas y significado',
      'Resumen de la teoría celular',
      'Diferencia entre átomo y molécula',
    ],
  },
  sociales: {
    label: 'Hechos y Definiciones:',
    chips: [
      'Resumen de la Revolución Francesa',
      '¿Qué significa PIB y cómo se calcula?',
      'Causas de la Segunda Guerra Mundial',
      '¿Qué es la democracia representativa?',
    ],
  },
  idiomas: {
    label: 'Gramática y Vocabulario:',
    chips: [
      'Significado de Phrasal Verbs',
      'Present Perfect vs Past Simple',
      'Common False Friends en inglés',
      'Diferencia entre Must y Should',
    ],
  },
  programacion: {
    label: 'Algoritmos y Conceptos:',
    chips: [
      '¿Qué significa recursividad?',
      'Resumen de Programación Orientada a Objetos',
      'Diferencia entre Pila (Stack) y Cola (Queue)',
      '¿Qué es la notación Big O?',
    ],
  },
};

const SUBJECT_PLACEHOLDERS: Record<SubjectId, string> = {
  comunicacion: 'Pide un resumen de un libro/texto, o consulta el significado de una palabra o figura retórica...',
  matematica: 'Pregunta cualquier operación (ej. 1+1, 25 x 4, raíces, ecuaciones cuadráticas)...',
  ciencias: 'Pregunta sobre fenómenos naturales, leyes de la física, procesos biológicos o reacciones...',
  sociales: 'Consulta sobre procesos históricos, significados económicos (PIB, inflación) o sociología...',
  idiomas: 'Consulta reglas gramaticales, traducciones, phrasal verbs, tiempos verbales o falsos amigos...',
  programacion: 'Pregunta sobre algoritmos, código Python/JS, estructuras de datos o sintaxis...',
};

export const CleanChatView: React.FC<CleanChatViewProps> = ({
  subject,
  academicLevel,
  messages,
  onUpdateMessages,
  onSaveNote,
  onClearHistory,
}) => {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (customText?: string) => {
    const textToSend = (customText || inputText).trim();
    if (!textToSend || loading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      subjectId: subject.id,
    };

    const newHistory = [...messages, userMsg];
    onUpdateMessages(newHistory);
    setInputText('');
    setLoading(true);

    try {
      const replyText = await sendTutorMessage(
        subject.id,
        newHistory.map((m) => ({ role: m.role, text: m.text })),
        academicLevel
      );

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        role: 'model',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        subjectId: subject.id,
      };

      onUpdateMessages([...newHistory, aiMsg]);
    } catch {
      const fallbackMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        role: 'model',
        text: 'He registrado tu consulta. Continuemos analizando este problema.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        subjectId: subject.id,
      };
      onUpdateMessages([...newHistory, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSave = (id: string, text: string) => {
    onSaveNote({
      title: `Apunte de ${subject.name}`,
      subjectId: subject.id,
      content: text,
      category: subject.name,
    });
    setSavedId(id);
    setTimeout(() => setSavedId(null), 3000);
  };

  const toggleSpeak = (id: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
    } else {
      window.speechSynthesis.cancel();
      const cleanText = text
        .replace(/#+\s/g, '')
        .replace(/\*\*/g, '')
        .replace(/`+/g, '')
        .replace(/\$+/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'es-ES';
      utterance.rate = 1.0;
      utterance.onend = () => setSpeakingId(null);
      utterance.onerror = () => setSpeakingId(null);
      window.speechSynthesis.speak(utterance);
      setSpeakingId(id);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-14rem)] min-h-[500px]">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-4 space-y-5">
        {messages.length === 0 ? (
          /* Empty State: Warm Welcome & 1-Click Cards */
          <div className="max-w-2xl mx-auto py-8 text-center space-y-6">
            <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-sky-500/20 to-indigo-500/20 border border-sky-500/30">
              <Sparkles className="w-8 h-8 text-sky-400" />
            </div>

            <div>
              <h3 className="text-2xl font-bold text-white mb-2">
                ¡Hola! Soy tu tutor en {subject.name}
              </h3>
              <p className="text-slate-400 text-sm max-w-lg mx-auto leading-relaxed">
                {subject.description}
              </p>
            </div>

            {/* Quick Starters */}
            <div className="text-left pt-2">
              <span className="text-xs uppercase font-bold text-slate-500 tracking-wider block mb-3 text-center">
                Preguntas de ejemplo (Toca una para probar):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {subject.promptStarters.map((starter, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(starter.prompt)}
                    className="p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-sky-500/40 text-left transition-all group flex flex-col justify-between"
                  >
                    <span className="text-sm font-semibold text-white group-hover:text-sky-300 transition-colors flex items-center justify-between">
                      {starter.label}
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
                    </span>
                    <span className="text-xs text-slate-400 line-clamp-2 mt-1">
                      {starter.prompt}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Chat History */
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 sm:gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-md">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}

                <div
                  className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 sm:p-5 ${
                    isUser
                      ? 'bg-sky-600 text-white rounded-br-xs shadow-md shadow-sky-600/20'
                      : 'bg-slate-900 border border-slate-800/90 text-slate-200 rounded-bl-xs shadow-lg'
                  }`}
                >
                  {isUser ? (
                    <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                      {msg.text}
                    </p>
                  ) : (
                    <div>
                      <MarkdownRenderer content={msg.text} />

                      {/* Action Bar for AI response */}
                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                        <span className="text-[11px] text-slate-500">{msg.timestamp}</span>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => toggleSpeak(msg.id, msg.text)}
                            title={speakingId === msg.id ? 'Detener voz' : 'Escuchar en voz alta'}
                            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all flex items-center gap-1"
                          >
                            {speakingId === msg.id ? (
                              <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                            ) : (
                              <Volume2 className="w-3.5 h-3.5 text-sky-400" />
                            )}
                            <span className="hidden sm:inline">
                              {speakingId === msg.id ? 'Detener' : 'Voz'}
                            </span>
                          </button>

                          <button
                            onClick={() => handleCopy(msg.id, msg.text)}
                            title="Copiar respuesta"
                            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all flex items-center gap-1"
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            <span className="hidden sm:inline">
                              {copiedId === msg.id ? 'Copiado' : 'Copiar'}
                            </span>
                          </button>

                          <button
                            onClick={() => handleSave(msg.id, msg.text)}
                            title="Guardar en mis apuntes"
                            className={`p-1.5 rounded-lg transition-all flex items-center gap-1 ${
                              savedId === msg.id
                                ? 'text-emerald-400 bg-emerald-950/40'
                                : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            <Bookmark className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">
                              {savedId === msg.id ? 'Guardado' : 'Apunte'}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-slate-300" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex gap-3 items-center">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shrink-0 animate-pulse">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs sm:text-sm flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce [animation-delay:0.4s]" />
              </div>
              <span>Analizando la pregunta a fondo y formulando respuesta conclusa...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3 sm:p-4 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
        {/* Quick Operations / Topics Bar for Selected Subject */}
        {(() => {
          const quickData = SUBJECT_QUICK_CHIPS[subject.id];
          if (!quickData) return null;
          return (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2.5 scrollbar-none text-xs">
              <span className="text-[11px] text-sky-400 font-semibold whitespace-nowrap flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-sky-400" />
                {quickData.label}
              </span>
              {quickData.chips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(chip)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-sky-500/20 text-slate-300 hover:text-sky-300 border border-slate-700/70 hover:border-sky-500/40 whitespace-nowrap transition-all shadow-xs"
                >
                  {chip}
                </button>
              ))}
            </div>
          );
        })()}

        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              SUBJECT_PLACEHOLDERS[subject.id] ||
              `Pregunta cualquier duda sobre ${subject.name}...`
            }
            rows={2}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-all resize-none max-h-32"
          />

          <button
            onClick={() => handleSend()}
            disabled={!inputText.trim() || loading}
            className={`p-3 rounded-xl flex items-center justify-center transition-all ${
              !inputText.trim() || loading
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-500/25'
            }`}
            title="Enviar mensaje"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {messages.length > 0 && (
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Presiona Enter para enviar (Shift+Enter para nueva línea)</span>
            <button
              onClick={onClearHistory}
              className="text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Limpiar conversación
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
