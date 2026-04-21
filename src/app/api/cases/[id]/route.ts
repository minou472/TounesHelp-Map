import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/response";
import { CaseStatus } from "@/lib/enums";
import { z } from "zod";

const updateCaseSchema = z.object({
  title: z.string().min(5).optional(),
  description: z.string().min(20).optional(),
  fullDescription: z.string().optional(),
  governorate: z.string().optional(),
  city: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  status: z.nativeEnum(CaseStatus).optional(),
  victimName: z.string().optional(),
  victimPhone: z.string().optional(),
  victimEmail: z.string().email().optional(),
  peopleAffected: z.number().min(1).optional(),
  images: z.array(z.string()).optional(),
  videoUrl: z.string().optional(),
}).strict();

// GET /api/cases/:id
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tunisiaCase = await prisma.tunisiaCase.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, avatar: true, rating: true } },
        helpers: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
        },
        _count: { select: { helpers: true } },
      },
    });

    if (!tunisiaCase) return errorResponse("Case not found", 404);

    return successResponse(tunisiaCase);
  } catch (error) {
    console.error("[GET /cases/:id]", error);
    return errorResponse("Internal server error", 500);
  }
}

// PUT /api/cases/:id — update (auth required, own case or admin)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authUser = await getAuthUser(req);
    if (!authUser) return errorResponse("Authentication required", 401);

    const existingCase = await prisma.tunisiaCase.findUnique({ where: { id } });
    if (!existingCase) return errorResponse("Case not found", 404);

    const isOwner = existingCase.createdById === authUser.userId;
    const isAdmin = authUser.role === "ADMIN";
    if (!isOwner && !isAdmin) return errorResponse("Forbidden", 403);

    const body = await req.json();
    const parsed = updateCaseSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues.map((e) => e.message).join(", "), 422);
    }

    const { images, ...caseDataWithoutImages } = parsed.data;

    const updatedCase = await prisma.tunisiaCase.update({
      where: { id },
      data: {
        ...caseDataWithoutImages,
        ...(images ? { imagesJson: JSON.stringify(images) } : {}),
        ...(parsed.data.status === "RESOLVED" ? { dateResolved: new Date() } : {}),
      },
    });

    return successResponse(updatedCase);
  } catch (error) {
    console.error("[PUT /cases/:id]", error);
    return errorResponse("Internal server error", 500);
  }
}

// DELETE /api/cases/:id — own case or admin
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authUser = await getAuthUser(req);
    if (!authUser) return errorResponse("Authentication required", 401);

    const existingCase = await prisma.tunisiaCase.findUnique({ where: { id } });
    if (!existingCase) return errorResponse("Case not found", 404);

    const isOwner = existingCase.createdById === authUser.userId;
    const isAdmin = authUser.role === "ADMIN";
    if (!isOwner && !isAdmin) return errorResponse("Forbidden", 403);

    await prisma.tunisiaCase.delete({ where: { id } });

    return successResponse({ message: "Case deleted successfully" });
  } catch (error) {
    console.error("[DELETE /cases/:id]", error);
    return errorResponse("Internal server error", 500);
  }
}
