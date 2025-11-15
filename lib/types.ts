// Database types for QuizClass

export interface Teacher {
  id: number;
  email: string;
  name: string;
  username?: string;
  password_hash?: string;
  created_at: Date;
}

export interface Session {
  id: number;
  teacher_id: number;
  title: string;
  code: string;
  status: 'active' | 'ended';
  created_at: Date;
  started_at?: Date;
  ended_at?: Date;
}

export interface Question {
  id: number;
  session_id: number;
  question_text: string;
  options: string[];
  correct_answer: number;
  topic?: string;
  difficulty: 'foundation' | 'application' | 'analysis';
  points: number;
  order_index: number;
  created_at: Date;
}

export interface Student {
  id: number;
  session_id: number;
  name: string;
  interests?: string[];
  joined_at: Date;
}

export interface Response {
  id: number;
  student_id: number;
  question_id: number;
  answer: string;
  is_correct: boolean;
  time_taken?: number;
  created_at: Date;
}

// Client-side types
export interface StudentProfile {
  name: string;
  interests: string[];
}

export interface QuizState {
  currentQuestionIndex: number;
  answers: Record<number, string>;
  score: number;
  streak: number;
  startTime: number;
}

export interface LeaderboardEntry {
  studentId: number;
  studentName: string;
  totalPoints: number;
  correctAnswers: number;
  totalQuestions: number;
  streak: number;
}

export interface QuestionStat {
  questionId: number;
  questionText: string;
  topic: string;
  successRate: number;
  correctResponses: number;
  totalResponses: number;
  averageTime: number;
}

export interface SessionAnalytics {
  totalStudents: number;
  totalQuestions: number;
  averageScore: number;
  leaderboard: LeaderboardEntry[];
  questionStats: QuestionStat[];
}

export interface SessionStats {
  totalStudents: number;
  activeStudents: number;
  averageScore: number;
  questionStats: {
    questionId: number;
    questionText: string;
    topic?: string;
    correctPercentage: number;
    totalResponses: number;
    averageTime: number;
  }[];
}

export interface StudentScore {
  studentId: string;
  studentName: string;
  totalPoints: number;
  correctAnswers: number;
  totalQuestions: number;
  streak: number;
}

export interface QuestionStats {
  questionId: string;
  questionText: string;
  topic?: string;
  correctCount: number;
  totalCount: number;
  averageTime: number;
}
