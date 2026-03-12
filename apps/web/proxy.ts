import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/api/auth", "/auth"];

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow auth API and auth pages (login/signup)
  const isPublic = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
  if (isPublic) {
    // Logged-in user on /auth → redirect to home
    const sessionCookie = getSessionCookie(request);
    if (pathname.startsWith("/auth") && sessionCookie) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // Protected route: no session → redirect to login
  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|[^/]+\\.[^/]+$).*)"],
};
