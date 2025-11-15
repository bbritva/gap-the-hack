import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { verifyTeacherPassword, createTeacher } from "@/lib/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      async profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    }),
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          const teacher = await verifyTeacherPassword(
            credentials.username as string,
            credentials.password as string
          );

          if (!teacher) {
            return null;
          }

          return {
            id: teacher.id.toString(),
            name: teacher.name,
            email: teacher.email,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/teacher/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // For Google OAuth, create or update teacher in database
      if (account?.provider === "google" && user.email) {
        try {
          await createTeacher(user.email, user.name || "Teacher");
        } catch (error) {
          console.error("Error creating teacher:", error);
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
    authorized: async ({ auth }) => {
      return !!auth;
    },
  },
  trustHost: true,
});
