import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { SignOut } from '@/app/components/sign-out';

export default async function TeacherDashboard() {
  const session = await auth();

  if (!session?.user) {
    redirect('/teacher/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                QuizClass
              </Link>
              <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                Teacher
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {session.user.name}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {session.user.email}
                </div>
              </div>
              <SignOut />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {session.user.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your classes and track student progress
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/teacher/create"
            className="group rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 p-6 text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
          >
            <div className="mb-4 text-4xl">➕</div>
            <h3 className="mb-2 text-xl font-bold">Create New Session</h3>
            <p className="text-sm text-purple-100">
              Start a new quiz session for your class
            </p>
            <div className="mt-4 flex items-center text-sm font-semibold">
              Get Started
              <svg
                className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </Link>

          <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
            <div className="mb-4 text-4xl">📚</div>
            <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
              My Sessions
            </h3>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
              View and manage your quiz sessions
            </p>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              0
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Total sessions
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
            <div className="mb-4 text-4xl">👥</div>
            <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
              Total Students
            </h3>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
              Students who joined your sessions
            </p>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              0
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Unique students
            </div>
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="rounded-2xl bg-white p-8 shadow-lg dark:bg-gray-800">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Recent Sessions
            </h2>
            <Link
              href="/teacher/create"
              className="rounded-lg bg-purple-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-purple-600"
            >
              + New Session
            </Link>
          </div>

          {/* Empty State */}
          <div className="py-12 text-center">
            <div className="mb-4 text-6xl">📭</div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
              No sessions yet
            </h3>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              Create your first quiz session to get started
            </p>
            <Link
              href="/teacher/create"
              className="inline-flex items-center rounded-lg bg-purple-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-purple-600"
            >
              Create Session
              <svg
                className="ml-2 h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-8 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 p-6 dark:from-gray-800 dark:to-gray-700">
          <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
            💡 Quick Tips
          </h3>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Create engaging questions with multiple difficulty levels</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Share the 4-digit code with students to let them join</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Monitor real-time results to identify topics that need review</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Use analytics to track student progress over time</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
