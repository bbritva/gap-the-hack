import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Image from "next/image";

export default async function AccountPage() {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-8">
            Account Information
          </h1>

          <div className="space-y-6">
            <div className="flex items-center gap-6">
              {session.user?.image && (
                <Image
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  width={80}
                  height={80}
                  className="rounded-full"
                />
              )}
              <div>
                <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                  {session.user?.name || "User"}
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400">
                  {session.user?.email}
                </p>
              </div>
            </div>

            <div className="border-t border-zinc-200 dark:border-zinc-700 pt-6">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
                Profile Details
              </h3>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    Name
                  </dt>
                  <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                    {session.user?.name || "Not provided"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    Email
                  </dt>
                  <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                    {session.user?.email || "Not provided"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    Account ID
                  </dt>
                  <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50 font-mono">
                    {session.user?.id || "Not available"}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="border-t border-zinc-200 dark:border-zinc-700 pt-6">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                Session Information
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                You are currently signed in with Google. Your session is secure and encrypted.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
