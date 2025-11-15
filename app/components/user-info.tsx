import { auth } from "@/auth";
import { SignOut } from "./sign-out";
import Image from "next/image";

export async function UserInfo() {
  const session = await auth();

  if (!session?.user) return null;

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center gap-4">
        {session.user.image && (
          <Image
            src={session.user.image}
            alt={session.user.name || "User"}
            width={48}
            height={48}
            className="rounded-full"
          />
        )}
        <div className="flex flex-col">
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {session.user.name}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {session.user.email}
          </p>
        </div>
      </div>
      <SignOut />
    </div>
  );
}
