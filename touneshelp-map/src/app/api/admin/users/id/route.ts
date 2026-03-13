import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// PATCH /api/admin/users/:id — block/unblock or promote to admin
export async function PATCH(req: NextRequest, { params }: any) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Admins only" }, { status: 403 });
    }

    const { isActive, role } = await req.json();

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...(isActive !== undefined && { isActive }),
        ...(role !== undefined && { role }),
      },
    });

    return NextResponse.json({
      message: "User updated",
      user: { id: updated.id, role: updated.role, isActive: updated.isActive },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
