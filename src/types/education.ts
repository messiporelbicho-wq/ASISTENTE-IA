export type SubjectId =
  | 'comunicacion'
  | 'matematica'
  | 'ciencias'
  | 'sociales'
  | 'idiomas'
  | 'programacion';

export type AcademicLevel = 'primaria' | 'secundaria' | 'preuniversitario' | 'universitario';

export type TutorMode = 'explicacion' | 'socratico' | 'resumen' | 'quiz';

export interface PromptStarter {
  label: string;
  prompt: string;
  icon?: string;
}

export interface SubjectConfig {
  id: SubjectId;
  name: string;
  category: string;
  tagline: string;
  description: string;
  color: string;
  accentBg: string;
  borderColor: string;
  avatarImg: string;
  subtopics: string[];
  promptStarters: PromptStarter[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  subjectId: SubjectId;
}

export interface SolverStep {
  stepNumber: number;
  title: string;
  explanation: string;
  formulaOrCode?: string;
}

export interface SolverResult {
  title: string;
  subject: string;
  steps: SolverStep[];
  finalAnswer: string;
  tipOrVerification?: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface QuizData {
  topic: string;
  questions: QuizQuestion[];
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface SummaryResult {
  title: string;
  summary: string;
  keyPoints: string[];
  glossary?: { term: string; definition: string }[];
  flashcards: Flashcard[];
}

export interface SavedNote {
  id: string;
  subjectId: SubjectId;
  title: string;
  content: string;
  date?: string;
  createdAt?: string;
  category?: string;
  type?: 'chat' | 'solution' | 'summary';
}
