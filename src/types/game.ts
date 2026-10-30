/**
 * Types and interfaces for Golazo Arcade: Duelo de Leyendas
 */

export type GameMode = 'DUEL_1V1' | 'FREE_KICK' | 'TOURNAMENT' | 'DRIBBLE_RUN';

export type AIDifficulty = 'EASY' | 'MEDIUM' | 'LEGEND';

export interface LegendPlayer {
  id: string;
  name: string;
  nickname: string;
  number: number;
  country: string;
  flag: string;
  speed: number;       // 1 - 10
  jump: number;        // 1 - 10
  power: number;       // 1 - 10
  superPowerName: string;
  superDescription: string;
  superColor: string;
  shirtColor: string;
  shortsColor: string;
  hairColor: string;
  skinColor: string;
  avatarImg?: string;
  soundCue?: string;
}

export interface MatchStats {
  p1Score: number;
  p2Score: number;
  shotsP1: number;
  shotsP2: number;
  savesP1: number;
  savesP2: number;
  supersUsedP1: number;
  supersUsedP2: number;
  timeElapsed: number;
  winner: 'p1' | 'p2' | 'draw' | null;
}

export interface TournamentMatch {
  id: string;
  round: 'QUARTERS' | 'SEMIS' | 'FINAL';
  team1: LegendPlayer;
  team2: LegendPlayer;
  score1: number | null;
  score2: number | null;
  winner: LegendPlayer | null;
  isPlayerMatch: boolean;
  completed: boolean;
}

export interface UserCareerStats {
  matchesPlayed: number;
  wins: number;
  losses: number;
  goalsScored: number;
  goalsConceded: number;
  trophiesWon: number;
  bestFreeKickScore: number;
  bestDribbleScore: number;
  unlockedAchievements: string[];
}
