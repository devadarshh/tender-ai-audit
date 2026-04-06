import { type DefaultSession, type NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

/**
 * BRICKANTA AUTH CONFIG: 
 * Using Google for senior enterprise authentication.
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

export const authConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],

  pages: {
    signIn: "/", // Root is the auth page
  },
  callbacks: {
    authorized: ({ auth, request: { nextUrl } }) => {
      const isLoggedIn = !!auth?.user;
      const isProtectedRoute = 
        nextUrl.pathname.startsWith("/upload") || 
        nextUrl.pathname.startsWith("/overview") || 
        nextUrl.pathname.startsWith("/analysis");

      if (isProtectedRoute) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      }
      return true;
    },
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token?.sub as string,
      },
    }),
  },
} satisfies NextAuthConfig;
