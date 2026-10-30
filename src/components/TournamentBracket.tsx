import React, { useState } from 'react';
import { LegendPlayer, AIDifficulty, MatchStats } from '../types/game';
import { LEGENDS, ASSETS } from '../data/legends';
import { HeadSoccerGame } from './HeadSoccerGame';
import { Trophy, ChevronRight, Play, ArrowLeft, Award, Sparkles } from 'lucide-react';
import { sounds } from '../utils/audio';

interface TournamentBracketProps {
  userLegend: LegendPlayer;
  onBackToMenu: () => void;
  onTournamentWon: () => void;
}

interface BracketMatch {
  id: string;
  p1: LegendPlayer;
  p2: LegendPlayer;
  score1: number | null;
  score2: number | null;
  winner: LegendPlayer | null;
  isUserMatch: boolean;
}

export const TournamentBracket: React.FC<TournamentBracketProps> = ({
  userLegend,
  onBackToMenu,
  onTournamentWon,
}) => {
  // Opponents pool excluding user legend
  const opponents = LEGENDS.filter((l) => l.id !== userLegend.id);

  // Initialize 4 Quarterfinals (User is in match 1)
  const [currentRound, setCurrentRound] = useState<'QUARTERS' | 'SEMIS' | 'FINAL' | 'CHAMPION'>('QUARTERS');
  const [activeMatch, setActiveMatch] = useState<BracketMatch | null>(null);

  // Bracket state
  const [quarters, setQuarters] = useState<BracketMatch[]>([
    { id: 'q1', p1: userLegend, p2: opponents[0], score1: null, score2: null, winner: null, isUserMatch: true },
    { id: 'q2', p1: opponents[1], p2: opponents[2], score1: null, score2: null, winner: null, isUserMatch: false },
    { id: 'q3', p1: opponents[3], p2: opponents[4], score1: null, score2: null, winner: null, isUserMatch: false },
    { id: 'q4', p1: opponents[2], p2: opponents[0], score1: null, score2: null, winner: null, isUserMatch: false },
  ]);

  const [semis, setSemis] = useState<BracketMatch[]>([
    { id: 's1', p1: userLegend, p2: opponents[1], score1: null, score2: null, winner: null, isUserMatch: true },
    { id: 's2', p1: opponents[3], p2: opponents[2], score1: null, score2: null, winner: null, isUserMatch: false },
  ]);

  const [finalMatch, setFinalMatch] = useState<BracketMatch>({
    id: 'f1',
    p1: userLegend,
    p2: opponents[3],
    score1: null,
    score2: null,
    winner: null,
    isUserMatch: true,
  });

  const [isEliminated, setIsEliminated] = useState(false);

  // Start the user's match for current round
  const handlePlayCurrentRound = () => {
    let matchToPlay: BracketMatch | null = null;
    if (currentRound === 'QUARTERS') matchToPlay = quarters[0];
    else if (currentRound === 'SEMIS') matchToPlay = semis[0];
    else if (currentRound === 'FINAL') matchToPlay = finalMatch;

    if (matchToPlay) {
      setActiveMatch(matchToPlay);
    }
  };

  // Called when active match finishes in HeadSoccerGame
  const handleMatchComplete = (stats: MatchStats) => {
    if (!activeMatch) return;

    const userWon = stats.winner === 'p1';

    if (currentRound === 'QUARTERS') {
      // Simulate other quarters
      const updatedQuarters = [...quarters];
      updatedQuarters[0] = {
        ...updatedQuarters[0],
        score1: stats.p1Score,
        score2: stats.p2Score,
        winner: userWon ? updatedQuarters[0].p1 : updatedQuarters[0].p2,
      };

      // Sim others
      updatedQuarters[1].score1 = 3;
      updatedQuarters[1].score2 = 2;
      updatedQuarters[1].winner = updatedQuarters[1].p1;

      updatedQuarters[2].score1 = 4;
      updatedQuarters[2].score2 = 3;
      updatedQuarters[2].winner = updatedQuarters[2].p1;

      setQuarters(updatedQuarters);

      if (userWon) {
        // Advance to Semis
        setSemis([
          { id: 's1', p1: userLegend, p2: updatedQuarters[1].winner!, score1: null, score2: null, winner: null, isUserMatch: true },
          { id: 's2', p1: updatedQuarters[2].winner!, p2: opponents[4] || opponents[1], score1: null, score2: null, winner: null, isUserMatch: false },
        ]);
        setCurrentRound('SEMIS');
        setActiveMatch(null);
      } else {
        setIsEliminated(true);
        setActiveMatch(null);
      }
    } else if (currentRound === 'SEMIS') {
      const updatedSemis = [...semis];
      updatedSemis[0] = {
        ...updatedSemis[0],
        score1: stats.p1Score,
        score2: stats.p2Score,
        winner: userWon ? updatedSemis[0].p1 : updatedSemis[0].p2,
      };

      // Sim other semi
      updatedSemis[1].score1 = 3;
      updatedSemis[1].score2 = 1;
      updatedSemis[1].winner = updatedSemis[1].p1;

      setSemis(updatedSemis);

      if (userWon) {
        setFinalMatch({
          id: 'f1',
          p1: userLegend,
          p2: updatedSemis[1].winner!,
          score1: null,
          score2: null,
          winner: null,
          isUserMatch: true,
        });
        setCurrentRound('FINAL');
        setActiveMatch(null);
      } else {
        setIsEliminated(true);
        setActiveMatch(null);
      }
    } else if (currentRound === 'FINAL') {
      setFinalMatch({
        ...finalMatch,
        score1: stats.p1Score,
        score2: stats.p2Score,
        winner: userWon ? finalMatch.p1 : finalMatch.p2,
      });

      if (userWon) {
        setCurrentRound('CHAMPION');
        setActiveMatch(null);
        sounds.playFanfare();
        onTournamentWon();
      } else {
        setIsEliminated(true);
        setActiveMatch(null);
      }
    }
  };

  // If match in progress, render the arena
  if (activeMatch) {
    const aiDifficulty: AIDifficulty =
      currentRound === 'QUARTERS' ? 'EASY' : currentRound === 'SEMIS' ? 'MEDIUM' : 'LEGEND';

    return (
      <HeadSoccerGame
        player1={activeMatch.p1}
        player2={activeMatch.p2}
        difficulty={aiDifficulty}
        isTwoPlayer={false}
        onBackToMenu={() => setActiveMatch(null)}
        onMatchComplete={handleMatchComplete}
      />
    );
  }

  // Champion Victory Celebration Screen
  if (currentRound === 'CHAMPION') {
    return (
      <div className="flex flex-col items-center max-w-xl mx-auto p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-center">
        <div className="relative w-48 h-48 mb-4 overflow-hidden rounded-2xl border-2 border-amber-400 shadow-2xl">
          <img
            src={ASSETS.trophy}
            alt="Copa de Campeones"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm tracking-widest uppercase mb-1">
          <Sparkles className="w-4 h-4" />
          <span>¡CAMPEÓN DE LA COPA DE ORO!</span>
          <Sparkles className="w-4 h-4" />
        </div>

        <h2 className="text-3xl font-black text-white">
          {userLegend.name} ({userLegend.nickname})
        </h2>
        <p className="text-slate-400 text-sm mt-2 max-w-md">
          Has conquistado los cuartos, semifinales y la gran final para levantar el trofeo más prestigioso de la galaxia.
        </p>

        <div className="flex items-center gap-4 mt-6">
          <button
            onClick={onBackToMenu}
            className="py-3 px-6 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-all shadow-lg text-sm"
          >
            Volver al Menú Principal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-6 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between w-full pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-wide">Copa de Campeones</h2>
            <div className="text-xs text-slate-400">Fase actual: {currentRound === 'QUARTERS' ? 'Cuartos de Final' : currentRound === 'SEMIS' ? 'Semifinales' : 'Gran Final'}</div>
          </div>
        </div>

        <button
          onClick={onBackToMenu}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors border border-slate-700"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Menú
        </button>
      </div>

      {/* Bracket Tree Visualizer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full my-8">
        {/* Quarters Column */}
        <div className="flex flex-col gap-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Cuartos de Final</div>
          {quarters.slice(0, 2).map((m, idx) => (
            <div
              key={m.id}
              className={`p-3 rounded-xl border text-xs transition-all ${
                m.isUserMatch
                  ? 'bg-sky-950/40 border-sky-500/50 shadow-md'
                  : 'bg-slate-950/50 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between py-1">
                <span className="font-semibold text-slate-200">{m.p1.flag} {m.p1.nickname}</span>
                <span className="font-mono text-slate-400 font-bold">{m.score1 !== null ? m.score1 : '-'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-t border-slate-800/60 mt-1">
                <span className="font-semibold text-slate-200">{m.p2.flag} {m.p2.nickname}</span>
                <span className="font-mono text-slate-400 font-bold">{m.score2 !== null ? m.score2 : '-'}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Semis Column */}
        <div className="flex flex-col gap-4 justify-center">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Semifinales</div>
          {semis.map((m) => (
            <div
              key={m.id}
              className={`p-3 rounded-xl border text-xs ${
                m.isUserMatch
                  ? 'bg-sky-950/40 border-sky-500/50 shadow-md'
                  : 'bg-slate-950/50 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between py-1">
                <span className="font-semibold text-slate-200">{m.p1.flag} {m.p1.nickname}</span>
                <span className="font-mono text-slate-400 font-bold">{m.score1 !== null ? m.score1 : '-'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-t border-slate-800/60 mt-1">
                <span className="font-semibold text-slate-200">{m.p2.flag} {m.p2.nickname}</span>
                <span className="font-mono text-slate-400 font-bold">{m.score2 !== null ? m.score2 : '-'}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Final Column */}
        <div className="flex flex-col gap-4 justify-center">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5" />
            <span>Gran Final</span>
          </div>
          <div className="p-4 rounded-xl border-2 border-amber-500/40 bg-amber-950/20 text-xs shadow-lg">
            <div className="flex items-center justify-between py-1.5">
              <span className="font-bold text-white text-sm">{finalMatch.p1.flag} {finalMatch.p1.nickname}</span>
              <span className="font-mono text-amber-400 font-bold text-sm">{finalMatch.score1 !== null ? finalMatch.score1 : '-'}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-t border-amber-500/20 mt-1">
              <span className="font-bold text-white text-sm">{finalMatch.p2.flag} {finalMatch.p2.nickname}</span>
              <span className="font-mono text-amber-400 font-bold text-sm">{finalMatch.score2 !== null ? finalMatch.score2 : '-'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action / Next Match Button */}
      {isEliminated ? (
        <div className="flex flex-col items-center p-4 bg-rose-950/30 border border-rose-800/40 rounded-xl text-center">
          <p className="text-rose-400 font-bold text-sm mb-2">¡Has sido eliminado del torneo!</p>
          <button
            onClick={onBackToMenu}
            className="py-2.5 px-5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg text-xs"
          >
            Volver al Menú
          </button>
        </div>
      ) : (
        <button
          onClick={handlePlayCurrentRound}
          className="flex items-center gap-2 py-3.5 px-8 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-extrabold rounded-xl shadow-lg transition-transform active:scale-95 text-sm"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Jugar {currentRound === 'QUARTERS' ? 'Cuartos de Final' : currentRound === 'SEMIS' ? 'Semifinal' : '¡La Gran Final!'}</span>
        </button>
      )}
    </div>
  );
};
