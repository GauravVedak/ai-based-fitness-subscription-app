import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth0 } from "./lib/auth0";

// Routes that don't require authentication
const publicRoutes = [
  "/",
  "/auth/login",
  "/auth/logout",
  "/auth/callback",
  "/api/auth",
];

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + "/")
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Let Auth0 middleware handle auth routes
  const authResponse = await auth0.middleware(request);
  
  // If Auth0 middleware returned a response (redirect, etc.), use it
  if (authResponse.status !== 200 || pathname.startsWith("/auth/")) {
    return authResponse;
  }
  
  // Check if route requires authentication
  if (!isPublicRoute(pathname)) {
    // Get the session to check if user is authenticated
    const session = await auth0.getSession(request);
    
    if (!session) {
      // User is not authenticated, redirect to login
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("returnTo", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  return authResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
