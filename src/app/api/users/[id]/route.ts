import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/response";
import { z } from "zod";
import { Role, UserStatus } from "@/lib/enums";

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  skills: z.union([z.array(z.string()), z.string()]).optional(),
  avatar: z.string().optional(),
  role: z.nativeEnum(Role).optional(),
  status: z.nativeEnum(UserStatus).optional(),
});

// GET /api/users/:id — public
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, email: true, phone: true,
        role: true, status: true, bio: true, avatar: true,
        rating: true, helpedCount: true, receivedHelpCount: true,
        skills: true, casesCreated: true, createdAt: true,
        createdCases: {
          take: 5,
          orderBy: { createdAt: "desc" },
          select: { id: true, title: true, status: true, governorate: true, createdAt: true },
        },
      },
    });

    if (!user) return errorResponse("User not found", 404);
    return successResponse(user);
  } catch (error) {
    console.error("[GET /users/:id]", error);
    return errorResponse("Internal server error", 500);
  }
}

// PATCH /api/users/:id — update own profile or admin
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authUser = await getAuthUser(req);
    if (!authUser) return errorResponse("Authentication required", 401);

    const isSelf = authUser.userId === id;
    const isAdmin = authUser.role === "ADMIN";
    if (!isSelf && !isAdmin) return errorResponse("Forbidden", 403);

    const body = await req.json();

    // Regular users cannot change their own role or status
    if (!isAdmin) {
      delete body.role;
      delete body.status;
    }

    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues.map((e) => e.message).join(", "), 422);
    }

    const updateData = {
      ...parsed.data,
      skills: Array.isArray(parsed.data.skills)
        ? parsed.data.skills.join(",")
        : parsed.data.skills,
    };

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true, name: true, email: true, phone: true,
        role: true, status: true, bio: true, avatar: true,
        skills: true, rating: true, updatedAt: true,
      },
    });

    return successResponse(updatedUser);
  } catch (error) {
    console.error("[PATCH /users/:id]", error);
    return errorResponse("Internal server error", 500);
  }
}

// DELETE /api/users/:id — self or admin (admin accounts protected)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authUser = await getAuthUser(req);
    if (!authUser) return errorResponse("Authentication required", 401);

    const isSelf = authUser.userId === id;
    const isAdmin = authUser.role === "ADMIN";
    if (!isSelf && !isAdmin) return errorResponse("Forbidden", 403);

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) return errorResponse("User not found", 404);

    // Never allow deleting admin accounts.
    if (targetUser.role === Role.ADMIN) {
      return errorResponse("Admin accounts cannot be deleted", 403);
    }

    await prisma.$transaction(async (tx) => {
      await tx.helpRequest.deleteMany({ where: { postedById: id } });
      await tx.tunisiaCase.deleteMany({ where: { createdById: id } });
      await tx.user.delete({ where: { id } });
    });

    return successResponse({ message: "User deleted successfully" });
  } catch (error) {
    console.error("[DELETE /users/:id]", error);
    return errorResponse("Internal server error", 500);
  }
}
