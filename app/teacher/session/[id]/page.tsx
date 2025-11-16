'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Session, SessionStats } from '@/lib/types';

export default function SessionViewPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessionData();
    // Refresh stats every 5 seconds if session is active
    const interval = setInterval(() => {
      if (session?.status === 'active') {
        fetchStats();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [resolvedParams.id]);

  const fetchSessionData = async () => {
    try {
      const [sessionRes, statsRes] = await Promise.all([
        fetch(`/api/sessions/${resolvedParams.id}`),
        fetch(`/api/sessions/${resolvedParams.id}/stats`),
      ]);

      const sessionData = await sessionRes.json();
      const statsData = await statsRes.json();

      setSession(sessionData.session);
      setStats(statsData.stats);
    } catch (err) {
      console.error('Failed to fetch session data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/sessions/${resolvedParams.id}/stats`);
      const data = await response.json();
      setStats(data.stats);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleEndSession = async () => {
    if (!confirm('Are you sure you want to end this session?')) {
      return;
    }

    try {
      await fetch(`/api/sessions/${resolvedParams.id}/end`, {
        method: 'POST',
      });
      fetchSessionData();
    } catch (err) {
      console.error('Failed to end session:', err);
      alert('Failed to end session');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!session || !stats) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Session Not Found</h1>
          <button
            onClick={() => router.push('/teacher/dashboard')}
            className="mt-4 bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-6 rounded-xl transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/teacher/dashboard')}
            className="mb-4 flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {session.title}
              </h1>
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  session.status === 'active'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                }`}>
                  {session.status === 'active' ? '● Active' : 'Ended'}
                </span>
                <span className="text-gray-600 dark:text-gray-300">
                  Code: <span className="font-bold text-2xl">{session.code}</span>
                </span>
              </div>
            </div>
            
            {session.status === 'active' && (
              <button
                onClick={handleEndSession}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-xl transition-all"
              >
                End Session
              </button>
            )}
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Students</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {session.expected_students
                    ? `${stats.totalStudents}/${session.expected_students}`
                    : stats.totalStudents
                  }
                </p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Average Score</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {Math.round(stats.averageScore)}%
                </p>
              </div>
              <div className="text-4xl">📊</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Questions</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.questionStats.length}
                </p>
              </div>
              <div className="text-4xl">❓</div>
            </div>
          </div>
        </div>

        {/* Question performance */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Question Performance
          </h2>

          {stats.questionStats.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-gray-600 dark:text-gray-300">
                No responses yet. Students will see questions when they join.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {stats.questionStats.map((qStat, index) => {
                const isStruggling = qStat.correctPercentage < 50;
                const isGood = qStat.correctPercentage >= 70;

                return (
                  <div key={qStat.questionId} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Q{index + 1}
                          </span>
                          {qStat.topic && (
                            <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                              {qStat.topic}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-900 dark:text-white font-medium mb-2">
                          {qStat.questionText}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <div className={`text-3xl font-bold ${
                          isGood
                            ? 'text-green-600 dark:text-green-400'
                            : isStruggling
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-yellow-600 dark:text-yellow-400'
                        }`}>
                          {Math.round(qStat.correctPercentage)}%
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {qStat.totalResponses} responses
                        </div>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isGood
                            ? 'bg-green-500'
                            : isStruggling
                            ? 'bg-red-500'
                            : 'bg-yellow-500'
                        }`}
                        style={{ width: `${qStat.correctPercentage}%` }}
                      ></div>
                    </div>

                    {/* Warning for struggling topics */}
                    {isStruggling && qStat.totalResponses > 0 && (
                      <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm text-red-700 dark:text-red-400">
                          ⚠️ Students are struggling with this topic. Consider reviewing it.
                        </p>
                      </div>
                    )}

                    {qStat.averageTime > 0 && (
                      <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Average time: {Math.round(qStat.averageTime)}s
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
