import { auth } from "@/auth";
import Link from "next/link";

export default async function Home() {
  const session = await auth();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-6xl">
            Welcome to MyApp
          </h1>
          <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            A modern Next.js application with Google authentication. Sign in to access your account
            and explore personalized features.
          </p>
          <div className="mt-10 flex items-center justify-center gap-6">
            {session ? (
              <Link
                href="/account"
                className="rounded-lg bg-zinc-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-zinc-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Go to Account
              </Link>
            ) : (
              <div className="text-zinc-600 dark:text-zinc-400">
                Sign in with Google to get started
              </div>
            )}
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm">
            <div className="text-zinc-900 dark:text-zinc-50 text-xl font-semibold mb-2">
              🔐 Secure Authentication
            </div>
            <p className="text-zinc-600 dark:text-zinc-400">
              Sign in securely with your Google account using OAuth 2.0
            </p>
          </div>
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm">
            <div className="text-zinc-900 dark:text-zinc-50 text-xl font-semibold mb-2">
              ⚡ Fast & Modern
            </div>
            <p className="text-zinc-600 dark:text-zinc-400">
              Built with Next.js 15 and React 19 for optimal performance
            </p>
          </div>
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm">
            <div className="text-zinc-900 dark:text-zinc-50 text-xl font-semibold mb-2">
              🎨 Beautiful Design
            </div>
            <p className="text-zinc-600 dark:text-zinc-400">
              Styled with Tailwind CSS for a clean and responsive interface
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
