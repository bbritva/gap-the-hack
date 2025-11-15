'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Question } from '@/lib/types';

export default function QuizPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [studentId, setStudentId] = useState<string>('');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());

  useEffect(() => {
    const storedStudentId = localStorage.getItem('currentStudentId');
    if (!storedStudentId) {
      router.push('/student/join');
      return;
    }
    setStudentId(storedStudentId);

    // Fetch questions
    fetch(`/api/questions?sessionId=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        setQuestions(data.questions);
        setLoading(false);
        setStartTime(Date.now());
      })
      .catch(() => {
        setLoading(false);
      });
  }, [sessionId, router]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (index: number) => {
    if (!answered) {
      setSelectedAnswer(index);
    }
  };

  const handleSubmitAnswer = async () => {
    if (selectedAnswer === null || answered) return;

    setSubmitting(true);
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);

    try {
      const response = await fetch('/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          questionId: currentQuestion.id,
          sessionId,
          answer: selectedAnswer,
          timeTaken,
        }),
      });

      const data = await response.json();
      
      setIsCorrect(data.response.isCorrect);
      setAnswered(true);
      
      if (data.response.isCorrect) {
        setScore((prev) => prev + data.response.points);
        setStreak((prev) => prev + 1);
      } else {
        setStreak(0);
      }

      setSubmitting(false);
    } catch (err) {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setAnswered(false);
      setIsCorrect(false);
      setStartTime(Date.now());
    } else {
      // Quiz completed
      router.push(`/student/results/${sessionId}`);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="mb-4 text-6xl">📚</div>
          <div className="text-xl font-semibold text-gray-900 dark:text-white">
            Loading quiz...
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
        <div className="text-center">
          <div className="mb-4 text-6xl">📭</div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
            No questions available
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            The teacher hasn't added questions yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        {/* Header Stats */}
        <div className="mb-6 flex items-center justify-between rounded-2xl bg-white p-4 shadow-lg dark:bg-gray-800">
          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <span className="mr-2 text-2xl">⭐</span>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Points</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {score}
                </div>
              </div>
            </div>
            
            {streak > 0 && (
              <div className="flex items-center">
                <span className="mr-2 text-2xl">🔥</span>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Streak</div>
                  <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
                    {streak}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="text-right">
            <div className="text-xs text-gray-500 dark:text-gray-400">Progress</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {currentQuestionIndex + 1} / {questions.length}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
            style={{
              width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
            }}
          />
        </div>

        {/* Question Card */}
        <div className="rounded-3xl bg-white p-8 shadow-xl dark:bg-gray-800">
          {/* Topic Badge */}
          <div className="mb-4 inline-block rounded-full bg-blue-100 px-4 py-1 text-sm font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
            {currentQuestion.topic}
          </div>

          {/* Question */}
          <h2 className="mb-8 text-2xl font-bold text-gray-900 dark:text-white">
            {currentQuestion.questionText}
          </h2>

          {/* Options */}
          <div className="mb-8 space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const showCorrect = answered && index === currentQuestion.correctAnswer;
              const showWrong = answered && isSelected && !isCorrect;

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={answered}
                  className={`w-full rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                    showCorrect
                      ? 'border-green-500 bg-green-50 dark:border-green-400 dark:bg-green-900/30'
                      : showWrong
                      ? 'border-red-500 bg-red-50 dark:border-red-400 dark:bg-red-900/30'
                      : isSelected
                      ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/30'
                      : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500'
                  } ${answered ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center">
                    <div
                      className={`mr-4 flex h-8 w-8 items-center justify-center rounded-full border-2 font-semibold ${
                        showCorrect
                          ? 'border-green-500 bg-green-500 text-white'
                          : showWrong
                          ? 'border-red-500 bg-red-500 text-white'
                          : isSelected
                          ? 'border-blue-500 bg-blue-500 text-white'
                          : 'border-gray-300 text-gray-600 dark:border-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {showCorrect ? '✓' : showWrong ? '✗' : String.fromCharCode(65 + index)}
                    </div>
                    <span
                      className={`${
                        showCorrect
                          ? 'text-green-900 dark:text-green-100'
                          : showWrong
                          ? 'text-red-900 dark:text-red-100'
                          : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {option}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {answered && (
            <div
              className={`mb-6 rounded-xl p-4 ${
                isCorrect
                  ? 'bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                  : 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-200'
              }`}
            >
              <div className="flex items-center">
                <span className="mr-2 text-2xl">{isCorrect ? '🎉' : '💡'}</span>
                <div>
                  <div className="font-semibold">
                    {isCorrect ? 'Correct!' : 'Not quite right'}
                  </div>
                  <div className="text-sm">
                    {isCorrect
                      ? `Great job! You earned ${currentQuestion.points} points${
                          streak > 1 ? ` and have a ${streak} streak!` : '!'
                        }`
                      : `The correct answer is: ${
                          currentQuestion.options[currentQuestion.correctAnswer]
                        }`}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          {!answered ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null || submitting}
              className="w-full rounded-xl bg-blue-500 px-6 py-3 font-semibold text-white transition-all duration-200 hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Answer'}
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-3 font-semibold text-white transition-all duration-200 hover:from-blue-600 hover:to-purple-600"
            >
              {currentQuestionIndex < questions.length - 1
                ? 'Next Question →'
                : 'See Results 🎯'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
