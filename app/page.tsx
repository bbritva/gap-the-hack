import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <main className="flex w-full max-w-6xl flex-col items-center justify-center px-6 py-12">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="mb-4 text-5xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
            QuizClass
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Interactive learning made fun and engaging
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid w-full max-w-4xl gap-8 md:grid-cols-2">
          {/* Student Card */}
          <Link
            href="/student/join"
            className="group relative overflow-hidden rounded-3xl bg-white p-8 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl dark:bg-gray-800"
          >
            <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-blue-100 opacity-50 transition-transform duration-300 group-hover:scale-150 dark:bg-blue-900"></div>
            
            <div className="relative z-10">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-500 text-4xl shadow-lg">
                🎓
              </div>
              
              <h2 className="mb-3 text-3xl font-bold text-gray-900 dark:text-white">
                I'm a Student
              </h2>
              
              <p className="mb-6 text-gray-600 dark:text-gray-300">
                Join your class with a code and start learning through fun, interactive quizzes
              </p>
              
              <div className="flex items-center text-blue-600 dark:text-blue-400">
                <span className="font-semibold">Join Class</span>
                <svg
                  className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-2"
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
            </div>
          </Link>

          {/* Teacher Card */}
          <Link
            href="/teacher/login"
            className="group relative overflow-hidden rounded-3xl bg-white p-8 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl dark:bg-gray-800"
          >
            <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-purple-100 opacity-50 transition-transform duration-300 group-hover:scale-150 dark:bg-purple-900"></div>
            
            <div className="relative z-10">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-purple-500 text-4xl shadow-lg">
                👨‍🏫
              </div>
              
              <h2 className="mb-3 text-3xl font-bold text-gray-900 dark:text-white">
                I'm a Teacher
              </h2>
              
              <p className="mb-6 text-gray-600 dark:text-gray-300">
                Create engaging quizzes, track student progress, and get real-time insights
              </p>
              
              <div className="flex items-center text-purple-600 dark:text-purple-400">
                <span className="font-semibold">Go to Dashboard</span>
                <svg
                  className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-2"
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
            </div>
          </Link>
        </div>

        {/* Features */}
        <div className="mt-20 grid w-full max-w-4xl gap-6 text-center md:grid-cols-3">
          <div className="rounded-2xl bg-white/50 p-6 backdrop-blur-sm dark:bg-gray-800/50">
            <div className="mb-3 text-3xl">⚡</div>
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
              Real-time Engagement
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Live quizzes with instant feedback and leaderboards
            </p>
          </div>
          
          <div className="rounded-2xl bg-white/50 p-6 backdrop-blur-sm dark:bg-gray-800/50">
            <div className="mb-3 text-3xl">🎮</div>
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
              Gamified Learning
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Points, streaks, and achievements to boost motivation
            </p>
          </div>
          
          <div className="rounded-2xl bg-white/50 p-6 backdrop-blur-sm dark:bg-gray-800/50">
            <div className="mb-3 text-3xl">📊</div>
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
              Smart Analytics
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Track understanding and identify knowledge gaps
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
