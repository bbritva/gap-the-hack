'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Session } from '@/lib/types';
import { signIn, signOut, useSession } from 'next-auth/react';

export default function TeacherDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      // For MVP, allow access without auth
      setLoading(false);
      fetchSessions();
    } else if (status === 'authenticated') {
      fetchSessions();
    }
  }, [status]);

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/sessions');
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = () => {
    router.push('/teacher/create');
  };

  const handleViewSession = (sessionId: number) => {
    router.push(`/teacher/session/${sessionId}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Teacher Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage your classes and track student progress
            </p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
          >
            ← Back to Home
          </button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Sessions</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{sessions.length}</p>
              </div>
              <div className="text-4xl">📚</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Active Sessions</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {sessions.filter(s => s.status === 'active').length}
                </p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Completed</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {sessions.filter(s => s.status === 'ended').length}
                </p>
              </div>
              <div className="text-4xl">🎯</div>
            </div>
          </div>
        </div>

        {/* Create new session button */}
        <button
          onClick={handleCreateSession}
          className="w-full md:w-auto mb-8 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
        >
          <span className="text-2xl mr-3">+</span>
          Create New Session
        </button>

        {/* Sessions list */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Your Sessions
          </h2>

          {sessions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No sessions yet
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Create your first session to get started
              </p>
              <button
                onClick={handleCreateSession}
                className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-xl transition-all"
              >
                Create Session
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-700/50 rounded-2xl hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => handleViewSession(session.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {session.title}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        session.status === 'active'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                      }`}>
                        {session.status === 'active' ? '● Active' : 'Ended'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center">
                        <span className="mr-2">🔑</span>
                        Code: <span className="font-bold ml-1">{session.code}</span>
                      </span>
                      <span className="flex items-center">
                        <span className="mr-2">📅</span>
                        {new Date(session.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewSession(session.id);
                    }}
                    className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-6 rounded-xl transition-all"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
