'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface QuestionForm {
  questionText: string;
  options: string[];
  correctAnswer: number;
  topic: string;
  difficulty: 'foundation' | 'application' | 'analysis';
  points: number;
}

export default function CreateSessionPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState<QuestionForm[]>([
    {
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      topic: '',
      difficulty: 'application',
      points: 100,
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        topic: '',
        difficulty: 'application',
        points: 100,
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: keyof QuestionForm, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!title.trim()) {
      setError('Please enter a session title');
      return;
    }

    if (questions.length === 0) {
      setError('Please add at least one question');
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        setError(`Question ${i + 1}: Please enter the question text`);
        return;
      }
      if (!q.topic.trim()) {
        setError(`Question ${i + 1}: Please enter a topic`);
        return;
      }
      if (q.options.some((opt) => !opt.trim())) {
        setError(`Question ${i + 1}: Please fill in all options`);
        return;
      }
    }

    setLoading(true);

    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          questions,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const data = await response.json();
      router.push(`/teacher/session/${data.session.id}`);
    } catch (err) {
      setError('Failed to create session. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/teacher/dashboard"
            className="mb-4 inline-flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
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
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create New Session
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Add questions for your quiz session
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Session Title */}
          <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Session Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Biology Chapter 5 Quiz"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              disabled={loading}
            />
          </div>

          {/* Questions */}
          {questions.map((question, qIndex) => (
            <div
              key={qIndex}
              className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Question {qIndex + 1}
                </h3>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(qIndex)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400"
                    disabled={loading}
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {/* Question Text */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Question
                  </label>
                  <textarea
                    value={question.questionText}
                    onChange={(e) =>
                      updateQuestion(qIndex, 'questionText', e.target.value)
                    }
                    placeholder="Enter your question"
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    disabled={loading}
                  />
                </div>

                {/* Options */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Options
                  </label>
                  <div className="space-y-2">
                    {question.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name={`correct-${qIndex}`}
                          checked={question.correctAnswer === oIndex}
                          onChange={() =>
                            updateQuestion(qIndex, 'correctAnswer', oIndex)
                          }
                          className="h-4 w-4 text-purple-600"
                          disabled={loading}
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) =>
                            updateOption(qIndex, oIndex, e.target.value)
                          }
                          placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                          className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                          disabled={loading}
                        />
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Select the correct answer by clicking the radio button
                  </p>
                </div>

                {/* Topic and Difficulty */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Topic
                    </label>
                    <input
                      type="text"
                      value={question.topic}
                      onChange={(e) =>
                        updateQuestion(qIndex, 'topic', e.target.value)
                      }
                      placeholder="e.g., Photosynthesis"
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Difficulty
                    </label>
                    <select
                      value={question.difficulty}
                      onChange={(e) =>
                        updateQuestion(
                          qIndex,
                          'difficulty',
                          e.target.value as any
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      disabled={loading}
                    >
                      <option value="foundation">Foundation</option>
                      <option value="application">Application</option>
                      <option value="analysis">Analysis</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Add Question Button */}
          <button
            type="button"
            onClick={addQuestion}
            className="w-full rounded-xl border-2 border-dashed border-gray-300 bg-white px-6 py-4 font-semibold text-gray-700 transition-colors hover:border-purple-500 hover:text-purple-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-purple-400 dark:hover:text-purple-400"
            disabled={loading}
          >
            + Add Another Question
          </button>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-3 font-semibold text-white transition-all duration-200 hover:from-purple-600 hover:to-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Creating Session...' : 'Create Session'}
          </button>
        </form>
      </div>
    </div>
  );
}
