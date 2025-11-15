'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { INTEREST_OPTIONS } from '@/lib/types';

export default function InterestsPage() {
  const router = useRouter();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if we have temporary data
    const tempName = localStorage.getItem('tempStudentName');
    const tempCode = localStorage.getItem('tempSessionCode');

    if (!tempName || !tempCode) {
      // Redirect back to join page if no temp data
      router.push('/student/join');
    }
  }, [router]);

  const toggleInterest = (interestId: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interestId)
        ? prev.filter((id) => id !== interestId)
        : [...prev, interestId]
    );
  };

  const handleContinue = async () => {
    if (selectedInterests.length === 0) {
      setError('Please select at least one interest');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const tempName = localStorage.getItem('tempStudentName');
      const tempCode = localStorage.getItem('tempSessionCode');

      if (!tempName || !tempCode) {
        router.push('/student/join');
        return;
      }

      // Get session by code
      const sessionResponse = await fetch(`/api/sessions/validate?code=${tempCode}`);
      
      if (!sessionResponse.ok) {
        setError('Session not found. Please try again.');
        setLoading(false);
        return;
      }

      const { session } = await sessionResponse.json();

      // Join session
      const joinResponse = await fetch('/api/students/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: tempName,
          sessionId: session.id,
          interests: selectedInterests,
        }),
      });

      if (!joinResponse.ok) {
        setError('Failed to join session. Please try again.');
        setLoading(false);
        return;
      }

      const { student } = await joinResponse.json();

      // Store interests and student ID
      localStorage.setItem('studentInterests', JSON.stringify(selectedInterests));
      localStorage.setItem('currentStudentId', student.id);

      // Clean up temp data
      localStorage.removeItem('tempStudentName');
      localStorage.removeItem('tempSessionCode');

      // Redirect to quiz
      router.push(`/student/quiz/${session.id}`);
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Card */}
        <div className="rounded-3xl bg-white p-8 shadow-xl dark:bg-gray-800">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-purple-500 text-4xl shadow-lg">
              ✨
            </div>
          </div>

          {/* Title */}
          <h1 className="mb-2 text-center text-3xl font-bold text-gray-900 dark:text-white">
            What are you interested in?
          </h1>
          <p className="mb-8 text-center text-gray-600 dark:text-gray-300">
            Select your interests to personalize your quiz experience
          </p>

          {/* Interests Grid */}
          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {INTEREST_OPTIONS.map((interest) => (
              <button
                key={interest.id}
                onClick={() => toggleInterest(interest.id)}
                className={`flex flex-col items-center justify-center rounded-2xl border-2 p-6 transition-all duration-200 ${
                  selectedInterests.includes(interest.id)
                    ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/30'
                    : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500'
                }`}
                disabled={loading}
              >
                <div className="mb-2 text-4xl">{interest.emoji}</div>
                <div
                  className={`text-sm font-medium ${
                    selectedInterests.includes(interest.id)
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {interest.label}
                </div>
              </button>
            ))}
          </div>

          {/* Selected Count */}
          <div className="mb-6 text-center text-sm text-gray-600 dark:text-gray-400">
            {selectedInterests.length === 0
              ? 'Select at least one interest'
              : `${selectedInterests.length} interest${selectedInterests.length > 1 ? 's' : ''} selected`}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            disabled={loading || selectedInterests.length === 0}
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
              'Continue to Quiz'
            )}
          </button>

          {/* Skip Option */}
          <button
            onClick={() => {
              // Select all interests as default
              setSelectedInterests(INTEREST_OPTIONS.map((i) => i.id));
              setTimeout(handleContinue, 100);
            }}
            disabled={loading}
            className="mt-4 w-full text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Skip (select all)
          </button>
        </div>
      </div>
    </div>
  );
}
