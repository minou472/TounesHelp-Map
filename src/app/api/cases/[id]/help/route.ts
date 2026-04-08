import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/response";

// POST /api/cases/:id/help — current user offers to help
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authUser = await getAuthUser(req);
    if (!authUser) return errorResponse("Authentication required", 401);

    const tunisiaCase = await prisma.tunisiaCase.findUnique({ where: { id } });
    if (!tunisiaCase) return errorResponse("Case not found", 404);

    if (tunisiaCase.status === "RESOLVED") {
      return errorResponse("This case is already resolved", 400);
    }

    // Check if user already joined
    const existing = await prisma.caseHelper.findUnique({
      where: { caseId_userId: { caseId: id, userId: authUser.userId } },
    });

    if (existing) {
      return errorResponse("You are already helping with this case", 409);
    }

    await prisma.caseHelper.create({
      data: { caseId: id, userId: authUser.userId },
    });

    // Update case status to HELPING if it was SUFFERING
    if (tunisiaCase.status === "SUFFERING") {
      await prisma.tunisiaCase.update({
        where: { id },
        data: { status: "HELPING" },
      });
    }

    // Increment user's helpedCount
    await prisma.user.update({
      where: { id: authUser.userId },
      data: { helpedCount: { increment: 1 } },
    });

    return successResponse({ message: "You are now helping with this case!" }, 201);
  } catch (error) {
    console.error("[POST /cases/:id/help]", error);
    return errorResponse("Internal server error", 500);
  }
}

// DELETE /api/cases/:id/help — withdraw from helping
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authUser = await getAuthUser(req);
    if (!authUser) return errorResponse("Authentication required", 401);

    await prisma.caseHelper.delete({
      where: { caseId_userId: { caseId: id, userId: authUser.userId } },
    });

    await prisma.user.update({
      where: { id: authUser.userId },
      data: { helpedCount: { decrement: 1 } },
    });

    return successResponse({ message: "Withdrawn from helping this case" });
  } catch (error) {
    console.error("[DELETE /cases/:id/help]", error);
    return errorResponse("Internal server error", 500);
  }
}
