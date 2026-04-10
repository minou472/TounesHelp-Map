import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/response";

export async function GET(req: NextRequest) {
  try {
    const adminUser = await requireAdmin(req);
    if (!adminUser) return errorResponse("Admin access required", 403);

    // Get pending cases count (notifications for moderation)
    const pendingCasesCount = await prisma.tunisiaCase.count({
      where: { status: "SUFFERING" }
    });

    // Get recent user registrations (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentUsersCount = await prisma.user.count({
      where: {
        createdAt: { gte: sevenDaysAgo }
      }
    });

    // Get unresolved cases older than 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const oldUnresolvedCasesCount = await prisma.tunisiaCase.count({
      where: {
        status: { in: ["SUFFERING", "HELPING"] },
        createdAt: { lt: thirtyDaysAgo }
      }
    });

    const totalNotifications =
      pendingCasesCount + recentUsersCount + oldUnresolvedCasesCount;

    return successResponse({
      total: totalNotifications,
      breakdown: {
        pendingCases: pendingCasesCount,
        recentUsers: recentUsersCount,
        oldUnresolvedCases: oldUnresolvedCasesCount
      },
      details: {
        pendingCasesMessage:
          pendingCasesCount > 0
            ? `${pendingCasesCount} cas en attente de modération`
            : null,
        recentUsersMessage:
          recentUsersCount > 0
            ? `${recentUsersCount} nouveaux utilisateurs cette semaine`
            : null,
        oldCasesMessage:
          oldUnresolvedCasesCount > 0
            ? `${oldUnresolvedCasesCount} cas non résolus depuis plus de 30 jours`
            : null
      }
    });
  } catch (error) {
    console.error("[GET /notifications]", error);
    return errorResponse("Internal server error", 500);
  }
}
