
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Question {
  id: number;
  question_text: string;
  options: string[];
  correct_answer: number;
  topic?: string;
  difficulty: string;
}

interface GeneratedQuestion {
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correct: string;
  topic?: string;
  difficulty: string;
  explanation?: string;
}

export default function TeacherSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [session, setSession] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Checkpoint modal state
  const [showCheckpointModal, setShowCheckpointModal] = useState(false);
  const [checkpointStep, setCheckpointStep] = useState<'input' | 'preview'>('input');
  const [concept, setConcept] = useState('');
  const [numQuestions, setNumQuestions] = useState(3);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'mixed'>('mixed');
  const [timeLimit, setTimeLimit] = useState<number>(60);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [approvingQuestions, setApprovingQuestions] = useState(false);
  const [previewQuestions, setPreviewQuestions] = useState<GeneratedQuestion[]>([]);
  const [checkpointError, setCheckpointError] = useState('');
  const [startingQuiz, setStartingQuiz] = useState(false);

  useEffect(() => {
    fetchSessionData();
    const interval = setInterval(fetchSessionData, 5000);
    return () => clearInterval(interval);
  }, [sessionId]);

  const fetchSessionData = async () => {
    try {
      const [sessionRes, questionsRes, studentsRes] = await Promise.all([
        fetch(`/api/sessions/${sessionId}`),
        fetch(`/api/questions?sessionId=${sessionId}`),
        fetch(`/api/sessions/${sessionId}/stats`)
      ]);

      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        setSession(sessionData.session);
      }

      if (questionsRes.ok) {
        const questionsData = await questionsRes.json();
        setQuestions(questionsData.questions || []);
      }

      if (studentsRes.ok) {
        const studentsData = await studentsRes.json();
        setStudents(studentsData.students || []);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching session data:', err);
      setError('Failed to load session data');
      setLoading(false);
    }
  };

  const handleStartQuiz = async () => {
    if (!confirm(`Start quiz now? All ${students.length} students will see the quiz immediately.`)) return;

    setStartingQuiz(true);
    try {
      const response = await fetch(`/api/sessions/${sessionId}/start-quiz`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start quiz');
      }

      // Refresh session data
      await fetchSessionData();
      alert('Quiz started! Students can now begin.');
    } catch (err) {
      console.error('Error starting quiz:', err);
      alert(err instanceof Error ? err.message : 'Failed to start quiz');
    } finally {
      setStartingQuiz(false);
    }
  };

  const handleEndSession = async () => {
    if (!confirm('Are you sure you want to end this session?')) return;

    try {
      const response = await fetch(`/api/sessions/${sessionId}/end`, {
        method: 'POST',
      });

      if (response.ok) {
        router.push('/teacher/dashboard');
      } else {
        setError('Failed to end session');
      }
    } catch (err) {
      console.error('Error ending session:', err);
      setError('Failed to end session');
    }
  };

  const handleGenerateCheckpoint = async () => {
    if (!concept.trim()) {
      setCheckpointError('Please enter a concept');
      return;
    }

    setGeneratingQuestions(true);
    setCheckpointError('');

    try {
      const response = await fetch('/api/checkpoint/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: parseInt(sessionId),
          concept: concept.trim(),
          numQuestions,
          difficulty
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate questions');
      }

      setPreviewQuestions(data.questions);
      setCheckpointStep('preview');
    } catch (err) {
      console.error('Error generating checkpoint:', err);
      setCheckpointError(err instanceof Error ? err.message : 'Failed to generate questions');
    } finally {
      setGeneratingQuestions(false);
    }
  };

  const handleApproveQuestions = async () => {
    setApprovingQuestions(true);
    setCheckpointError('');

    try {
      const response = await fetch('/api/checkpoint/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: parseInt(sessionId),
          questions: previewQuestions,
          concept,
          timeLimit
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve questions');
      }

      await fetchSessionData();
      handleCloseCheckpointModal();
    } catch (err) {
      console.error('Error approving questions:', err);
      setCheckpointError(err instanceof Error ? err.message : 'Failed to approve questions');
    } finally {
      setApprovingQuestions(false);
    }
  };

  const handleRegenerateQuestions = () => {
    setCheckpointStep('input');
    setPreviewQuestions([]);
  };

  const handleCloseCheckpointModal = () => {
    setShowCheckpointModal(false);
    setCheckpointStep('input');
    setConcept('');
    setNumQuestions(3);
    setDifficulty('mixed');
    setTimeLimit(60);
    setPreviewQuestions([]);
    setCheckpointError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading session...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">{error || 'Session not found'}</p>
          <button
            onClick={() => router.push('/teacher/dashboard')}
            className="mt-4 px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {session.title}
              </h1>
              <div className="flex items-center space-x-4 text-sm">
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full font-medium">
                  Code: {session.code}
                </span>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full font-medium">
                  {session.status === 'active' ? '🟢 Active' : '🔴 Ended'}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {students.length} {students.length === 1 ? 'student' : 'students'}
                </span>
              </div>
            </div>
            <div className="flex space-x-3">
              {session.courseContent && (
                <button
                  onClick={() => setShowCheckpointModal(true)}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Generate Checkpoint</span>
                </button>
              )}
              {questions.length > 0 && session.quizStatus !== 'in_progress' && (
                <button
                  onClick={handleStartQuiz}
                  disabled={startingQuiz}
                  className="px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-xl font-medium transition-colors flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{startingQuiz ? 'Starting...' : 'Start Quiz'}</span>
                </button>
              )}
              {session.quizStatus === 'in_progress' && (
                <div className="px-6 py-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-xl font-medium flex items-center space-x-2">
                  <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                  <span>Quiz In Progress</span>
                </div>
              )}
              <button
                onClick={handleEndSession}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors"
              >
                End Session
              </button>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Questions ({questions.length})
          </h2>
          {questions.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No questions yet
              </p>
              {session.courseContent && (
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Click "Generate Checkpoint" to create questions for specific concepts
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((q, index) => (
                <div key={q.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-medium text-gray-900 dark:text-white flex-1">
                      {index + 1}. {q.question_text}
                    </h3>
                    <span className="ml-4 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                      {q.difficulty}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {q.options.map((option, oIndex) => (
                      <div
                        key={oIndex}
                        className={`p-2 rounded-lg text-sm ${
                          oIndex === q.correct_answer
                            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                            : 'bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {String.fromCharCode(65 + oIndex)}. {option}
                      </div>
                    ))}
                  </div>
                  {q.topic && (
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Topic: {q.topic}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Students */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Students ({students.length})
          </h2>
          {students.length === 0 ? (
            <p className="text-center text-gray-600 dark:text-gray-400 py-8">
              No students have joined yet
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl"
                >
                  <p className="font-medium text-gray-900 dark:text-white">
                    {student.name}
                  </p>
                  {student.interests && student.interests.length > 0 && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {student.interests.join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Checkpoint Modal */}
      {showCheckpointModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {checkpointStep === 'input' ? 'Generate Checkpoint Questions' : 'Preview Questions'}
                </h2>
                <button
                  onClick={handleCloseCheckpointModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  disabled={generatingQuestions || approvingQuestions}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {checkpointStep === 'input' ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Concept Explained
                    </label>
                    <input
                      type="text"
                      value={concept}
                      onChange={(e) => setConcept(e.target.value)}
                      placeholder="e.g., Fractions, Photosynthesis, French Revolution"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      disabled={generatingQuestions}
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Enter the specific concept you just explained to your students
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Number of Questions
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={numQuestions}
                        onChange={(e) => setNumQuestions(parseInt(e.target.value) || 3)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        disabled={generatingQuestions}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Difficulty Level
                      </label>
                      <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value as any)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        disabled={generatingQuestions}
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                        <option value="mixed">Mixed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Time Limit (seconds)
                      </label>
                      <input
                        type="number"
                        min="10"
                        max="300"
                        step="10"
                        value={timeLimit}
                        onChange={(e) => setTimeLimit(parseInt(e.target.value) || 60)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        disabled={generatingQuestions}
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {timeLimit}s per question
                      </p>
                    </div>
                  </div>

                  {checkpointError && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                      <p className="text-sm text-red-600 dark:text-red-400">{checkpointError}</p>
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <button
                      onClick={handleCloseCheckpointModal}
                      className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      disabled={generatingQuestions}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleGenerateCheckpoint}
                      disabled={generatingQuestions || !concept.trim()}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-300 disabled:to-gray-300 text-white rounded-xl font-medium transition-all"
                    >
                      {generatingQuestions ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Generating...
                        </span>
                      ) : (
                        'Generate Questions'
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      <strong>Concept:</strong> {concept} • <strong>Difficulty:</strong> {difficulty} • <strong>{previewQuestions.length} questions</strong> • <strong>⏱️ {timeLimit}s</strong> per question
                    </p>
                  </div>

                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {previewQuestions.map((q, index) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-medium text-gray-900 dark:text-white flex-1">
                            {index + 1}. {q.question}
                          </h3>
                          <span className="ml-4 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                            {q.difficulty}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          {Object.entries(q.options).map(([letter, text]) => (
                            <div
                              key={letter}
                              className={`p-2 rounded-lg text-sm ${
                                letter === q.correct
                                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                                  : 'bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                              }`}
                            >
                              {letter}. {text}
                            </div>
                          ))}
                        </div>
                        {q.explanation && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                            💡 {q.explanation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {checkpointError && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                      <p className="text-sm text-red-600 dark:text-red-400">{checkpointError}</p>
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <button
                      onClick={handleRegenerateQuestions}
                      className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      disabled={approvingQuestions}
                    >
                      ↻ Regenerate
                    </button>
                    <button
                      onClick={handleApproveQuestions}
                      disabled={approvingQuestions}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-300 disabled:to-gray-300 text-white rounded-xl font-medium transition-all"
                    >
                      {approvingQuestions ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Approving...
                        </span>
                      ) : (
                        '✓ Approve & Add to Session'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
