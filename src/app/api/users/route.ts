import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { successResponse, errorResponse, paginatedResponse, getPagination } from "@/lib/response";
import { z } from "zod";
import { Role, UserStatus } from "@/lib/enums";

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  role: z.nativeEnum(Role).optional(),
  status: z.nativeEnum(UserStatus).optional(),
});

// GET /api/users — admin only
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
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true, name: true, email: true, phone: true,
          role: true, status: true, avatar: true, rating: true,
          helpedCount: true, casesCreated: true, createdAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return paginatedResponse(users, total, page, limit);
  } catch (error) {
    console.error("[GET /users]", error);
    return errorResponse("Internal server error", 500);
  }
}
