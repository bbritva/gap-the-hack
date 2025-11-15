'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { LeaderboardEntry } from '@/lib/types';

export default function ResultsPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [studentId, setStudentId] = useState<number | null>(null);
  const [studentRank, setStudentRank] = useState<number>(0);
  const [studentScore, setStudentScore] = useState<number>(0);
  const [studentCorrect, setStudentCorrect] = useState<number>(0);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);

  useEffect(() => {
    const storedStudentId = localStorage.getItem('student_id');
    if (!storedStudentId) {
      router.push('/student/join');
      return;
    }
    const id = parseInt(storedStudentId);
    setStudentId(id);

    // Fetch leaderboard
    fetch(`/api/leaderboard?sessionId=${resolvedParams.sessionId}`)
      .then(res => res.json())
      .then(data => {
        setLeaderboard(data.leaderboard);
        
        // Find student's position
        const studentEntry = data.leaderboard.find((entry: LeaderboardEntry) => entry.studentId === id);
        if (studentEntry) {
          const rank = data.leaderboard.indexOf(studentEntry) + 1;
          setStudentRank(rank);
          setStudentScore(studentEntry.totalPoints);
          setStudentCorrect(studentEntry.correctAnswers);
          setTotalQuestions(studentEntry.totalQuestions);
        }
        
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [resolvedParams.sessionId, router]);

  const handleFinish = () => {
    // Clear student data
    localStorage.removeItem('student_id');
    localStorage.removeItem('student_name');
    localStorage.removeItem('session_code');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading results...</p>
        </div>
      </div>
    );
  }

  const percentage = totalQuestions > 0 ? Math.round((studentCorrect / totalQuestions) * 100) : 0;
  const isTopThree = studentRank <= 3 && studentRank > 0;

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="w-full max-w-4xl mx-auto">
        {/* Celebration header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">
            {isTopThree ? '🏆' : percentage >= 70 ? '🎉' : percentage >= 50 ? '👍' : '💪'}
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {isTopThree ? 'Amazing!' : percentage >= 70 ? 'Great Job!' : percentage >= 50 ? 'Good Effort!' : 'Keep Practicing!'}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            You've completed the quiz
          </p>
        </div>

        {/* Score card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {studentScore}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Score</div>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl">
              <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                {studentCorrect}/{totalQuestions}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Correct Answers</div>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl">
              <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {percentage}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy</div>
            </div>
          </div>

          {/* Rank badge */}
          {studentRank > 0 && (
            <div className="text-center mb-6">
              <div className={`inline-flex items-center px-6 py-3 rounded-full ${
                studentRank === 1
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                  : studentRank === 2
                  ? 'bg-gradient-to-r from-gray-300 to-gray-400'
                  : studentRank === 3
                  ? 'bg-gradient-to-r from-orange-400 to-orange-500'
                  : 'bg-gradient-to-r from-blue-400 to-blue-500'
              } text-white font-bold text-lg shadow-lg`}>
                <span className="text-2xl mr-2">
                  {studentRank === 1 ? '🥇' : studentRank === 2 ? '🥈' : studentRank === 3 ? '🥉' : '🎯'}
                </span>
                Rank #{studentRank}
              </div>
            </div>
          )}
        </div>

        {/* Leaderboard */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            🏆 Class Leaderboard
          </h2>
          
          <div className="space-y-3">
            {leaderboard.slice(0, 10).map((entry, index) => {
              const isCurrentStudent = entry.studentId === studentId;
              const rank = index + 1;
              
              return (
                <div
                  key={entry.studentId}
                  className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                    isCurrentStudent
                      ? 'bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 border-2 border-blue-500 shadow-lg'
                      : 'bg-gray-50 dark:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                      rank === 1
                        ? 'bg-yellow-400 text-yellow-900'
                        : rank === 2
                        ? 'bg-gray-300 text-gray-700'
                        : rank === 3
                        ? 'bg-orange-400 text-orange-900'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                    }`}>
                      {rank <= 3 ? (rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉') : rank}
                    </div>
                    
                    <div>
                      <div className={`font-semibold ${
                        isCurrentStudent
                          ? 'text-blue-700 dark:text-blue-300'
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {entry.studentName} {isCurrentStudent && '(You)'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {entry.correctAnswers}/{entry.totalQuestions} correct
                      </div>
                    </div>
                  </div>
                  
                  <div className={`text-2xl font-bold ${
                    isCurrentStudent
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {entry.totalPoints}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action button */}
        <button
          onClick={handleFinish}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          Finish & Return Home
        </button>
      </div>
    </div>
  );
}
