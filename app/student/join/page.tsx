'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function StudentJoinPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
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

      // Check if session exists
      const sessionResponse = await fetch(`/api/sessions/validate?code=${code}`);
      
      if (!sessionResponse.ok) {
        setError('Invalid code. Please check and try again.');
        setLoading(false);
        return;
      }

      const { session } = await sessionResponse.json();

      // Check if student has interests stored
      const hasInterests = localStorage.getItem('studentInterests');

      if (!hasInterests) {
        // Store temporary data and redirect to interests page
        localStorage.setItem('tempStudentName', name);
        localStorage.setItem('tempSessionCode', code);
        router.push('/student/interests');
      } else {
        // Join session directly
        const joinResponse = await fetch('/api/students/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            sessionId: session.id,
            interests: JSON.parse(hasInterests),
          }),
        });

        if (!joinResponse.ok) {
          setError('Failed to join session. Please try again.');
          setLoading(false);
          return;
        }

        const { student } = await joinResponse.json();
        
        // Store student ID
        localStorage.setItem('currentStudentId', student.id);
        
        // Redirect to quiz
        router.push(`/student/quiz/${session.id}`);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Link
          href="/"
          className="mb-6 inline-flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
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
          Back to Home
        </Link>

        {/* Card */}
        <div className="rounded-3xl bg-white p-8 shadow-xl dark:bg-gray-800">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-500 text-4xl shadow-lg">
              🎓
            </div>
          </div>

          {/* Title */}
          <h1 className="mb-2 text-center text-3xl font-bold text-gray-900 dark:text-white">
            Join Your Class
          </h1>
          <p className="mb-8 text-center text-gray-600 dark:text-gray-300">
            Enter your name and the class code to get started
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Input */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Your Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
                disabled={loading}
              />
            </div>

            {/* Code Input */}
            <div>
              <label
                htmlFor="code"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
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
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-center text-2xl font-bold tracking-widest text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
                disabled={loading}
              />
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Ask your teacher for the 4-digit code
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !name.trim() || code.length !== 4}
              className="w-full rounded-xl bg-blue-500 px-6 py-3 font-semibold text-white transition-all duration-200 hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="mr-2 h-5 w-5 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Joining...
                </span>
              ) : (
                'Join Class'
              )}
            </button>
          </form>
        </div>

        {/* Help Text */}
        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Don't have a code? Ask your teacher to create a session.
        </p>
      </div>
    </div>
  );
}
