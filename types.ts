
export type Subject = 'Matematik' | 'Fen' | 'Türkçe' | 'Sosyal' | 'Sistem';
export type Level = 'Kolay' | 'Orta' | 'Zor';
export type UserRole = 'Student' | 'Admin';

export interface User {
  username: string;
  role: UserRole;
  token: string;
  canSkip: boolean;
  specialKey?: string;
  password?: string;
}

export interface Report {
  id: string;
  sender: string;
  message: string;
  timestamp: number;
  status: 'pending' | 'resolved' | 'archived';
}

export interface QuizQuestion {
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_answer: string;
  solution: string;
}

// Added QuizResult interface to track user performance and answers
export interface QuizResult {
  score: number;
  total: number;
  answers: {
    questionIndex: number;
    selectedOption: string;
    isCorrect: boolean;
  }[];
}

export interface QuizSettings {
  subject: Subject;
  topic: string;
  level: Level;
  randomSeed: string;
}

export interface QuizAttempt {
  id: string;
  date: string;
  settings: QuizSettings;
  score: number;
  total: number;
  questions: QuizQuestion[];
  userAnswers: Record<number, string>;
}

export interface StudentStats {
  totalXP: number;
  level: number;
  completedQuizzes: number;
  subjectPerformance: Record<Subject, number>;
}

export interface AdminAction {
  type: 'SKIP' | 'BAN' | 'MESSAGE' | 'UNBAN' | 'AWARD_XP' | 'WARN' | 'AI_UPDATE';
  payload?: {
    durationMinutes?: number; 
    [key: string]: any;
  };
  timestamp: number;
  adminId: string;
}
