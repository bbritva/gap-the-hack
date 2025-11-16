'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

export default function StudentSessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [studentName, setStudentName] = useState('');
  const [sessionTitle, setSessionTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if student has joined
    const storedStudentId = localStorage.getItem('student_id');
    const storedName = localStorage.getItem('student_name');

    if (!storedStudentId) {
      router.push('/student/join');
      return;
    }

    setStudentName(storedName || 'Student');

    // Fetch session details
    fetch(`/api/sessions/${resolvedParams.sessionId}`)
      .then(res => res.json())
      .then(data => {
        if (data.session) {
          setSessionTitle(data.session.title);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load session:', err);
        setLoading(false);
      });
  }, [resolvedParams.sessionId, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-purple-500 border-r-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="w-full max-w-2xl">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8">
          {/* Success Icon */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome, {studentName}!
            </h1>

            <p className="text-lg text-gray-600 dark:text-gray-300 mb-1">
              You've successfully joined the session
            </p>

            {sessionTitle && (
              <p className="text-xl font-semibold text-purple-600 dark:text-purple-400">
                {sessionTitle}
              </p>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-6 mb-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-200 mb-1">
                  Waiting for teacher to start
                </h3>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Your teacher will begin the session shortly. Stay on this page and get ready for an exciting quiz experience!
                </p>
              </div>
            </div>
          </div>

          {/* Session Info Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 text-center">
              <div className="text-3xl mb-2">📚</div>
              <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Ready to Learn</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 text-center">
              <div className="text-3xl mb-2">🎯</div>
              <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Let's Ace This!</p>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Quick Tips
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                <span>Stay focused and read each question carefully</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                <span>Answer quickly to earn bonus points</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                <span>Keep this browser tab open during the session</span>
              </li>
            </ul>
          </div>

          {/* Back Button */}
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/student/join')}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              ← Back to Join
            </button>
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Session ID: {resolvedParams.sessionId}
          </p>
        </div>
      </div>
    </div>
  );
}
