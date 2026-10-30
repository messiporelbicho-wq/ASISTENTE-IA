import React, { useState, useRef, useEffect } from 'react';
import { SubjectConfig, ChatMessage, AcademicLevel, TutorMode } from '../types/education';
import { MarkdownRenderer } from './MarkdownRenderer';
import {
  Send,
  Sparkles,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Trash2,
  Bot,
  User,
  BookmarkPlus,
  Mic,
  MicOff,
  RotateCcw,
  Lightbulb,
  HelpCircle,
  Wand2,
} from 'lucide-react';

interface ChatInterfaceProps {
  subject: SubjectConfig;
  academicLevel: AcademicLevel;
  tutorMode: TutorMode;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onClearChat: () => void;
  isLoading: boolean;
  onSaveNote: (title: string, content: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  subject,
  academicLevel,
  tutorMode,
  messages,
  onSendMessage,
  onClearChat,
  isLoading,
  onSaveNote,
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Text-to-Speech synthesis
  const handleSpeak = (text: string, id: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[#*`_$\\]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'es-ES';
    utterance.rate = 1.0;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  // Speech-to-Text Recognition (Dictation)
  const toggleListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Tu navegador no soporta entrada por voz directa. Puedes escribir en el recuadro.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'es-ES';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Quick Action Chips to enhance dynamics
  const quickActions = [
    { label: '💡 Dame un ejemplo cotidiano', prompt: 'Dame un ejemplo práctico y cotidiano de la vida real sobre esto:' },
    { label: '🔍 Explícamelo más simple', prompt: 'Por favor explícamelo en términos más sencillos y directos como para alguien que recién empieza:' },
    { label: '📐 Ver fórmula o regla', prompt: 'Muestra la fórmula matemática o regla formal y cómo se deduce paso a paso:' },
    { label: '❓ Ponme un ejercicio para practicar', prompt: 'Plantéame un ejercicio práctico similar para ver si lo he comprendido bien y dame 4 opciones:' },
  ];

  return (
    <div className="flex flex-col h-[740px] w-full bg-slate-900/70 border border-slate-800 rounded-2xl shadow-xl overflow-hidden backdrop-blur">
      {/* Chat Sub-Bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-950/60 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: subject.color }} />
          <span className="font-bold text-white">{subject.name}</span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400">Nivel {academicLevel}</span>
          <span className="text-slate-500">·</span>
          <span className="text-amber-400 capitalize">{tutorMode}</span>
        </div>

        {messages.length > 0 && (
          <button
            onClick={onClearChat}
            className="flex items-center gap-1.5 text-slate-400 hover:text-rose-400 transition-colors text-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Limpiar chat</span>
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {messages.length === 0 ? (
          /* Empty State & Prompt Starters */
          <div className="flex flex-col items-center justify-center h-full text-center max-w-lg mx-auto py-6">
            <div
              className="p-4 rounded-2xl mb-3 border shadow-inner"
              style={{ backgroundColor: subject.accentBg, borderColor: subject.borderColor }}
            >
              <Sparkles className="w-8 h-8" style={{ color: subject.color }} />
            </div>
            <h3 className="text-xl font-black text-white">¿Qué tema deseas aprender hoy?</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md">
              Escribe cualquier duda, ejercicio, texto para corregir o tema para tu examen en{' '}
              <strong className="text-white">{subject.name}</strong>.
            </p>

            {/* Prompt Starters */}
            <div className="w-full mt-6 space-y-2 text-left">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Preguntas frecuentes de alumnos:
              </span>
              <div className="grid grid-cols-1 gap-2">
                {subject.promptStarters.map((starter, i) => (
                  <button
                    key={i}
                    onClick={() => onSendMessage(starter.prompt)}
                    className="p-3 text-xs text-slate-200 bg-slate-950/70 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 rounded-xl transition-all flex items-center justify-between text-left group active:scale-[0.99]"
                  >
                    <span>{starter.label}</span>
                    <span className="text-slate-500 group-hover:text-amber-400 transition-colors">➔</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={msg.id || index}
              className={`flex gap-3.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-200`}
            >
              {msg.role === 'model' && (
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border mt-0.5 shadow-sm"
                  style={{ backgroundColor: subject.accentBg, borderColor: subject.borderColor }}
                >
                  <Bot className="w-4 h-4" style={{ color: subject.color }} />
                </div>
              )}

              <div
                className={`max-w-[88%] md:max-w-[80%] rounded-2xl p-4 shadow-md text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-sky-600 text-white rounded-tr-none'
                    : 'bg-slate-950/90 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                {/* Message body with rich Markdown & Math rendering */}
                {msg.role === 'user' ? (
                  <div className="whitespace-pre-wrap font-sans text-sm">{msg.text}</div>
                ) : (
                  <MarkdownRenderer content={msg.text} />
                )}

                {/* AI Message Action Footer */}
                {msg.role === 'model' && (
                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-800/80 text-xs text-slate-400">
                    <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                    <div className="flex items-center gap-2">
                      {/* Audio Voice Player */}
                      <button
                        onClick={() => handleSpeak(msg.text, msg.id)}
                        title={speakingId === msg.id ? 'Detener lectura' : 'Escuchar en voz alta'}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors text-[11px] ${
                          speakingId === msg.id
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {speakingId === msg.id ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5" />
                            <span>Detener</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5 text-sky-400" />
                            <span>Escuchar</span>
                          </>
                        )}
                      </button>

                      {/* Save to Notebook */}
                      <button
                        onClick={() => {
                          onSaveNote(`${subject.name} - Apunte`, msg.text);
                          setSavedId(msg.id);
                          setTimeout(() => setSavedId(null), 2000);
                        }}
                        title="Guardar en Cuaderno de Estudio"
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors"
                      >
                        {savedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <BookmarkPlus className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Copy message */}
                      <button
                        onClick={() => copyToClipboard(msg.text, msg.id)}
                        title="Copiar texto"
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-9 h-9 rounded-xl bg-sky-500 flex items-center justify-center shrink-0 mt-0.5 text-slate-950 font-bold shadow-sm">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-3 p-4 max-w-md bg-slate-950/80 border border-slate-800 rounded-2xl rounded-tl-none text-xs text-slate-300">
            <div className="w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
            <span>El tutor está preparando tu explicación paso a paso...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Dynamic Quick Action Chips */}
      {messages.length > 0 && !isLoading && (
        <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-950/80 border-t border-slate-800/80 overflow-x-auto text-[11px]">
          <span className="text-slate-500 font-bold mr-1 shrink-0">Sugerencias:</span>
          {quickActions.map((qa, i) => (
            <button
              key={i}
              onClick={() => onSendMessage(qa.prompt)}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 whitespace-nowrap transition-colors"
            >
              {qa.label}
            </button>
          ))}
        </div>
      )}

      {/* Input Bar */}
      <form onSubmit={handleSubmit} className="p-4 bg-slate-950/90 border-t border-slate-800">
        <div className="relative flex items-end gap-2 bg-slate-900 border border-slate-700/80 rounded-2xl p-2 shadow-inner focus-within:border-sky-500 transition-colors">
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            placeholder={`Escribe o dicta tu pregunta de ${subject.name}... (ej: ¿Cómo resuelvo 2x+5=15?, balancea C3H8+O2, revisa mi ensayo...)`}
            className="flex-1 bg-transparent border-0 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none resize-none px-3 py-1"
          />

          {/* Voice Input Microphone Button */}
          <button
            type="button"
            onClick={toggleListening}
            title={isListening ? 'Detener dictado' : 'Dictar por voz'}
            className={`p-2.5 rounded-xl transition-all shrink-0 ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className={`p-2.5 rounded-xl transition-all shadow-md shrink-0 ${
              inputText.trim() && !isLoading
                ? 'bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
