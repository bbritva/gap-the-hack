'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Session, SessionAnalytics } from '@/lib/types';

export default function SessionViewPage() {
  const params = useParams();
  const sessionId = params.id as string;

  const [session, setSession] = useState<Session | null>(null);
  const [analytics, setAnalytics] = useState<SessionAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchSessionData();
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchSessionData, 5000);
    return () => clearInterval(interval);
  }, [sessionId]);

  const fetchSessionData = async () => {
    try {
      const [sessionRes, analyticsRes] = await Promise.all([
        fetch(`/api/sessions/${sessionId}`),
        fetch(`/api/sessions/${sessionId}/analytics`),
      ]);

      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        setSession(sessionData.session);
      }

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData.analytics);
      }

      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const copyCode = () => {
    if (session) {
      navigator.clipboard.writeText(session.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleEndSession = async () => {
    if (!confirm('Are you sure you want to end this session?')) return;

    try {
      await fetch(`/api/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ended' }),
      });
      fetchSessionData();
    } catch (err) {
      alert('Failed to end session');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="mb-4 text-6xl">📊</div>
          <div className="text-xl font-semibold text-gray-900 dark:text-white">
            Loading session...
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
        <div className="text-center">
          <div className="mb-4 text-6xl">❌</div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
            Session not found
          </h1>
          <Link
            href="/teacher/dashboard"
            className="text-purple-600 hover:underline dark:text-purple-400"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/teacher/dashboard"
            className="mb-4 inline-flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg
              className="mr-2 h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {session.title}
              </h1>
              <div className="mt-2 flex items-center space-x-4">
                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${
                    session.status === 'active'
                      ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                >
                  {session.status === 'active' ? '🟢 Active' : '⚫ Ended'}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Created {new Date(session.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            {session.status === 'active' && (
              <button
                onClick={handleEndSession}
                className="rounded-lg bg-red-500 px-6 py-2 font-semibold text-white transition-colors hover:bg-red-600"
              >
                End Session
              </button>
            )}
          </div>
        </div>

        {/* Join Code Card */}
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 p-8 text-white shadow-xl">
          <div className="text-center">
            <div className="mb-2 text-sm font-medium opacity-90">
              Share this code with students
            </div>
            <div className="mb-4 text-6xl font-bold tracking-widest">
              {session.code}
            </div>
            <button
              onClick={copyCode}
              className="rounded-lg bg-white/20 px-6 py-2 font-semibold backdrop-blur-sm transition-colors hover:bg-white/30"
            >
              {copied ? '✓ Copied!' : 'Copy Code'}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        {analytics && (
          <>
            <div className="mb-8 grid gap-6 md:grid-cols-4">
              <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
                <div className="mb-2 text-3xl">👥</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {analytics.totalStudents}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Students Joined
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
                <div className="mb-2 text-3xl">❓</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {analytics.totalQuestions}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Questions
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
                <div className="mb-2 text-3xl">📊</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {analytics.averageScore.toFixed(0)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Average Score
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
                <div className="mb-2 text-3xl">
                  {analytics.leaderboard.length > 0 ? '🏆' : '⏳'}
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {analytics.leaderboard.length > 0
                    ? analytics.leaderboard[0].studentName.split(' ')[0]
                    : '-'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Top Student
                </div>
              </div>
            </div>

            {/* Leaderboard */}
            {analytics.leaderboard.length > 0 && (
              <div className="mb-8 rounded-2xl bg-white p-8 shadow-lg dark:bg-gray-800">
                <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
                  🏆 Leaderboard
                </h2>
                <div className="space-y-3">
                  {analytics.leaderboard.map((student, index) => {
                    const rankEmoji =
                      index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
                    return (
                      <div
                        key={student.studentId}
                        className="flex items-center justify-between rounded-xl bg-gray-50 p-4 dark:bg-gray-700"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white font-bold text-gray-900 dark:bg-gray-600 dark:text-white">
                            {rankEmoji || `#${index + 1}`}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {student.studentName}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {student.correctAnswers}/{student.totalQuestions} correct
                              {student.streak > 0 && ` • ${student.streak} streak 🔥`}
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

            {/* Question Performance */}
            {analytics.questionStats.length > 0 && (
              <div className="rounded-2xl bg-white p-8 shadow-lg dark:bg-gray-800">
                <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
                  📈 Question Performance
                </h2>
                <div className="space-y-4">
                  {analytics.questionStats.map((stat, index) => {
                    const successRate = stat.successRate * 100;
                    const color =
                      successRate >= 70
                        ? 'bg-green-500'
                        : successRate >= 40
                        ? 'bg-yellow-500'
                        : 'bg-red-500';

                    return (
                      <div key={stat.questionId}>
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-white">
                              Q{index + 1}: {stat.questionText}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Topic: {stat.topic} • {stat.totalResponses} responses
                            </div>
                          </div>
                          <div className="ml-4 text-right">
                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                              {successRate.toFixed(0)}%
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {stat.correctResponses}/{stat.totalResponses} correct
                            </div>
                          </div>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                          <div
                            className={`h-full ${color} transition-all duration-300`}
                            style={{ width: `${successRate}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {analytics && analytics.totalStudents === 0 && (
          <div className="rounded-2xl bg-white p-12 text-center shadow-lg dark:bg-gray-800">
            <div className="mb-4 text-6xl">⏳</div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
              Waiting for students...
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Share the code <span className="font-bold">{session.code}</span> with your
              students to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
