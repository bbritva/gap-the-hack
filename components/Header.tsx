import { auth } from "@/auth";
import { SignInButton } from "./SignInButton";
import { SignOutButton } from "./SignOutButton";
import Link from "next/link";

export async function Header() {
  const session = await auth();

  return (
    <header className="w-full border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              MyApp
            </Link>
            <nav className="hidden md:flex gap-6">
              <Link
                href="/"
                className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors"
              >
                Home
              </Link>
              {session && (
                <Link
                  href="/account"
                  className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors"
                >
                  Account
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {session ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-zinc-600 dark:text-zinc-400 hidden sm:block">
                  {session.user?.email}
                </span>
                <SignOutButton />
              </div>
            ) : (
              <SignInButton />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
