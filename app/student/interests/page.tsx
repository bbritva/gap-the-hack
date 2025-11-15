'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AVAILABLE_INTERESTS = [
  { id: 'sports', label: 'Sports', emoji: '⚽' },
  { id: 'music', label: 'Music', emoji: '🎵' },
  { id: 'technology', label: 'Technology', emoji: '💻' },
  { id: 'art', label: 'Art', emoji: '🎨' },
  { id: 'science', label: 'Science', emoji: '🔬' },
  { id: 'gaming', label: 'Gaming', emoji: '🎮' },
  { id: 'reading', label: 'Reading', emoji: '📚' },
  { id: 'cooking', label: 'Cooking', emoji: '🍳' },
  { id: 'nature', label: 'Nature', emoji: '🌿' },
  { id: 'movies', label: 'Movies', emoji: '🎬' },
  { id: 'travel', label: 'Travel', emoji: '✈️' },
  { id: 'animals', label: 'Animals', emoji: '🐾' },
];

export default function InterestsPage() {
  const router = useRouter();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  useEffect(() => {
    // Get stored data
    const storedName = localStorage.getItem('student_name');
    const storedCode = localStorage.getItem('session_code');

    if (!storedName || !storedCode) {
      router.push('/student/join');
      return;
    }

    setName(storedName);
    setCode(storedCode);
  }, [router]);

  const toggleInterest = (interestId: string) => {
    setSelectedInterests(prev => 
      prev.includes(interestId)
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    );
  };

  const handleContinue = async () => {
    if (selectedInterests.length === 0) {
      return;
    }

    setLoading(true);

    try {
      // Save interests to localStorage
      localStorage.setItem('student_interests', JSON.stringify(selectedInterests));

      // Join the session
      const response = await fetch('/api/students/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          code,
          interests: selectedInterests,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('student_id', data.studentId.toString());
        router.push(`/student/quiz/${data.sessionId}`);
      } else {
        alert('Failed to join session. Please try again.');
        router.push('/student/join');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong. Please try again.');
      router.push('/student/join');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);

    try {
      // Join without interests
      const response = await fetch('/api/students/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          code,
          interests: [],
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('student_id', data.studentId.toString());
        router.push(`/student/quiz/${data.sessionId}`);
      } else {
        alert('Failed to join session. Please try again.');
        router.push('/student/join');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong. Please try again.');
      router.push('/student/join');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="w-full max-w-2xl">
        {/* Main card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500 rounded-2xl mb-4">
              <span className="text-3xl">✨</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              What are you interested in?
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Select your interests to personalize your quiz experience
            </p>
          </div>

          {/* Interests grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
            {AVAILABLE_INTERESTS.map((interest) => (
              <button
                key={interest.id}
                onClick={() => toggleInterest(interest.id)}
                className={`p-4 rounded-2xl border-2 transition-all duration-200 transform hover:scale-105 ${
                  selectedInterests.includes(interest.id)
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                }`}
                disabled={loading}
              >
                <div className="text-4xl mb-2">{interest.emoji}</div>
                <div className={`text-sm font-medium ${
                  selectedInterests.includes(interest.id)
                    ? 'text-purple-700 dark:text-purple-300'
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {interest.label}
                </div>
              </button>
            ))}
          </div>

          {/* Selected count */}
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {selectedInterests.length === 0 
                ? 'Select at least one interest to continue'
                : `${selectedInterests.length} interest${selectedInterests.length > 1 ? 's' : ''} selected`
              }
            </p>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <button
              onClick={handleContinue}
              disabled={loading || selectedInterests.length === 0}
              className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-semibold py-4 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
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
                'Continue to Quiz'
              )}
            </button>

            <button
              onClick={handleSkip}
              disabled={loading}
              className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-3 rounded-xl transition-all duration-200"
            >
              Skip for now
            </button>
          </div>

          {/* Info box */}
          <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
            <p className="text-xs text-purple-600 dark:text-purple-400 text-center">
              💡 Your interests help us make questions more relatable and fun!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
