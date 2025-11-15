// Core data types for the quiz application

export interface Teacher {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface Session {
  id: string;
  teacherId: string;
  title: string;
  code: string; // 4-digit code
  status: 'active' | 'ended';
  createdAt: Date;
  startedAt?: Date;
  endedAt?: Date;
}

export interface Question {
  id: string;
  sessionId: string;
  questionText: string;
  options: string[];
  correctAnswer: number; // index of correct option
  topic: string;
  difficulty: 'foundation' | 'application' | 'analysis';
  points: number;
}

export interface Student {
  id: string;
  name: string;
  sessionId: string;
  interests: string[];
  joinedAt: Date;
}

export interface Response {
  id: string;
  studentId: string;
  questionId: string;
  sessionId: string;
  answer: number; // selected option index
  isCorrect: boolean;
  timeTaken: number; // in seconds
  points: number;
  submittedAt: Date;
}

export interface StudentScore {
  studentId: string;
  studentName: string;
  totalPoints: number;
  correctAnswers: number;
  totalQuestions: number;
  streak: number;
  rank?: number;
}

export interface QuestionStats {
  questionId: string;
  questionText: string;
  topic: string;
  totalResponses: number;
  correctResponses: number;
  averageTime: number;
  successRate: number;
}

export interface SessionAnalytics {
  sessionId: string;
  totalStudents: number;
  totalQuestions: number;
  averageScore: number;
  questionStats: QuestionStats[];
  topicPerformance: { [topic: string]: number };
  leaderboard: StudentScore[];
}

// Interest options for students
export const INTEREST_OPTIONS = [
  { id: 'sports', label: 'Sports', emoji: '⚽' },
  { id: 'music', label: 'Music', emoji: '🎵' },
  { id: 'technology', label: 'Technology', emoji: '💻' },
  { id: 'art', label: 'Art', emoji: '🎨' },
  { id: 'science', label: 'Science', emoji: '🔬' },
  { id: 'gaming', label: 'Gaming', emoji: '🎮' },
  { id: 'reading', label: 'Reading', emoji: '📚' },
  { id: 'nature', label: 'Nature', emoji: '🌿' },
] as const;

export type InterestId = typeof INTEREST_OPTIONS[number]['id'];
