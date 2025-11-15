'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { StudentScore } from '@/lib/types';

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [loading, setLoading] = useState(true);
  const [myScore, setMyScore] = useState<StudentScore | null>(null);
  const [leaderboard, setLeaderboard] = useState<StudentScore[]>([]);

  useEffect(() => {
    const studentId = localStorage.getItem('currentStudentId');
    if (!studentId) {
      router.push('/student/join');
      return;
    }

    // Fetch results
    fetch(`/api/sessions/${sessionId}/results?studentId=${studentId}`)
      .then((res) => res.json())
      .then((data) => {
        setMyScore(data.myScore);
        setLeaderboard(data.leaderboard);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [sessionId, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="mb-4 text-6xl">📊</div>
          <div className="text-xl font-semibold text-gray-900 dark:text-white">
            Calculating results...
          </div>
        </div>
      </div>
    );
  }

  if (!myScore) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
        <div className="text-center">
          <div className="mb-4 text-6xl">❌</div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
            No results found
          </h1>
          <Link
            href="/student/join"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            Join a new class
          </Link>
        </div>
      </div>
    );
  }

  const percentage = (myScore.correctAnswers / myScore.totalQuestions) * 100;
  const getGrade = () => {
    if (percentage >= 90) return { emoji: '🏆', text: 'Outstanding!', color: 'text-yellow-600' };
    if (percentage >= 80) return { emoji: '🌟', text: 'Excellent!', color: 'text-green-600' };
    if (percentage >= 70) return { emoji: '👍', text: 'Good Job!', color: 'text-blue-600' };
    if (percentage >= 60) return { emoji: '👌', text: 'Nice Try!', color: 'text-purple-600' };
    return { emoji: '💪', text: 'Keep Practicing!', color: 'text-orange-600' };
  };

  const grade = getGrade();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 text-8xl">{grade.emoji}</div>
          <h1 className={`mb-2 text-4xl font-bold ${grade.color}`}>
            {grade.text}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            You've completed the quiz!
          </p>
        </div>

        {/* Score Card */}
        <div className="mb-8 rounded-3xl bg-white p-8 shadow-xl dark:bg-gray-800">
          <h2 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-white">
            Your Performance
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Total Points */}
            <div className="text-center">
              <div className="mb-2 text-4xl">⭐</div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {myScore.totalPoints}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Points
              </div>
            </div>

            {/* Accuracy */}
            <div className="text-center">
              <div className="mb-2 text-4xl">🎯</div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {percentage.toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Accuracy ({myScore.correctAnswers}/{myScore.totalQuestions})
              </div>
            </div>

            {/* Best Streak */}
            <div className="text-center">
              <div className="mb-2 text-4xl">🔥</div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {myScore.streak}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Best Streak
              </div>
            </div>
          </div>

          {/* Rank Badge */}
          {myScore.rank && (
            <div className="mt-6 text-center">
              <div className="inline-block rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-2 text-white">
                <span className="font-semibold">
                  Rank #{myScore.rank} out of {leaderboard.length}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Leaderboard */}
        {leaderboard.length > 0 && (
          <div className="mb-8 rounded-3xl bg-white p-8 shadow-xl dark:bg-gray-800">
            <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
              🏆 Leaderboard
            </h2>

            <div className="space-y-3">
              {leaderboard.slice(0, 10).map((student, index) => {
                const isMe = student.studentId === localStorage.getItem('currentStudentId');
                const rankEmoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';

                return (
                  <div
                    key={student.studentId}
                    className={`flex items-center justify-between rounded-xl p-4 ${
                      isMe
                        ? 'bg-blue-50 ring-2 ring-blue-500 dark:bg-blue-900/30 dark:ring-blue-400'
                        : 'bg-gray-50 dark:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white font-bold text-gray-900 dark:bg-gray-600 dark:text-white">
                        {rankEmoji || `#${index + 1}`}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {student.studentName}
                          {isMe && (
                            <span className="ml-2 text-sm text-blue-600 dark:text-blue-400">
                              (You)
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {student.correctAnswers}/{student.totalQuestions} correct
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-900 dark:text-white">
                        {student.totalPoints}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        points
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/student/join"
            className="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-3 text-center font-semibold text-white transition-all duration-200 hover:from-blue-600 hover:to-purple-600"
          >
            Join Another Class
          </Link>
          <Link
            href="/"
            className="flex-1 rounded-xl border-2 border-gray-300 bg-white px-6 py-3 text-center font-semibold text-gray-900 transition-all duration-200 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
