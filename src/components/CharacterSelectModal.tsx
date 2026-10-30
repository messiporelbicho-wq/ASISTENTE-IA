import React from 'react';
import { LegendPlayer, AIDifficulty } from '../types/game';
import { LEGENDS } from '../data/legends';
import { Check, Zap, Sparkles, X, ChevronRight } from 'lucide-react';

interface CharacterSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedP1: LegendPlayer;
  selectedP2: LegendPlayer;
  onSelectP1: (legend: LegendPlayer) => void;
  onSelectP2: (legend: LegendPlayer) => void;
  difficulty: AIDifficulty;
  onChangeDifficulty: (diff: AIDifficulty) => void;
  isTwoPlayer: boolean;
  onToggleTwoPlayer: (is2P: boolean) => void;
  onConfirm: () => void;
}

export const CharacterSelectModal: React.FC<CharacterSelectModalProps> = ({
  isOpen,
  onClose,
  selectedP1,
  selectedP2,
  onSelectP1,
  onSelectP2,
  difficulty,
  onChangeDifficulty,
  isTwoPlayer,
  onToggleTwoPlayer,
  onConfirm,
}) => {
  const [activeTab, setActiveTab] = React.useState<'P1' | 'P2'>('P1');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="flex flex-col w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-black text-white tracking-wide">Selecciona tu Leyenda</h2>
            <p className="text-xs text-slate-400 mt-0.5">Elige a tu campeón para el duelo 1v1 y personaliza tu partida</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab & Mode Switchers */}
        <div className="flex flex-wrap items-center justify-between px-6 py-3 bg-slate-950/60 border-b border-slate-800/80 gap-3">
          {/* Switch active selector: Jugador 1 vs Jugador 2 */}
          <div className="flex items-center p-1 bg-slate-800/80 rounded-xl">
            <button
              onClick={() => setActiveTab('P1')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'P1'
                  ? 'bg-sky-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Jugador 1: {selectedP1.nickname}
            </button>
            <button
              onClick={() => setActiveTab('P2')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'P2'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {isTwoPlayer ? 'Jugador 2' : 'Rival IA'}: {selectedP2.nickname}
            </button>
          </div>

          {/* Mode: 1P vs 2P */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Modalidad:</span>
            <div className="flex items-center p-1 bg-slate-800/80 rounded-xl">
              <button
                onClick={() => onToggleTwoPlayer(false)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  !isTwoPlayer ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                1 Jugador (vs IA)
              </button>
              <button
                onClick={() => onToggleTwoPlayer(true)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  isTwoPlayer ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                2 Jugadores (Local)
              </button>
            </div>
          </div>

          {/* Difficulty (if vs AI) */}
          {!isTwoPlayer && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Dificultad IA:</span>
              <div className="flex items-center p-1 bg-slate-800/80 rounded-xl">
                {(['EASY', 'MEDIUM', 'LEGEND'] as AIDifficulty[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => onChangeDifficulty(d)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                      difficulty === d
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {d === 'EASY' ? 'Fácil' : d === 'MEDIUM' ? 'Normal' : 'Leyenda'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Legend Roster Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {LEGENDS.map((legend) => {
            const isSelected = activeTab === 'P1' ? selectedP1.id === legend.id : selectedP2.id === legend.id;

            return (
              <div
                key={legend.id}
                onClick={() => {
                  if (activeTab === 'P1') onSelectP1(legend);
                  else onSelectP2(legend);
                }}
                className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  isSelected
                    ? activeTab === 'P1'
                      ? 'border-sky-500 bg-sky-950/30 shadow-lg shadow-sky-500/10'
                      : 'border-rose-500 bg-rose-950/30 shadow-lg shadow-rose-500/10'
                    : 'border-slate-800 bg-slate-950/50 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                {/* Check badge */}
                {isSelected && (
                  <div
                    className={`absolute top-3 right-3 p-1 rounded-full text-slate-950 ${
                      activeTab === 'P1' ? 'bg-sky-400' : 'bg-rose-400'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 shrink-0">
                    <img
                      src={legend.avatarImg}
                      alt={legend.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-white text-base">{legend.nickname}</span>
                      <span className="text-sm">{legend.flag}</span>
                    </div>
                    <div className="text-xs text-slate-400">{legend.name} · #{legend.number}</div>
                  </div>
                </div>

                {/* Stats bars */}
                <div className="mt-4 space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-slate-400 mb-0.5">
                      <span>Velocidad</span>
                      <span className="text-white font-mono">{legend.speed}/10</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${legend.speed * 10}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400 mb-0.5">
                      <span>Salto y Cabezazo</span>
                      <span className="text-white font-mono">{legend.jump}/10</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-sky-500 rounded-full" style={{ width: `${legend.jump * 10}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400 mb-0.5">
                      <span>Potencia de Tiro</span>
                      <span className="text-white font-mono">{legend.power}/10</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${legend.power * 10}%` }} />
                    </div>
                  </div>
                </div>

                {/* Super Power Card */}
                <div className="mt-4 p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1">
                    <Zap className="w-3.5 h-3.5" />
                    <span>{legend.superPowerName}</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">{legend.superDescription}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-t border-slate-800">
          <div className="text-xs text-slate-400 hidden sm:block">
            <span>Duelo: </span>
            <strong className="text-sky-400">{selectedP1.nickname}</strong>
            <span> vs </span>
            <strong className="text-rose-400">{selectedP2.nickname}</strong>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={onClose}
              className="py-2.5 px-4 text-xs font-semibold text-slate-300 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="flex items-center gap-2 py-2.5 px-6 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 rounded-xl transition-transform active:scale-95 shadow-lg shadow-amber-500/20"
            >
              <span>¡Comenzar Partido!</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
