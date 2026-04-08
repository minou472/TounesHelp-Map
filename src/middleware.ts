import { NextRequest, NextResponse } from "next/server";
import { verifyToken, extractTokenFromHeader } from "./lib/jwt";

const PUBLIC_ROUTES = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/cases",
  "/api/stats",
  "/api/places",
];

const ADMIN_ROUTES = ["/api/users", "/api/admin"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: corsHeaders(),
    });
  }

  // Add CORS headers to all API responses
  const response = NextResponse.next();
  const origin = req.headers.get("origin") || "";
  const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    process.env.FRONTEND_URL || "",
  ];

  if (allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  // Skip auth for public routes (GET requests)
  const isPublicGet =
    PUBLIC_ROUTES.some((r) => pathname.startsWith(r)) &&
    req.method === "GET";

  if (isPublicGet) return response;

  // Check admin routes
  const isAdminRoute = ADMIN_ROUTES.some((r) => pathname.startsWith(r));

  // For protected routes, validate token
  if (!isPublicGet && pathname.startsWith("/api/")) {
    const token = extractTokenFromHeader(req.headers.get("authorization"));
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401, headers: corsHeaders() }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired token" },
        { status: 401, headers: corsHeaders() }
      );
    }

    if (isAdminRoute && payload.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403, headers: corsHeaders() }
      );
    }
  }

  return response;
}

function corsHeaders(): HeadersInit {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export const config = {
  matcher: "/api/:path*",
};
