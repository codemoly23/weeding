import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Routes that require authentication
const protectedRoutes = ["/admin", "/dashboard", "/account"];

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ["/login", "/register"];

// Admin allowed roles
const adminRoles = ["ADMIN", "SUPPORT_AGENT", "SALES_AGENT", "CONTENT_MANAGER"];
const customerRoles = ["CUSTOMER"];

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function hasRole(token: unknown, roles: string[]) {
  if (!token || typeof token !== "object") return false;
  const role = (token as { role?: unknown }).role;
  return typeof role === "string" && roles.includes(role);
}

function isSensitiveApiRoute(pathname: string) {
  if (
    pathname === "/api/admin/campaigns/process-scheduled" ||
    pathname === "/api/vendor/register" ||
    pathname.startsWith("/api/planner/share/")
  ) {
    return false;
  }

  return (
    pathname.startsWith("/api/admin/") ||
    pathname.startsWith("/api/vendor/") ||
    pathname.startsWith("/api/customer/") ||
    pathname.startsWith("/api/dashboard/") ||
    pathname.startsWith("/api/user/") ||
    pathname.startsWith("/api/planner/projects") ||
    pathname === "/api/planner/sync" ||
    pathname === "/api/orders" ||
    pathname === "/api/orders/bulk" ||
    pathname === "/api/orders/export" ||
    /^\/api\/orders\/[^/]+$/.test(pathname) ||
    /^\/api\/orders\/[^/]+\/(documents|invoice|notes|pay)$/.test(pathname)
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route requires protection
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Get the JWT token from the session cookie (edge-compatible)
  // NextAuth v5 uses "authjs.session-token" cookie name
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    cookieName: process.env.NODE_ENV === "production"
      ? "__Secure-authjs.session-token"
      : "authjs.session-token",
  });

  if (pathname.startsWith("/api/")) {
    if (!isSensitiveApiRoute(pathname)) {
      return NextResponse.next();
    }

    if (!token) {
      return jsonError("Unauthorized", 401);
    }

    if (pathname.startsWith("/api/admin/")) {
      return hasRole(token, adminRoles)
        ? NextResponse.next()
        : jsonError("Forbidden", 403);
    }

    if (pathname.startsWith("/api/vendor/")) {
      return hasRole(token, ["VENDOR"])
        ? NextResponse.next()
        : jsonError("Forbidden", 403);
    }

    if (pathname.startsWith("/api/planner/")) {
      return hasRole(token, customerRoles)
        ? NextResponse.next()
        : jsonError("Forbidden", 403);
    }

    if (
      pathname === "/api/orders/bulk" ||
      pathname === "/api/orders/export" ||
      /^\/api\/orders\/[^/]+$/.test(pathname) ||
      /^\/api\/orders\/[^/]+\/(invoice|notes)$/.test(pathname)
    ) {
      return hasRole(token, adminRoles)
        ? NextResponse.next()
        : jsonError("Forbidden", 403);
    }

    return NextResponse.next();
  }

  // If trying to access protected route without authentication
  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If trying to access admin routes, check for admin role
  if (pathname.startsWith("/admin") && token) {
    const userRole = token.role as string;
    if (!adminRoles.includes(userRole)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // /dashboard is customer-only — staff/vendor should be sent to their own portals
  if (pathname.startsWith("/dashboard") && token) {
    const userRole = token.role as string;
    if (adminRoles.includes(userRole)) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    if (userRole === "VENDOR") {
      return NextResponse.redirect(new URL("/vendor/dashboard", request.url));
    }
  }

  // If trying to access vendor portal, must be VENDOR role
  if (pathname.startsWith("/vendor") && !pathname.startsWith("/vendor/register") && token) {
    const userRole = token.role as string;
    if (userRole !== "VENDOR") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // If trying to access planner routes while authenticated, redirect staff/vendor away.
  // Anonymous users (no token) and customers can use /planner freely (localStorage mode).
  if (pathname.startsWith("/planner") && token) {
    const userRole = token.role as string;
    if (adminRoles.includes(userRole)) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    if (userRole === "VENDOR") {
      return NextResponse.redirect(new URL("/vendor/dashboard", request.url));
    }
  }

  // /vendor/register requires login but not VENDOR role (they're registering)
  if (pathname.startsWith("/vendor") && !pathname.startsWith("/vendor/register") && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If already authenticated and trying to access auth routes, redirect to appropriate dashboard
  if (isAuthRoute && token) {
    const userRole = token.role as string;
    if (adminRoles.includes(userRole)) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    if (userRole === "VENDOR") {
      return NextResponse.redirect(new URL("/vendor/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/account/:path*",
    "/vendor/:path*",
    "/planner/:path*",
    "/api/admin/:path*",
    "/api/vendor/:path*",
    "/api/customer/:path*",
    "/api/dashboard/:path*",
    "/api/user/:path*",
    "/api/planner/:path*",
    "/api/orders",
    "/api/orders/:path*",
    "/login",
    "/register",
  ],
};
