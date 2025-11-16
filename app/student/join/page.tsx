'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StudentJoinPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate inputs
    if (!name.trim()) {
      setError('Please enter your name');
      setLoading(false);
      return;
    }

    if (code.length !== 4 || !/^\d{4}$/.test(code)) {
      setError('Please enter a valid 4-digit code');
      setLoading(false);
      return;
    }

    try {
      // Check if session exists
      const sessionResponse = await fetch(`/api/sessions/validate?code=${code}`);
      const sessionData = await sessionResponse.json();

      if (!sessionResponse.ok || !sessionData.valid) {
        setError('Invalid code. Please check with your teacher.');
        setLoading(false);
        return;
      }

      // Check if student has interests stored
      const storedInterests = localStorage.getItem('student_interests');
      
      // Store student info temporarily
      localStorage.setItem('student_name', name);
      localStorage.setItem('session_code', code);

      // If no interests, redirect to interest selection
      if (!storedInterests) {
        router.push('/student/interests');
      } else {
        // Join session directly
        const joinResponse = await fetch('/api/students/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            code,
            interests: JSON.parse(storedInterests),
          }),
        });

        const joinData = await joinResponse.json();

        if (joinResponse.ok) {
          localStorage.setItem('student_id', joinData.studentId.toString());
          router.push(`/student/session/${sessionData.sessionId}`);
        } else {
          setError('Failed to join session. Please try again.');
        }
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="w-full max-w-md">
        {/* Back button */}
        <button
          onClick={() => router.push('/')}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </button>

        {/* Main card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-2xl mb-4">
              <span className="text-3xl">🎓</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Join Your Class
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Enter your name and the 4-digit code from your teacher
            </p>
          </div>

          <form onSubmit={handleJoin} className="space-y-6">
            {/* Name input */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                disabled={loading}
              />
            </div>

            {/* Code input */}
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Class Code
              </label>
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setCode(value);
                }}
                placeholder="0000"
                maxLength={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 text-center text-2xl font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                disabled={loading}
              />
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                Ask your teacher for the 4-digit code
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <p className="text-sm text-red-600 dark:text-red-400 text-center">
                  {error}
                </p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading || !name.trim() || code.length !== 4}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-semibold py-4 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Joining...
                </span>
              ) : (
                'Join Class'
              )}
            </button>
          </form>

          {/* Demo hint */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <p className="text-xs text-blue-600 dark:text-blue-400 text-center">
              💡 Demo: Try code <span className="font-bold">1234</span> to test the app
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
