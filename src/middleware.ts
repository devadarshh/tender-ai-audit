import NextAuth from "next-auth";
import { authConfig } from "@/server/auth/config";

export const middleware = NextAuth(authConfig).auth;

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Logo or public images
     */
    "/((?!api|_next/static|_next/image|favicon.ico|$).*)",
  ],
};
