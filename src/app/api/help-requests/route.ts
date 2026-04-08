import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { successResponse, errorResponse, paginatedResponse, getPagination } from "@/lib/response";
import { z } from "zod";
import { Urgency } from "@/lib/enums";

const createRequestSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description min 20 characters"),
  category: z.enum(["tutoring", "food", "transportation", "errands", "companionship", "tech-help", "other"]),
  location: z.string().min(3, "Location is required"),
  urgency: z.enum([Urgency.LOW, Urgency.MEDIUM, Urgency.HIGH]).default(Urgency.MEDIUM),
  helpersNeeded: z.number().min(1).default(1),
});

// GET /api/help-requests
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const { page, limit, skip } = getPagination(searchParams);
    const category = searchParams.get("category");
    const urgency = searchParams.get("urgency") as Urgency | null;
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};
    if (category) where.category = category;
    if (urgency) where.urgency = urgency;
    if (status) where.status = status;

    const [requests, total] = await Promise.all([
      prisma.helpRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          postedBy: { select: { id: true, name: true, avatar: true, rating: true } },
          helpers: { select: { id: true, name: true, avatar: true } },
        },
      }),
      prisma.helpRequest.count({ where }),
    ]);

    return paginatedResponse(requests, total, page, limit);
  } catch (error) {
    console.error("[GET /help-requests]", error);
    return errorResponse("Internal server error", 500);
  }
}

// POST /api/help-requests
export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) return errorResponse("Authentication required", 401);

    const body = await req.json();
    const parsed = createRequestSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues.map((e) => e.message).join(", "), 422);
    }

    const helpRequest = await prisma.helpRequest.create({
      data: { ...parsed.data, postedById: authUser.userId },
      include: {
        postedBy: { select: { id: true, name: true, avatar: true } },
      },
    });

    return successResponse(helpRequest, 201);
  } catch (error) {
    console.error("[POST /help-requests]", error);
    return errorResponse("Internal server error", 500);
  }
}
