import NextAuth from "next-auth";
import { authConfig } from "@/server/auth/config";

export const middleware = NextAuth(authConfig).auth;

export const config = {
  matcher: [
    /*
     * Match all request paths that require authentication:
     */
    "/overview/:path*",
    "/upload/:path*",
    "/analysis/:path*",
    "/api/analyze/:path*",
  ],
};
