import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  getPagination
} from "@/lib/response";
import { z } from "zod";
import { Role, UserStatus } from "@/lib/enums";
import bcrypt  from "bcryptjs";

// Validation schema for creating new users - checks all required fields
const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  role: z.nativeEnum(Role).default(Role.USER),
  status: z.nativeEnum(UserStatus).default(UserStatus.ACTIVE)
});

// Schema for updating user info (partial updates OK)
const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  role: z.nativeEnum(Role).optional(),
  status: z.nativeEnum(UserStatus).optional()
});

// GET /api/users - Admin only: list all users with filters/pagination
export async function GET(req: NextRequest) {
  try {
    const adminUser = await requireAdmin(req);
    if (!adminUser) return errorResponse("Admin access required", 403);

    const { searchParams } = req.nextUrl;
    const { page, limit, skip } = getPagination(searchParams);
    const role = searchParams.get("role") as Role | null;
    const status = searchParams.get("status") as UserStatus | null;
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};
    if (role) where.role = role;
    if (status) where.status = status;
    if (search) {
      // SQLite does not support mode: "insensitive"; use `contains` only
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          avatar: true,
          rating: true,
          helpedCount: true,
          casesCreated: true,
          createdAt: true
        }
      }),
      prisma.user.count({ where })
    ]);

    return successResponse({ users, total });
  } catch (error) {
    console.error("[GET /users]", error);
    return errorResponse("Internal server error", 500);
  }
}

// POST /api/users - Admin creates new user account
export async function POST(req: NextRequest) {
  try {
    const adminUser = await requireAdmin(req);
    if (!adminUser) return errorResponse("Admin access required", 403);

    const body = await req.json();
    const parsed = createUserSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(
        parsed.error.issues.map((e) => e.message).join(", "),
        422
      );
    }

    const { name, email, password, phone, role, status } = parsed.data;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return errorResponse("Email already registered", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
        phone,
        role,
        status
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true
      }
    });

    return successResponse(newUser, 201);
  } catch (error) {
    console.error("[POST /users]", error);
    return errorResponse("Internal server error", 500);
  }
}
