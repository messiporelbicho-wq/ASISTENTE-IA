import React from 'react';
import { UserCareerStats } from '../types/game';
import { ACHIEVEMENTS_LIST, ASSETS } from '../data/legends';
import { Trophy, Award, CheckCircle2, X, Target, Zap, ShieldCheck } from 'lucide-react';

interface TrophiesAndStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: UserCareerStats;
  onResetStats: () => void;
}

export const TrophiesAndStatsModal: React.FC<TrophiesAndStatsModalProps> = ({
  isOpen,
  onClose,
  stats,
  onResetStats,
}) => {
  if (!isOpen) return null;

  const winRate =
    stats.matchesPlayed > 0 ? Math.round((stats.wins / stats.matchesPlayed) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="flex flex-col w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Sala de Trofeos y Récords</h2>
              <p className="text-xs text-slate-400">Tus estadísticas de carrera y logros desbloqueados</p>
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
          {/* Trophy Display Card */}
          <div className="flex items-center gap-5 p-4 rounded-xl bg-gradient-to-r from-amber-950/30 to-slate-950 border border-amber-500/30">
            <div className="w-20 h-20 rounded-xl overflow-hidden border border-amber-500/40 shrink-0">
              <img
                src={ASSETS.trophy}
                alt="Trofeo"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Copas de Oro Ganadas
              </div>
              <div className="text-3xl font-black text-white mt-0.5 tabular-nums">
                {stats.trophiesWon} <span className="text-sm font-normal text-slate-400">títulos</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Gana la Copa de Campeones para sumar trofeos a tu vitrina.
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Estadísticas Globales
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400">Partidos</div>
                <div className="text-xl font-bold text-white tabular-nums mt-0.5">{stats.matchesPlayed}</div>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400">Victorias</div>
                <div className="text-xl font-bold text-emerald-400 tabular-nums mt-0.5">{stats.wins}</div>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400">Efectividad</div>
                <div className="text-xl font-bold text-sky-400 tabular-nums mt-0.5">{winRate}%</div>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400">Goles Marcados</div>
                <div className="text-xl font-bold text-amber-400 tabular-nums mt-0.5">{stats.goalsScored}</div>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400">Récord Tiros Libres</div>
                <div className="text-xl font-bold text-purple-400 tabular-nums mt-0.5">
                  {stats.bestFreeKickScore} pts
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400">Récord Gambeta</div>
                <div className="text-xl font-bold text-rose-400 tabular-nums mt-0.5">
                  {stats.bestDribbleScore} pts
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400">Goles Recibidos</div>
                <div className="text-xl font-bold text-slate-300 tabular-nums mt-0.5">{stats.goalsConceded}</div>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <div className="text-[11px] text-slate-400">Diferencia de Gol</div>
                <div className="text-xl font-bold text-white tabular-nums mt-0.5">
                  {stats.goalsScored - stats.goalsConceded > 0 ? '+' : ''}
                  {stats.goalsScored - stats.goalsConceded}
                </div>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Logros Legendarios
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ACHIEVEMENTS_LIST.map((ach) => {
                const unlocked = stats.unlockedAchievements.includes(ach.id);
                return (
                  <div
                    key={ach.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-xs transition-colors ${
                      unlocked
                        ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                        : 'bg-slate-950/40 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg mt-0.5 shrink-0 ${
                        unlocked ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-600'
                      }`}
                    >
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">{ach.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{ach.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-t border-slate-800">
          <button
            onClick={onResetStats}
            className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
          >
            Reiniciar Estadísticas
          </button>
          <button
            onClick={onClose}
            className="py-2 px-5 text-xs font-semibold text-slate-950 bg-white hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
