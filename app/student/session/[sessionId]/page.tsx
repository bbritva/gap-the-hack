'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

export default function StudentSessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [sessionData, setSessionData] = useState<any>(null);
  const [studentName, setStudentName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Get student info from localStorage
    const storedName = localStorage.getItem('student_name');
    const storedStudentId = localStorage.getItem('student_id');
    const storedSessionCode = localStorage.getItem('session_code');

    if (!storedName || !storedStudentId) {
      router.push('/student/join');
      return;
    }

    setStudentName(storedName);

    // Fetch session data
    fetch(`/api/sessions/${resolvedParams.sessionId}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Session not found');
        }
        return res.json();
      })
      .then(data => {
        setSessionData(data.session);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching session:', err);
        setError('Failed to load session. Please try again.');
        setLoading(false);
      });
  }, [resolvedParams.sessionId, router]);

  const handleLeaveSession = () => {
    // Clear student data
    localStorage.removeItem('student_name');
    localStorage.removeItem('student_id');
    localStorage.removeItem('session_code');
    
    // Redirect to join page
    router.push('/student/join');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading session...</p>
        </div>
      </div>
    );
  }

  if (error || !sessionData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Session Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {error || 'The session you are looking for does not exist.'}
            </p>
            <button
              onClick={() => router.push('/student/join')}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-105"
            >
              Back to Join
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="w-full max-w-2xl">
        {/* Main card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl mb-4">
              <span className="text-4xl">🎓</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome, {studentName}!
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              You've successfully joined the session
            </p>
          </div>

          {/* Session Info */}
          <div className="space-y-4 mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Session Title</p>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {sessionData.title}
                  </h2>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Session Code</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 tracking-wider">
                    {sessionData.code}
                  </p>
                </div>
              </div>
              
              {/* Status Badge */}
              <div className="flex items-center justify-center">
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                  sessionData.status === 'active' 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  <span className="w-2 h-2 bg-current rounded-full mr-2 animate-pulse"></span>
                  {sessionData.status === 'active' ? 'Session Active' : 'Session Ended'}
                </div>
              </div>
            </div>

            {/* Waiting Message */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-6 text-center">
              <div className="text-4xl mb-3">⏳</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Waiting for Quiz to Start
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your teacher will start the quiz shortly. Stay on this page and get ready!
              </p>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <span className="text-2xl mr-2">📋</span>
                What to Expect
              </h3>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Answer multiple-choice questions at your own pace</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Earn points for correct answers and speed bonuses</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Build streaks by answering consecutively correct</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>See your results and compare with classmates at the end</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Placeholder for Start Quiz button - will be enabled when quiz starts */}
            <button
              disabled
              className="w-full bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-semibold py-4 rounded-xl cursor-not-allowed"
            >
              Quiz Not Started Yet
            </button>

            {/* Leave Session Button */}
            <button
              onClick={handleLeaveSession}
              className="w-full bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 font-semibold py-3 rounded-xl transition-all duration-200"
            >
              Leave Session
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              💡 Keep this page open. The quiz will start automatically when your teacher begins.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
