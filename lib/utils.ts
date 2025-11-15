// Utility functions

import { Response, StudentScore, QuestionStats, SessionAnalytics } from './types';
import { db } from './db';

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function calculateStudentScore(
  studentId: string,
  sessionId: string
): StudentScore {
  const responses = db.getResponsesByStudent(studentId);
  const sessionResponses = responses.filter((r) => r.sessionId === sessionId);
  const student = db.getStudent(studentId);

  const totalPoints = sessionResponses.reduce((sum, r) => sum + r.points, 0);
  const correctAnswers = sessionResponses.filter((r) => r.isCorrect).length;

  // Calculate streak
  let streak = 0;
  let currentStreak = 0;
  for (const response of sessionResponses.sort(
    (a, b) => a.submittedAt.getTime() - b.submittedAt.getTime()
  )) {
    if (response.isCorrect) {
      currentStreak++;
      streak = Math.max(streak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  return {
    studentId,
    studentName: student?.name || 'Unknown',
    totalPoints,
    correctAnswers,
    totalQuestions: sessionResponses.length,
    streak,
  };
}

export function calculateQuestionStats(questionId: string): QuestionStats {
  const question = db.getQuestion(questionId);
  const responses = db.getResponsesByQuestion(questionId);

  const totalResponses = responses.length;
  const correctResponses = responses.filter((r) => r.isCorrect).length;
  const averageTime =
    totalResponses > 0
      ? responses.reduce((sum, r) => sum + r.timeTaken, 0) / totalResponses
      : 0;
  const successRate = totalResponses > 0 ? correctResponses / totalResponses : 0;

  return {
    questionId,
    questionText: question?.questionText || '',
    topic: question?.topic || '',
    totalResponses,
    correctResponses,
    averageTime,
    successRate,
  };
}

export function calculateSessionAnalytics(sessionId: string): SessionAnalytics {
  const students = db.getStudentsBySession(sessionId);
  const questions = db.getQuestionsBySession(sessionId);
  const responses = db.getResponsesBySession(sessionId);

  // Calculate leaderboard
  const leaderboard = students
    .map((student) => calculateStudentScore(student.id, sessionId))
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .map((score, index) => ({ ...score, rank: index + 1 }));

  // Calculate question stats
  const questionStats = questions.map((q) => calculateQuestionStats(q.id));

  // Calculate topic performance
  const topicPerformance: { [topic: string]: number } = {};
  for (const stat of questionStats) {
    if (!topicPerformance[stat.topic]) {
      topicPerformance[stat.topic] = 0;
    }
    topicPerformance[stat.topic] += stat.successRate;
  }

  // Average topic performance
  for (const topic in topicPerformance) {
    const topicQuestions = questionStats.filter((q) => q.topic === topic).length;
    if (topicQuestions > 0) {
      topicPerformance[topic] = topicPerformance[topic] / topicQuestions;
    }
  }

  const averageScore =
    leaderboard.length > 0
      ? leaderboard.reduce((sum, s) => sum + s.totalPoints, 0) /
        leaderboard.length
      : 0;

  return {
    sessionId,
    totalStudents: students.length,
    totalQuestions: questions.length,
    averageScore,
    questionStats,
    topicPerformance,
    leaderboard,
  };
}

export function calculatePoints(
  isCorrect: boolean,
  timeTaken: number,
  basePoints: number = 100
): number {
  if (!isCorrect) return 0;

  let points = basePoints;

  // Speed bonus (answered in less than 10 seconds)
  if (timeTaken < 10) {
    points += 50;
  } else if (timeTaken < 20) {
    points += 25;
  }

  return points;
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function getPerformanceColor(successRate: number): string {
  if (successRate >= 0.7) return 'text-green-600';
  if (successRate >= 0.4) return 'text-yellow-600';
  return 'text-red-600';
}

export function getPerformanceEmoji(successRate: number): string {
  if (successRate >= 0.9) return '🔥';
  if (successRate >= 0.7) return '✅';
  if (successRate >= 0.5) return '👍';
  if (successRate >= 0.3) return '⚠️';
  return '❌';
}
