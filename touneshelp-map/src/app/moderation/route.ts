import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

// GET /api/moderation — get all pending cases for moderation
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can access moderation
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const pendingCases = await prisma.case.findMany({
      where: {
        status: "PENDING_REVIEW",
        isDeleted: false,
      },
      include: {
        author: { select: { id: true, email: true } },
        contacts: true,
        assistants: true,
        images: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(pendingCases);
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
