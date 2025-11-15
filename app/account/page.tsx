import { auth } from "@/auth"
import Image from "next/image"
import Link from "next/link"

export default async function AccountPage() {
  const session = await auth()

  if (!session?.user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link
              href="/"
              className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Home
            </Link>
            <form
              action={async () => {
                "use server"
                const { signOut } = await import("@/auth")
                await signOut()
              }}
            >
              <button
                type="submit"
                className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-12">
            <h1 className="text-3xl font-bold text-white mb-2">User Account</h1>
            <p className="text-blue-100">Manage your profile information</p>
          </div>

          <div className="px-8 py-12">
            <div className="flex flex-col items-center mb-8">
              {session.user.image && (
                <div className="mb-6">
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    width={120}
                    height={120}
                    className="rounded-full border-4 border-blue-100 dark:border-gray-700"
                  />
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Full Name
                </h2>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {session.user.name || "Not provided"}
                </p>
              </div>

              <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Email Address
                </h2>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {session.user.email || "Not provided"}
                </p>
              </div>

              <div className="pb-6">
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Account ID
                </h2>
                <p className="text-sm font-mono text-gray-600 dark:text-gray-300 break-all">
                  {session.user.id || "Not available"}
                </p>
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Your account is authenticated via Google OAuth. To update your information,
                please visit your Google Account settings.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
