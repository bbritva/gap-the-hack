'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Question } from '@/lib/types';

interface PersonalizedQuestion extends Question {
  personalizedText?: string;
  personalizedOptions?: string[];
  usedInterest?: string;
}

export default function QuizPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [questions, setQuestions] = useState<PersonalizedQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [studentId, setStudentId] = useState<number | null>(null);
  const [personalizing, setPersonalizing] = useState(false);

  useEffect(() => {
    const storedStudentId = localStorage.getItem('student_id');
    if (!storedStudentId) {
      router.push('/student/join');
      return;
    }
    setStudentId(parseInt(storedStudentId));

    loadAndPersonalizeQuestions();
  }, [resolvedParams.sessionId, router]);

  const loadAndPersonalizeQuestions = async () => {
    try {
      // Fetch questions
      const questionsRes = await fetch(`/api/questions?sessionId=${resolvedParams.sessionId}`);
      const questionsData = await questionsRes.json();
      
      if (!questionsData.questions || questionsData.questions.length === 0) {
        setLoading(false);
        return;
      }

      // Get student interests from localStorage
      const storedInterests = localStorage.getItem('student_interests');
      const studentInterests: string[] = storedInterests ? JSON.parse(storedInterests) : [];

      console.log('Student interests:', studentInterests);

      // If student has interests, personalize questions
      if (studentInterests.length > 0) {
        setPersonalizing(true);
        const personalizedQuestions = await Promise.all(
          questionsData.questions.map(async (question: Question) => {
            try {
              // Personalize each question
              const response = await fetch('/api/questions/personalize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  questionText: question.question_text,
                  options: {
                    A: question.options[0],
                    B: question.options[1],
                    C: question.options[2],
                    D: question.options[3]
                  },
                  studentInterests: studentInterests.slice(0, 3), // Max 3 interests
                  concept: question.topic || 'General'
                }),
              });

              if (response.ok) {
                const data = await response.json();
                console.log('Personalized question:', data);
                
                return {
                  ...question,
                  personalizedText: data.personalizedQuestion,
                  personalizedOptions: [
                    data.options.A,
                    data.options.B,
                    data.options.C,
                    data.options.D
                  ],
                  usedInterest: data.usedInterest
                };
              } else {
                console.warn('Failed to personalize question, using original');
                return question;
              }
            } catch (error) {
              console.error('Error personalizing question:', error);
              return question;
            }
          })
        );

        setQuestions(personalizedQuestions);
        setPersonalizing(false);
      } else {
        // No interests, use original questions
        setQuestions(questionsData.questions);
      }

      setLoading(false);
      setQuestionStartTime(Date.now());
    } catch (err) {
      console.error('Error loading questions:', err);
      alert('Failed to load questions');
      router.push('/student/join');
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  
  // Use personalized text/options if available, otherwise use original
  const displayQuestion = currentQuestion?.personalizedText || currentQuestion?.question_text;
  const displayOptions = currentQuestion?.personalizedOptions || currentQuestion?.options;

  const handleAnswerSelect = (answer: number) => {
    if (!showFeedback) {
      setSelectedAnswer(answer);
    }
  };

  const handleSubmitAnswer = async () => {
    if (selectedAnswer === null || !studentId) return;

    setSubmitting(true);
    const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000);
    const correct = selectedAnswer === currentQuestion.correct_answer;

    // Calculate points
    let points = 0;
    if (correct) {
      points = 100;
      // Speed bonus (max 50 points for answers under 5 seconds)
      if (timeTaken < 5) {
        points += 50;
      } else if (timeTaken < 10) {
        points += 25;
      }
      // Streak bonus
      points += streak * 10;
    }

    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      setScore(prev => prev + points);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }

    // Submit response to backend
    try {
      await fetch('/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          questionId: currentQuestion.id,
          answer: selectedAnswer,
          isCorrect: correct,
          timeTaken,
        }),
      });
    } catch (err) {
      console.error('Failed to submit response:', err);
    }

    setSubmitting(false);

    // Auto-advance after 2 seconds
    setTimeout(() => {
      handleNextQuestion();
    }, 2000);
  };

  const handleNextQuestion = () => {
    if (isLastQuestion) {
      // Quiz complete - go to results
      router.push(`/student/results/${resolvedParams.sessionId}`);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setIsCorrect(false);
      setQuestionStartTime(Date.now());
    }
  };

  if (loading || personalizing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            {personalizing ? 'Personalizing your quiz...' : 'Loading quiz...'}
          </p>
          {personalizing && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Making questions more engaging based on your interests ✨
            </p>
          )}
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">📝</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Questions Yet</h1>
          <p className="text-gray-600 dark:text-gray-300">Your teacher hasn't added questions to this session.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      {/* Header with stats */}
      <div className="w-full max-w-4xl mx-auto mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <span className="text-2xl mr-2">⭐</span>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Score</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">{score}</div>
              </div>
            </div>
            {streak > 0 && (
              <div className="flex items-center">
                <span className="text-2xl mr-2">🔥</span>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Streak</div>
                  <div className="text-xl font-bold text-orange-500">{streak}</div>
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
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-4xl mx-auto mb-6">
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Question card */}
      <div className="w-full max-w-4xl mx-auto flex-1">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8">
          {/* Question */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              {currentQuestion.topic && (
                <div className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                  {currentQuestion.topic}
                </div>
              )}
              {currentQuestion.usedInterest && (
                <div className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                  ✨ {currentQuestion.usedInterest}
                </div>
              )}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {displayQuestion}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Select the correct answer
            </p>
          </div>

          {/* Options */}
          <div className="space-y-4 mb-8">
            {displayOptions?.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrectAnswer = index === currentQuestion.correct_answer;
              const showCorrect = showFeedback && isCorrectAnswer;
              const showIncorrect = showFeedback && isSelected && !isCorrectAnswer;

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showFeedback || submitting}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 transform hover:scale-102 ${
                    showCorrect
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : showIncorrect
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : isSelected
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                  } ${showFeedback || submitting ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${
                      showCorrect
                        ? 'text-green-700 dark:text-green-300'
                        : showIncorrect
                        ? 'text-red-700 dark:text-red-300'
                        : isSelected
                        ? 'text-blue-700 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {option}
                    </span>
                    {showCorrect && <span className="text-2xl">✓</span>}
                    {showIncorrect && <span className="text-2xl">✗</span>}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {showFeedback && (
            <div className={`mb-6 p-4 rounded-xl ${
              isCorrect
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            }`}>
              <p className={`text-center font-semibold ${
                isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
              }`}>
                {isCorrect ? '🎉 Correct! Great job!' : '❌ Incorrect. The correct answer is highlighted above.'}
              </p>
            </div>
          )}

          {/* Submit button */}
          {!showFeedback && (
            <button
              onClick={handleSubmitAnswer}
              disabled={!selectedAnswer || submitting}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-300 disabled:to-gray-300 dark:disabled:from-gray-700 dark:disabled:to-gray-700 text-white font-bold py-4 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {submitting ? 'Submitting...' : 'Submit Answer'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
