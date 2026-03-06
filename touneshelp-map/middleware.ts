import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/jwt";

// Define which routes require which role
const PUBLIC_ROUTES  = ["/", "/cases", "/map", "/login", "/register"];
const USER_ROUTES    = ["/dashboard", "/cases/new", "/profile"];
const ADMIN_ROUTES   = ["/admin"];

export function middleware(req: NextRequest) {
        const accessToken  = req.cookies.get("access_token")?.value;
        const payload      = accessToken ? verifyAccessToken(accessToken) : null;
        const { pathname } = req.nextUrl;

// ── Allow public routes always ──
const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));
  if (isPublic) return NextResponse.next();

  // ── Not logged in → redirect to login ──
  if (!payload) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  // ── Admin route but user is not admin ──
  const isAdminRoute = ADMIN_ROUTES.some((r) => pathname.startsWith(r));
  if (isAdminRoute && payload.role !== "ADMIN") {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};