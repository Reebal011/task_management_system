import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

console.log("🔍 Middleware called");

// Route configurations
const ROUTES = {
  PUBLIC: ["/login", "/register"],
  ADMIN_ONLY: ["/dashboard/admin", "/dashboard/tasks/create"],
  USER_ONLY: ["/dashboard/user"],
};

// Helper function to check if path matches any route pattern
function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some((route) => {
    // Exact match
    if (route === pathname) return true;
    // Prefix match for nested routes
    if (route.endsWith("/") && pathname.startsWith(route)) return true;
    if (!route.endsWith("/") && pathname.startsWith(route + "/")) return true;
    return false;
  });
}

// Helper function to get user role from token
async function getUserRole(token: string): Promise<"admin" | "user" | null> {
  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "your-secret-key"
    );
    const { payload } = await jwtVerify(token, secret);

    // Extract role from JWT payload
    const role = payload.role as string;

    if (role === "admin" || role === "user") {
      return role;
    }

    return null;
  } catch (error) {
    console.log("❌ Error decoding token:", error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  // Handle root route specifically FIRST
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

  console.log("🔍 Middleware called for:", pathname);

  // Skip middleware for public routes
  if (matchesRoute(pathname, ROUTES.PUBLIC)) {
    console.log("✅ Public route accessed:", pathname);
    return NextResponse.next();
  }

  console.log("🔑 Token found:", !!token);

  // Check if route requires authentication
  const requiresAuth =
    matchesRoute(pathname, ROUTES.ADMIN_ONLY) ||
    matchesRoute(pathname, ROUTES.USER_ONLY);

  if (requiresAuth && !token) {
    console.log(
      "❌ Authentication required but no token found, redirecting to login"
    );
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!token) {
    console.log("✅ No auth required, allowing access");
    return NextResponse.next();
  }

  // Get user role
  const userRole = await getUserRole(token);
  console.log("👤 User role:", userRole);

  if (!userRole) {
    console.log("❌ Invalid token, redirecting to login");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Check admin-only routes
  if (matchesRoute(pathname, ROUTES.ADMIN_ONLY)) {
    if (userRole !== "admin") {
      console.log("❌ Admin access required, redirecting to dashboard");
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    console.log("✅ Admin access granted");
    return NextResponse.next();
  }

  // Check user-only routes
  if (matchesRoute(pathname, ROUTES.USER_ONLY)) {
    if (userRole !== "user") {
      console.log("❌ User access required, redirecting to dashboard");
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    console.log("✅ User access granted");
    return NextResponse.next();
  }

  // All other routes are automatically shared (accessible to both admin and user)
  if (userRole === "admin" || userRole === "user") {
    console.log("✅ Shared route access granted (auto-shared)");
    return NextResponse.next();
  }

  // Default: allow access for authenticated users
  console.log("✅ Default access granted");
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
