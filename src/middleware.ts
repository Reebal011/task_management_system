import { NextRequest, NextResponse } from "next/server";
console.log("🔍 Middleware called");

const PUBLIC_ROUTES = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log("🔍 Middleware called for:", pathname);

  // Skip middleware for public routes
  if (PUBLIC_ROUTES.includes(pathname)) {
    console.log("✅ Skipping public route:", pathname);
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;
  console.log("🔑 Token found:", !!token);

  // Handle root route
  if (pathname === "/") {
    console.log("🏠 Handling root route");
    if (!token) {
      console.log("❌ No token, redirecting to login");
      return NextResponse.redirect(new URL("/login", request.url));
    } else {
      console.log("✅ Token exists, redirecting to dashboard");
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Handle dashboard routes
  if (pathname.startsWith("/dashboard")) {
    console.log("📊 Handling dashboard route");
    if (!token) {
      console.log("❌ No token for dashboard, redirecting to login");
      return NextResponse.redirect(new URL("/login", request.url));
    }
    console.log("✅ Token exists for dashboard, allowing access");
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};